import { app, BrowserWindow, ipcMain, net, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import https from 'node:https'
import { exec, execFile, execFileSync, ChildProcess } from 'node:child_process'
import Store from 'electron-store'

const store = new Store()
const runningProcesses = new Map<string, ChildProcess>()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    backgroundColor: '#ffffff',
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Window control IPC handlers
  ipcMain.on('window-minimize', () => win?.minimize())
  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
      win.unmaximize()
      win.webContents.send('window-maximized', false)
    } else {
      win?.maximize()
      win?.webContents.send('window-maximized', true)
    }
  })
  ipcMain.on('window-close', () => win?.close())

  ipcMain.handle('window-minimize', () => win?.minimize())
  ipcMain.handle('window-maximize', () => {
    if (win?.isMaximized()) {
      win.unmaximize()
      return false
    } else {
      win?.maximize()
      return true
    }
  })
  ipcMain.handle('window-close', () => win?.close())
  ipcMain.handle('window-is-maximized', () => win?.isMaximized() ?? false)

  ipcMain.handle('store-get', (_event, key) => store.get(key))
  ipcMain.handle('store-set', (_event, key, value) => {
    store.set(key, value)
  })

  // System Stats
  ipcMain.handle('get-app-memory', () => {
    const metrics = app.getAppMetrics()
    const totalKb = metrics.reduce((acc, metric) => acc + metric.memory.workingSetSize, 0)
    return (totalKb / 1024).toFixed(1) // Return MB
  })

  ipcMain.handle('clear-cache', async () => {
    if (win) {
      await win.webContents.session.clearCache()
      return true
    }
    return false
  })

  ipcMain.handle('get-cache-size', async () => {
    if (win) {
      const bytes = await win.webContents.session.getCacheSize()
      return (bytes / (1024 * 1024)).toFixed(2)
    }
    return '0.00'
  })

  // Installation pipeline (Download & Extract)
  ipcMain.handle('install-software', async (event, payload: { softwareId: string, version: string, url: string }) => {
    const { softwareId, version, url } = payload
    const compoundId = `${softwareId}_${version.replace(/\./g, '_')}`

    const downloadsDir = path.join(app.getPath('userData'), 'downloads')
    const binDir = path.join(app.getPath('userData'), 'bin', compoundId)

    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true })
    if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true })

    const zipPath = path.join(downloadsDir, `${compoundId}.zip`)

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(zipPath)
      const request = net.request(url)

      request.on('response', (response) => {
        const contentLengthRaw = response.headers['content-length']
        let totalBytes = 0
        if (contentLengthRaw) {
          totalBytes = Array.isArray(contentLengthRaw)
            ? parseInt(contentLengthRaw[0], 10)
            : parseInt(contentLengthRaw as string, 10)
        }

        let downloadedBytes = 0
        let lastPercent = 0

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length
          fileStream.write(chunk)

          if (totalBytes > 0) {
            const percent = Math.min(99, Math.floor((downloadedBytes / totalBytes) * 100))
            if (percent > lastPercent) {
              lastPercent = percent
              event.sender.send('install-progress', { id: compoundId, percent })
            }
          }
        })

        response.on('end', () => {
          fileStream.end()
          event.sender.send('install-progress', { id: compoundId, percent: 'extracting' })

          exec(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${binDir}' -Force"`, (err) => {
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)
            if (err) {
              reject(err)
            } else {
              event.sender.send('install-progress', { id: compoundId, percent: 'done' })
              resolve(compoundId)
            }
          })
        })
      })

      request.on('error', (err) => {
        fileStream.close()
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)
        reject(err)
      })

      request.end()
    })
  })

  // Start & Stop Native Services
  ipcMain.handle('start-service', async (_event, instanceId: string) => {
    if (runningProcesses.has(instanceId)) return true;

    const binDir = path.join(app.getPath('userData'), 'bin', instanceId);
    if (!fs.existsSync(binDir)) throw new Error('Binary directory missing');

    const softwareId = instanceId.split('_')[0];
    const etcDir = path.join(app.getPath('userData'), 'etc', softwareId);
    if (!fs.existsSync(etcDir)) fs.mkdirSync(etcDir, { recursive: true });

    const findExe = (dir: string, exeName: string): string | null => {
      if (!fs.existsSync(dir)) return null;
      const files = fs.readdirSync(dir)
      const exactMatch = files.find(f => f.toLowerCase() === exeName.toLowerCase())
      if (exactMatch) return path.join(dir, exactMatch)

      for (const file of files) {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
          const res = findExe(fullPath, exeName)
          if (res) return res
        }
      }
      return null
    }

    if (instanceId.startsWith('phpmyadmin')) {
      const phpDirParent = path.join(app.getPath('userData'), 'bin');
      const phpDirName = fs.readdirSync(phpDirParent).find(dir => dir.startsWith('php_'));
      if (!phpDirName) throw new Error("Hãy Cài đặt PHP (NTS) trước để cấp môi trường Web cho phpMyAdmin!");

      const phpExe = findExe(path.join(phpDirParent, phpDirName), 'php.exe');
      if (!phpExe) throw new Error("php.exe không tồn tại trong thư mục cài đặt PHP!");

      const pmaDirName = fs.readdirSync(binDir).find(d => fs.statSync(path.join(binDir, d)).isDirectory());
      const pmaRoot = pmaDirName ? path.join(binDir, pmaDirName) : binDir;

      const process = execFile(phpExe, ['-S', '127.0.0.1:8080', '-t', pmaRoot], { cwd: pmaRoot });
      runningProcesses.set(instanceId, process);
      process.on('close', () => runningProcesses.delete(instanceId));

      shell.openExternal('http://127.0.0.1:8080');
      return true;
    }

    let targetExeName = '';
    if (instanceId.startsWith('apache')) targetExeName = 'httpd.exe';
    else if (instanceId.startsWith('nginx')) targetExeName = 'nginx.exe';
    else if (instanceId.startsWith('mysql')) targetExeName = 'mysqld.exe';
    else if (instanceId.startsWith('postgresql')) targetExeName = 'postgres.exe';
    else if (instanceId.startsWith('mongodb')) targetExeName = 'mongod.exe';
    else if (instanceId.startsWith('redis')) targetExeName = 'redis-server.exe';
    else return false;

    // Exe finder logic shifted strictly upward

    const exePath = findExe(binDir, targetExeName);
    if (!exePath) throw new Error(`${targetExeName} not found in ${binDir}`);

    let args: string[] = [];
    if (instanceId.startsWith('mysql')) {
      const dataDir = path.join(binDir, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        try {
          execFileSync(exePath, ['--initialize-insecure', `--datadir=${dataDir}`]);
        } catch (e) {
          console.error('MySQL Init Error', e);
        }
      }
      args = ['--console', `--datadir=${dataDir}`];
    } else if (instanceId.startsWith('mongodb')) {
      const dataDir = path.join(binDir, 'data', 'db');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      args = ['--dbpath', dataDir];
    } else if (instanceId.startsWith('nginx')) {
      const confDest = path.join(etcDir, 'nginx.conf');
      const nginxRoot = path.dirname(exePath);
      if (!fs.existsSync(confDest)) {
        const defaultConf = findExe(binDir, 'nginx.conf');
        if (defaultConf) fs.copyFileSync(defaultConf, confDest);
      }
      if (fs.existsSync(confDest)) args = ['-c', confDest, '-p', nginxRoot];
    } else if (instanceId.startsWith('apache')) {
      const confDest = path.join(etcDir, 'httpd.conf');
      const apacheRoot = path.dirname(path.dirname(exePath));
      if (!fs.existsSync(confDest)) {
        const defaultConf = findExe(binDir, 'httpd.conf');
        if (defaultConf) {
          let content = fs.readFileSync(defaultConf, 'utf-8');
          // Auto-patch SRVROOT for windows apache
          content = content.replace(/Define SRVROOT .*/g, `Define SRVROOT "${apacheRoot.replace(/\\/g, '/')}"`);
          fs.writeFileSync(confDest, content);
        }
      }
      if (fs.existsSync(confDest)) args = ['-d', apacheRoot, '-f', confDest];
    }

    const process = execFile(exePath, args, { cwd: path.dirname(exePath) });
    runningProcesses.set(instanceId, process);

    process.on('close', () => {
      runningProcesses.delete(instanceId);
    });

    return true;
  })

  ipcMain.handle('stop-service', async (_event, instanceId: string) => {
    const process = runningProcesses.get(instanceId);
    if (process && process.pid) {
      exec(`taskkill /PID ${process.pid} /T /F`, () => { });
    }

    return new Promise((resolve) => {
      let targetExeName = '';
      if (instanceId.startsWith('apache')) targetExeName = 'httpd.exe';
      else if (instanceId.startsWith('nginx')) targetExeName = 'nginx.exe';
      else if (instanceId.startsWith('mysql')) targetExeName = 'mysqld.exe';
      else if (instanceId.startsWith('postgresql')) targetExeName = 'postgres.exe';
      else if (instanceId.startsWith('mongodb')) targetExeName = 'mongod.exe';
      else if (instanceId.startsWith('redis')) targetExeName = 'redis-server.exe';

      if (targetExeName) {
        exec(`taskkill /IM ${targetExeName} /F /T`, () => {
          runningProcesses.delete(instanceId);
          resolve(true);
        });
      } else {
        runningProcesses.delete(instanceId);
        resolve(true);
      }
    });
  })

  ipcMain.handle('open-service-dir', async (_event, instanceId: string) => {
    const softwareId = instanceId.split('_')[0];
    const etcDir = path.join(app.getPath('userData'), 'etc', softwareId);
    if (!fs.existsSync(etcDir)) {
      fs.mkdirSync(etcDir, { recursive: true });
    }
    shell.openPath(etcDir);
    return true;
  })

  // Integrated Terminal (WezTerm)
  ipcMain.handle('open-terminal', async (event: Electron.IpcMainInvokeEvent) => {
    const toolsDir = path.join(app.getPath('userData'), 'tools')
    const weztermDir = path.join(toolsDir, 'WezTerm')
    const binRoot = path.join(app.getPath('userData'), 'bin')

    const customPaths = new Set<string>()
    const targets = ['php.exe', 'node.exe', 'go.exe', 'mysql.exe', 'psql.exe', 'mongod.exe', 'httpd.exe', 'nginx.exe']

    const findTargets = (dir: string, depth = 0) => {
      if (depth > 2) return
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir, { withFileTypes: true })
      for (const file of files) {
        if (file.isDirectory()) {
          findTargets(path.join(dir, file.name), depth + 1)
        } else if (targets.includes(file.name.toLowerCase())) {
          customPaths.add(dir)
        }
      }
    }

    if (fs.existsSync(binRoot)) {
      findTargets(binRoot)
    }

    const dynamicEnv = {
      ...process.env,
      PATH: `${Array.from(customPaths).join(';')};${process.env.PATH || ''}`
    }

    const findExecutable = (dir: string, exeName: string): string | null => {
      if (!fs.existsSync(dir)) return null;
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
          const res = findExecutable(fullPath, exeName)
          if (res) return res
        } else if (file.toLowerCase() === exeName.toLowerCase()) {
          return fullPath
        }
      }
      return null
    }

    const existingExe = findExecutable(weztermDir, 'wezterm.exe')
    if (existingExe) {
      exec(`"${existingExe}"`, { cwd: app.getPath('userData'), env: dynamicEnv })
      return true
    }

    // Need to download and extract
    if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true })
    const zipPath = path.join(toolsDir, 'wezterm.zip')
    const TERMINAL_ZIP_URL = 'https://pub-ab4265c97f7b4be69f64518a4a8f0265.r2.dev/WezTerm-windows-20240203-110809-5046fc22%20(1).zip'

    return new Promise((resolve, reject) => {
      event.sender.send('terminal-progress', { status: 'downloading' })
      const file = fs.createWriteStream(zipPath)

      https.get(TERMINAL_ZIP_URL, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          event.sender.send('terminal-progress', { status: 'extracting' })

          exec(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${weztermDir}' -Force"`, (err) => {
            if (err) {
              reject(err)
            } else {
              fs.unlinkSync(zipPath)
              event.sender.send('terminal-progress', { status: 'done' })
              const extractedExe = findExecutable(weztermDir, 'wezterm.exe')
              if (extractedExe) exec(`"${extractedExe}"`, { cwd: app.getPath('userData'), env: dynamicEnv })
              resolve(true)
            }
          })
        })
      }).on('error', (err) => {
        fs.unlink(zipPath, () => { })
        reject(err)
      })
    })
  })

  // Notify on maximize/unmaximize
  win.on('maximize', () => win?.webContents.send('window-maximized', true))
  win.on('unmaximize', () => win?.webContents.send('window-maximized', false))

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

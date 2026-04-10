# Sonna Desktop 🚀

![Sonna Desktop Preview](https://ik.imagekit.io/0lpnflx37/Portfolio/Screenshot%202026-04-11%20001129.png)

Sonna Desktop is a modern, high-performance local development environment manager, heavily inspired by **Laragon** and **XAMPP**. Built on the raw power of Electron, Vite, React, and native OS execution hooks, Sonna allows developers to instantly provision Web Servers, Databases, and Programming Languages natively without polluting global host Environment variables.

## ✨ Core Features

- **Blazing Fast Environments**: 1-click native downloads for Apache, Nginx, PHP, Node.js, Go, MySQL, PostgreSQL, MongoDB, Redis, and phpMyAdmin utilizing Powershell distributions natively.
- **Architectural Purity (ETC separation)**: Like Laragon, Sonna partitions core compiler executables (`/bin/`) strictly away from runtime configurations (`/etc/`). You can easily open configuration folders (`nginx.conf`, `httpd.conf`) universally knowing they survive version upgrades safely.
- **Integrated WezTerm Terminal**: Sonna bridges a transient globally-aware `$PATH`. Your isolated installations of `node`, `php`, or `go` become immediately accessible securely inside the WezTerm wrapper locally without overriding your OS settings.
- **Daemon Mastery**: Utilizes precise Windows PID tree eliminations (`taskkill /T /PID` and `/IM`) preventing deadlocked background orphaned states (especially vital for Nginx).
- **Beautiful & Modern UI**: Deep integration with Radix UI, supporting Vietnamese & English locales, clean categorical dashboard segregation (System Services vs Languages), and asynchronous state loading spinners to prevent duplicate actions.

## 🛠️ Tech Stack
- **Frontend**: React + Vite + Radix UI + Lucide React
- **Backend**: Electron (IPC Main) + NodeJS `fs` & `child_process`
- **Installer**: Electron-Builder (NSIS Windows `.exe` target)
- **Styling**: Pure CSS with Dark-pro Component styling.

## 🚀 Installation & Development

To clone and run this repository you'll need Git and Node.js installed on your computer.

```bash
# Clone repository
git clone https://github.com/nghiaomg/SonnaDesktop.git
cd SonnaDesktop/desktop-app

# Install dependencies
npm install

# Run the app in development mode
npm run dev

# Build the release installer (.exe) into the release/ directory
npm run build
```

## 📂 Architecture & File Layout
Unlike traditional electron wrappers, Sonna constructs a complete subsystem. Within the app's `userData` root (often scoped to `AppData/Roaming/sonnadesktop.app` on Windows):
- `/bin/`: Houses extracted core binaries (`nginx.exe`, `mysql.exe`, etc.)
- `/etc/`: Tracks user-friendly runtime configurations (`nginx.conf`, `httpd.conf`)
- `/data/`: Stores stateful persistence volumes for DBs (MySQL schemas, MongoDB arrays)
- `/tools/`: Provisions integrated generic tooling like WezTerm.
- `/downloads/`: Temporary storage for payload chunks resolving parallel archive downloads.

## 🤝 Contribution
Pull requests are always welcome! Feel free to fork and tinker natively.

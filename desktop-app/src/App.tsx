import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { Downloads } from './components/Downloads';
import { Settings } from './components/Settings';
import { useSoftwareManager } from './hooks/useSoftwareManager';
import './index.css';

function App() {
  const {
    activePage,
    setActivePage,
    installedList,
    services,
    progressMap,
    transitioningIds,
    install,
    uninstall,
    start,
    stop,
  } = useSoftwareManager();

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {activePage === 'dashboard' && (
        <Dashboard
          services={services}
          onStart={start}
          onStop={stop}
          onRemove={uninstall}
          transitioningIds={transitioningIds}
        />
      )}
      {activePage === 'downloads' && (
        <Downloads
          installedList={installedList}
          progressMap={progressMap}
          onInstall={install}
        />
      )}
      {activePage === 'settings' && <Settings />}
    </AppLayout>
  );
}

export default App;

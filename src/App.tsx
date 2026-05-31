import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useVaultStore } from './store/vaultStore';
import { tauriApi } from './lib/tauri';
import SetupFlow from './components/setup/SetupFlow';
import UnlockScreen from './components/unlock/UnlockScreen';
import VaultLayout from './components/vault/VaultLayout';
import TitleBar from './components/TitleBar';

export default function App() {
  const { appState, setAppState, setConfig, wasAutoLocked } = useVaultStore();

  useEffect(() => {
    async function init() {
      try {
        const [exists, config] = await Promise.all([
          tauriApi.vaultExists(),
          tauriApi.getConfig(),
        ]);
        setConfig(config);
        setAppState(exists ? 'locked' : 'setup');
      } catch (err) {
        console.error('Init error:', err);
        setAppState('setup');
      }
    }
    init();
  }, [setAppState, setConfig]);

  if (appState === 'loading') {
    return (
      <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
        <TitleBar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-zinc-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (appState === 'unlocked') {
    return (
      <div className="h-screen bg-zinc-900 text-zinc-100">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#f4f4f5', border: '1px solid #3f3f46' } }} />
        <VaultLayout />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#f4f4f5', border: '1px solid #3f3f46' } }} />
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {appState === 'setup' && <SetupFlow />}
        {appState === 'locked' && <UnlockScreen wasAutoLocked={wasAutoLocked} />}
      </div>
    </div>
  );
}

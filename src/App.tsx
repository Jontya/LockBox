import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useVaultStore } from './store/vaultStore';
import { tauriApi } from './lib/tauri';

export default function App() {
  const { appState, setAppState, setConfig } = useVaultStore();

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
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#f4f4f5', border: '1px solid #3f3f46' } }} />
      {appState === 'setup' && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">Setup flow — coming in Step 5</p>
        </div>
      )}
      {appState === 'locked' && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">Unlock screen — coming in Step 6</p>
        </div>
      )}
      {appState === 'unlocked' && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">Main vault — coming in Step 7</p>
        </div>
      )}
    </div>
  );
}

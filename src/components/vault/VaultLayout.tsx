import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import TopBar from './TopBar';
import BucketPanel from './BucketPanel';
import EntryList from './EntryList';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import SettingsPanel from '../settings/SettingsPanel';

export default function VaultLayout() {
  const { config, setAppState, setVaultData, setWasAutoLocked } = useVaultStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const autoLockMs = (config?.auto_lock_minutes ?? 5) * 60 * 1000;

  const handleLock = useCallback(async (autoLocked: boolean) => {
    if (autoLocked) setWasAutoLocked(true);
    await tauriApi.lockVault();
    setVaultData(null);
    setAppState('locked');
  }, [setAppState, setVaultData, setWasAutoLocked]);

  const handleLockTimeout = useCallback(() => {
    handleLock(true);
  }, [handleLock]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLockTimeout, autoLockMs);
  }, [autoLockMs, handleLockTimeout]);

  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (!config?.lock_on_minimise) return;
    const appWindow = getCurrentWebviewWindow();
    let unlisten: (() => void) | undefined;
    appWindow.onFocusChanged(({ payload: focused }) => {
      if (!focused) {
        handleLock(true);
      }
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [config?.lock_on_minimise, handleLock]);

  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      <TopBar
        onSettingsOpen={() => setShowSettings(true)}
        onLock={() => handleLock(false)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 flex-shrink-0">
          <BucketPanel onSettingsOpen={() => setShowSettings(true)} onLock={() => handleLock(false)} />
        </div>
        <div className="flex flex-1 flex-col bg-zinc-900 overflow-hidden">
          <EntryList onAddEntry={() => { /* Step 10 will wire this */ }} />
        </div>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

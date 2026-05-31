import { useState } from 'react';
import { X } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import { AppConfig } from '../../types/vault';
import ChangePasswordModal from './ChangePasswordModal';
import ImportModal from '../import/ImportModal';

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const { config, setConfig } = useVaultStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showImport, setShowImport] = useState(false);

  if (!config) return null;

  const update = async (partial: Partial<AppConfig>) => {
    const newConfig = { ...config, ...partial };
    setConfig(newConfig);
    await tauriApi.saveConfig(newConfig);
  };

  const handleChooseFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === 'string') {
      await tauriApi.setBackupPath(selected);
      await update({ backup_path: selected });
    }
  };

  const handleBackupNow = async () => {
    try {
      await tauriApi.backupNow();
      toast.success('Backup created');
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleRemoveBackup = async () => {
    await update({ backup_path: null });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
        <div
          className="bg-zinc-900 w-80 h-full overflow-y-auto flex flex-col border-l border-zinc-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-100">Settings</span>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
              <X size={16} />
            </button>
          </div>

          {/* Security */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            Security
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-zinc-300">Auto-lock after</span>
            <select
              value={config.auto_lock_minutes}
              onChange={e => update({ auto_lock_minutes: Number(e.target.value) })}
              className="bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
            >
              {[1, 5, 10, 15, 30, 60].map(m => (
                <option key={m} value={m}>{m} {m === 1 ? 'minute' : 'minutes'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              id="lock-minimise"
              checked={config.lock_on_minimise}
              onChange={e => update({ lock_on_minimise: e.target.checked })}
            />
            <label htmlFor="lock-minimise">Lock on minimise</label>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-zinc-300">Master password</span>
            <button
              onClick={() => setShowChangePassword(true)}
              className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Change Password
            </button>
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* Clipboard */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            Clipboard
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-zinc-300">Clear clipboard after</span>
            <select
              value={config.clipboard_clear_seconds}
              onChange={e => update({ clipboard_clear_seconds: Number(e.target.value) })}
              className="bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
            >
              {[15, 30, 60, 120, 300].map(s => (
                <option key={s} value={s}>{s} seconds</option>
              ))}
            </select>
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* Backup */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            Backup
          </div>

          <div className="px-4 py-2">
            {config.backup_path ? (
              <span className="text-xs text-zinc-400 truncate block">{config.backup_path}</span>
            ) : (
              <span className="text-xs text-zinc-500">No backup location set</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 px-4 py-2">
            <button
              onClick={handleChooseFolder}
              className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Choose Folder
            </button>
            {config.backup_path && (
              <>
                <button
                  onClick={handleBackupNow}
                  className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                >
                  Backup Now
                </button>
                <button
                  onClick={handleRemoveBackup}
                  className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-red-400"
                >
                  Remove Backup
                </button>
              </>
            )}
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* Import */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            Import
          </div>

          <div className="px-4 py-2">
            <button
              onClick={() => setShowImport(true)}
              className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Import from .env or CSV
            </button>
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* Window */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            Window
          </div>

          <div className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              id="always-on-top"
              checked={config.always_on_top}
              onChange={e => update({ always_on_top: e.target.checked })}
            />
            <label htmlFor="always-on-top">Always on top</label>
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* About */}
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 mt-2">
            About
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-zinc-300">Version</span>
            <span className="text-sm text-zinc-400">v0.1.0</span>
          </div>

          <div className="px-4 py-2 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">%APPDATA%\LockBox\vault.dat</span>
            <span className="text-xs text-zinc-500 cursor-default">Open in Explorer</span>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} />
      )}
    </>
  );
}

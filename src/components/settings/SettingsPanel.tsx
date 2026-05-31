import { useState } from 'react';
import { X } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import { AppConfig } from '../../types/vault';
import ChangePasswordModal from './ChangePasswordModal';
import ImportModal from '../import/ImportModal';

interface Props { onClose: () => void; }

function SectionHeader({ label }: { label: string }) {
  return <div className="section-label">{label}</div>;
}

function Divider() {
  return <hr className="border-zinc-800 mx-4 my-1" />;
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
    if (typeof selected === 'string') { await tauriApi.setBackupPath(selected); await update({ backup_path: selected }); }
  };

  const handleBackupNow = async () => {
    try { await tauriApi.backupNow(); toast.success('Backup created'); }
    catch (err) { toast.error(String(err)); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
        <div
          className="bg-zinc-900 w-72 h-full overflow-y-auto flex flex-col border-l border-zinc-800"
          style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.35)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <span className="text-sm font-semibold text-zinc-100">Settings</span>
            <button onClick={onClose} className="icon-btn"><X size={15} /></button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">

            {/* Security */}
            <SectionHeader label="Security" />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-zinc-300">Auto-lock after</span>
              <select
                value={config.auto_lock_minutes}
                onChange={e => update({ auto_lock_minutes: Number(e.target.value) })}
                className="bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 5, 10, 15, 30, 60].map(m => (
                  <option key={m} value={m}>{m} {m === 1 ? 'minute' : 'minutes'}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 px-4 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.lock_on_minimise}
                onChange={e => update({ lock_on_minimise: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Lock on minimise</span>
            </label>

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-zinc-300">Master password</span>
              <button onClick={() => setShowChangePassword(true)} className="btn-subtle btn-sm">
                Change
              </button>
            </div>

            <Divider />

            {/* Clipboard */}
            <SectionHeader label="Clipboard" />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-zinc-300">Clear after</span>
              <select
                value={config.clipboard_clear_seconds}
                onChange={e => update({ clipboard_clear_seconds: Number(e.target.value) })}
                className="bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[15, 30, 60, 120, 300].map(s => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </div>

            <Divider />

            {/* Backup */}
            <SectionHeader label="Backup" />

            <div className="px-4 py-2">
              {config.backup_path ? (
                <span className="text-xs text-zinc-400 font-mono truncate block">{config.backup_path}</span>
              ) : (
                <span className="text-xs text-zinc-600">No backup location set</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 px-4 pb-2">
              <button onClick={handleChooseFolder} className="btn-subtle btn-sm">Choose Folder</button>
              {config.backup_path && (
                <>
                  <button onClick={handleBackupNow} className="btn-subtle btn-sm">Backup Now</button>
                  <button onClick={() => update({ backup_path: null })} className="btn-sm btn bg-transparent text-red-400 hover:bg-zinc-800">Remove</button>
                </>
              )}
            </div>

            <Divider />

            {/* Import */}
            <SectionHeader label="Import" />

            <div className="px-4 py-2">
              <button onClick={() => setShowImport(true)} className="btn-subtle btn-sm">
                Import from .env or CSV
              </button>
            </div>

            <Divider />

            {/* Window */}
            <SectionHeader label="Window" />

            <label className="flex items-center gap-3 px-4 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.always_on_top}
                onChange={e => update({ always_on_top: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Always on top</span>
            </label>

            <Divider />

            {/* About */}
            <SectionHeader label="About" />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-zinc-500">Version</span>
              <span className="text-sm text-zinc-400">v0.1.0</span>
            </div>

            <div className="px-4 pb-2 flex flex-col gap-0.5">
              <span className="text-xs font-medium text-zinc-500">Vault path</span>
              <span className="text-xs text-zinc-600 font-mono">%APPDATA%\LockBox\vault.dat</span>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </>
  );
}

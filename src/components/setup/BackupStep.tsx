import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';

interface Props {
  onNext: () => void;
}

export default function BackupStep({ onNext }: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function chooseFolder() {
    const result = await open({ directory: true, multiple: false });
    if (typeof result === 'string') setSelectedPath(result);
  }

  async function handleContinue() {
    if (!selectedPath) return;
    setLoading(true);
    try {
      await tauriApi.setBackupPath(selectedPath);
      onNext();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Set a backup location</h2>
        <p className="text-sm text-zinc-500 mt-1">
          LockBox can automatically copy your encrypted vault to a folder you choose.
        </p>
      </div>

      <button onClick={chooseFolder} className="btn-subtle w-fit">
        Choose Folder
      </button>

      {selectedPath && (
        <p className="text-xs text-zinc-400 font-mono break-all bg-zinc-700/40 rounded px-3 py-2">
          {selectedPath}
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={onNext} className="btn-ghost">
          Skip for now
        </button>
        {selectedPath && (
          <button onClick={handleContinue} disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

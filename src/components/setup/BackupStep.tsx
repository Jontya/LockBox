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
    if (typeof result === 'string') {
      setSelectedPath(result);
    }
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
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-zinc-100">Set a backup location</h2>
        <p className="text-sm text-zinc-400">
          LockBox can automatically back up your vault to a folder of your choice.
        </p>
      </div>

      <button
        onClick={chooseFolder}
        className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 w-fit"
      >
        Choose Folder
      </button>

      {selectedPath && (
        <p className="text-sm text-zinc-300 break-all">{selectedPath}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
        >
          Skip for Now
        </button>
        {selectedPath && (
          <button
            onClick={handleContinue}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

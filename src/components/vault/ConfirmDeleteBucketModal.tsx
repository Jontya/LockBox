import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';

interface Props {
  bucket: Bucket;
  onClose: () => void;
}

export default function ConfirmDeleteBucketModal({ bucket, onClose }: Props) {
  const { vaultData, setVaultData, selectedBucketId, setSelectedBucketId } = useVaultStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = async () => {
    if (!vaultData) return;
    const newData = {
      ...vaultData,
      buckets: vaultData.buckets.filter(b => b.id !== bucket.id),
    };
    setVaultData(newData);
    if (selectedBucketId === bucket.id) setSelectedBucketId(null);
    try {
      await tauriApi.saveVaultData(newData);
    } catch {
      toast.error('Failed to save vault');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-zinc-100 font-semibold mb-2">Delete '{bucket.name}'?</h2>
        <p className="text-zinc-400 text-sm mb-6">
          This will permanently delete the bucket and all {bucket.entries.length} entries inside.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

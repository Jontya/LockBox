import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  bucket: Bucket;
  onClose: () => void;
}

export default function ConfirmDeleteBucketModal({ bucket, onClose }: Props) {
  const { vaultData, setVaultData, selectedBucketId, setSelectedBucketId } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = async () => {
    if (!vaultData) return;
    setIsLoading(true);
    try {
      const newData = {
        ...vaultData,
        buckets: vaultData.buckets.filter(b => b.id !== bucket.id),
      };
      setVaultData(newData);
      if (selectedBucketId === bucket.id) setSelectedBucketId(null);
      await tauriApi.saveVaultData(newData);
      onClose();
    } catch {
      toast.error('Failed to save vault');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={cardRef} className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-zinc-100 font-semibold mb-2">Delete '{bucket.name}'?</h2>
        <p className="text-zinc-400 text-sm mb-6">
          This will permanently delete the bucket and all {bucket.entries.length} entries inside.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props { bucket: Bucket; onClose: () => void; }

export default function ConfirmDeleteBucketModal({ bucket, onClose }: Props) {
  const { vaultData, setVaultData, selectedBucketId, setSelectedBucketId } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusTrap(cardRef);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = async () => {
    if (!vaultData) return;
    setIsLoading(true);
    try {
      const newData = { ...vaultData, buckets: vaultData.buckets.filter(b => b.id !== bucket.id) };
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
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-sm">
        <h2 className="text-base font-semibold text-zinc-100 mb-1.5">Delete bucket?</h2>
        <p className="text-sm text-zinc-400 mb-5">
          <span className="text-zinc-300">"{bucket.name}"</span> and all{' '}
          {bucket.entries.length > 0 ? `${bucket.entries.length} entries inside` : 'its entries'}{' '}
          will be permanently removed.
        </p>
        <div className="flex gap-2 justify-end">
          <button className="btn-ghost btn-sm" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn-destructive btn-sm" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete Bucket'}
          </button>
        </div>
      </div>
    </div>
  );
}

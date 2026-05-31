import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { VaultEntry } from '../../types/vault';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  entry: VaultEntry;
  onClose: () => void;
}

export default function ConfirmDeleteEntryModal({ entry, onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = async () => {
    if (!vaultData) return;
    setIsLoading(true);
    try {
      const newData = {
        ...vaultData,
        buckets: vaultData.buckets.map(b => ({
          ...b,
          entries: b.entries.filter(e => e.id !== entry.id),
        })),
      };
      setVaultData(newData);
      await tauriApi.saveVaultData(newData);
      onClose();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={cardRef} className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-lg font-medium text-zinc-100 mb-2">Delete '{entry.label}'?</h2>
        <p className="text-sm text-zinc-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm px-4 py-2 rounded-md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

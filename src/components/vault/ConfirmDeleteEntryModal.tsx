import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { VaultEntry } from '../../types/vault';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props { entry: VaultEntry; onClose: () => void; }

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
        buckets: vaultData.buckets.map(b => ({ ...b, entries: b.entries.filter(e => e.id !== entry.id) })),
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
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-sm">
        <h2 className="text-base font-semibold text-zinc-100 mb-1.5">Delete entry?</h2>
        <p className="text-sm text-zinc-400 mb-5">
          <span className="text-zinc-300">"{entry.label}"</span> will be permanently removed.
        </p>
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn-destructive flex-1" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BUCKET_COLORS } from '../../lib/bucketColors';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props { bucket: Bucket; onClose: () => void; }

export default function EditBucketModal({ bucket, onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(bucket.name);
  const [colorId, setColorId] = useState(bucket.color);

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim() || !vaultData) return;
    const newData = {
      ...vaultData,
      buckets: vaultData.buckets.map(b => b.id === bucket.id ? { ...b, name: name.trim(), color: colorId } : b),
    };
    setVaultData(newData);
    try { await tauriApi.saveVaultData(newData); } catch { toast.error('Failed to save vault'); }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-sm">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">Edit Bucket</h2>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          className="field mb-4"
        />
        <div className="flex flex-wrap gap-2 mb-5">
          {BUCKET_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColorId(c.id)}
              className={`w-6 h-6 rounded-full flex-shrink-0 transition-transform duration-100
                ${colorId === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-800 scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: c.hex }}
              title={c.id}
            />
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} className="btn-primary btn-sm">Save</button>
        </div>
      </div>
    </div>
  );
}

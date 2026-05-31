import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BUCKET_COLORS } from '../../lib/bucketColors';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props { onClose: () => void; }

export default function CreateBucketModal({ onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [colorId, setColorId] = useState('blue');

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCreate = async () => {
    if (!name.trim() || !vaultData) return;
    const newBucket: Bucket = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: colorId,
      created_at: new Date().toISOString(),
      entries: [],
    };
    const newData = { ...vaultData, buckets: [...vaultData.buckets, newBucket] };
    setVaultData(newData);
    try { await tauriApi.saveVaultData(newData); } catch { toast.error('Failed to save vault'); }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-sm">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">New Bucket</h2>
        <input
          type="text"
          placeholder="Bucket name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          className="field mb-4"
          autoFocus
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
          <button onClick={handleCreate} disabled={!name.trim()} className="btn-primary btn-sm">Create</button>
        </div>
      </div>
    </div>
  );
}

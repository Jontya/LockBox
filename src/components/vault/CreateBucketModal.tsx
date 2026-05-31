import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BUCKET_COLORS } from '../../lib/bucketColors';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  onClose: () => void;
}

export default function CreateBucketModal({ onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [colorId, setColorId] = useState('blue');

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
    try {
      await tauriApi.saveVaultData(newData);
    } catch {
      toast.error('Failed to save vault');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={cardRef} className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-zinc-100 font-semibold mb-4">New Bucket</h2>
        <input
          type="text"
          placeholder="Bucket name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          className="w-full bg-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div className="flex flex-wrap gap-2 mb-6">
          {BUCKET_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColorId(c.id)}
              className={`w-6 h-6 rounded-full flex-shrink-0 ${colorId === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-800' : ''}`}
              style={{ backgroundColor: c.hex }}
              title={c.id}
            />
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

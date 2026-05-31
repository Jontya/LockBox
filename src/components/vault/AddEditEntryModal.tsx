import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { VaultEntry, VaultEntryType } from '../../types/vault';
import { useVaultStore } from '../../store/vaultStore';
import { tauriApi } from '../../lib/tauri';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  entry?: VaultEntry;
  bucketId?: string;
  onClose: () => void;
}

export default function AddEditEntryModal({ entry, bucketId, onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const isEdit = !!entry;
  const cardRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<VaultEntryType>(entry?.type ?? 'api_key');
  const [label, setLabel] = useState(entry?.label ?? '');
  const [value, setValue] = useState(entry?.type === 'api_key' ? entry.value : '');
  const [username, setUsername] = useState(entry?.type === 'account' ? entry.username : '');
  const [password, setPassword] = useState(entry?.type === 'account' ? entry.password : '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [selectedBucketId, setSelectedBucketId] = useState(
    isEdit
      ? (vaultData?.buckets.find(b => b.entries.some(e => e.id === entry!.id))?.id ?? vaultData?.buckets[0]?.id ?? '')
      : (bucketId ?? vaultData?.buckets[0]?.id ?? '')
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!label.trim()) errs.label = 'Label is required.';
    if (type === 'api_key' && !value.trim()) errs.value = 'Value is required.';
    if (type === 'account') {
      if (!username.trim()) errs.username = 'Username is required.';
      if (!password.trim()) errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !vaultData) return;
    setIsLoading(true);
    try {
      const newData = { ...vaultData, buckets: vaultData.buckets.map(b => ({ ...b, entries: [...b.entries] })) };

      if (isEdit) {
        for (const bucket of newData.buckets) {
          const idx = bucket.entries.findIndex(e => e.id === entry!.id);
          if (idx !== -1) {
            const updated: VaultEntry = type === 'api_key'
              ? { ...entry as Extract<VaultEntry, { type: 'api_key' }>, label, value, notes }
              : { ...entry as Extract<VaultEntry, { type: 'account' }>, label, username, password, notes };
            bucket.entries[idx] = updated;
            break;
          }
        }
      } else {
        const newEntry: VaultEntry = type === 'api_key'
          ? { type: 'api_key', id: crypto.randomUUID(), label, value, notes, created_at: new Date().toISOString(), archived: false }
          : { type: 'account', id: crypto.randomUUID(), label, username, password, notes, created_at: new Date().toISOString(), archived: false };
        const targetBucket = newData.buckets.find(b => b.id === selectedBucketId);
        if (targetBucket) targetBucket.entries.push(newEntry);
      }

      setVaultData(newData);
      await tauriApi.saveVaultData(newData);
      onClose();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (err?: string) =>
    `w-full bg-zinc-700 border ${err ? 'border-red-500' : 'border-zinc-600'} rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={cardRef} className="bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-zinc-100">{isEdit ? 'Edit Entry' : 'Add Entry'}</span>
          <button className="text-zinc-400 hover:text-zinc-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEdit && (
          <div className="flex gap-1 mb-4 bg-zinc-700/40 rounded-md p-1">
            {(['api_key', 'account'] as VaultEntryType[]).map(t => (
              <button
                key={t}
                className={`flex-1 text-sm px-3 py-1.5 rounded ${type === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                onClick={() => setType(t)}
              >
                {t === 'api_key' ? 'API Key' : 'Account'}
              </button>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs text-zinc-500 mb-1">Label</label>
          <input className={fieldClass(errors.label)} value={label} onChange={e => setLabel(e.target.value)} placeholder="My API Key" />
          {errors.label && <p className="text-xs text-red-400 mt-1">{errors.label}</p>}
        </div>

        {type === 'api_key' ? (
          <div className="mb-3">
            <label className="block text-xs text-zinc-500 mb-1">Value</label>
            <input className={fieldClass(errors.value)} value={value} onChange={e => setValue(e.target.value)} placeholder="sk-..." />
            {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-xs text-zinc-500 mb-1">Username</label>
              <input className={fieldClass(errors.username)} value={username} onChange={e => setUsername(e.target.value)} placeholder="user@example.com" />
              {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
            </div>
            <div className="mb-3">
              <label className="block text-xs text-zinc-500 mb-1">Password</label>
              <div className="relative">
                <input
                  className={fieldClass(errors.password) + ' pr-10'}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
          </>
        )}

        <div className="mb-3">
          <label className="block text-xs text-zinc-500 mb-1">Notes <span className="text-zinc-600">(optional)</span></label>
          <textarea
            className={fieldClass()}
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>

        {!isEdit && (
          <div className="mb-4">
            <label className="block text-xs text-zinc-500 mb-1">Bucket</label>
            <select
              className={fieldClass()}
              value={selectedBucketId}
              onChange={e => setSelectedBucketId(e.target.value)}
            >
              {(vaultData?.buckets ?? []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm px-4 py-2 rounded-md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEdit ? 'Save' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}

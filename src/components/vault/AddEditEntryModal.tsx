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

  return (
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-semibold text-zinc-100">{isEdit ? 'Edit Entry' : 'New Entry'}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        {/* Type toggle — add mode only */}
        {!isEdit && (
          <div className="flex gap-1 mb-4 p-1 bg-zinc-700/40 rounded-md">
            {(['api_key', 'account'] as VaultEntryType[]).map(t => (
              <button
                key={t}
                className={`flex-1 text-sm py-1.5 rounded transition-[background-color,color] duration-150
                  ${type === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setType(t)}
              >
                {t === 'api_key' ? 'API Key' : 'Account'}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Label</label>
            <input className={`field ${errors.label ? 'field-error' : ''}`} value={label} onChange={e => setLabel(e.target.value)} placeholder="My API Key" />
            {errors.label && <p className="text-xs text-red-400 mt-1">{errors.label}</p>}
          </div>

          {type === 'api_key' ? (
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1 block">Value</label>
              <input className={`field ${errors.value ? 'field-error' : ''}`} value={value} onChange={e => setValue(e.target.value)} placeholder="sk-…" />
              {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">Username</label>
                <input className={`field ${errors.username ? 'field-error' : ''}`} value={username} onChange={e => setUsername(e.target.value)} placeholder="user@example.com" />
                {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">Password</label>
                <div className="relative">
                  <input
                    className={`field pr-10 ${errors.password ? 'field-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Notes <span className="text-zinc-700">(optional)</span></label>
            <textarea className="field" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>

          {!isEdit && (
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1 block">Bucket</label>
              <select className="field" value={selectedBucketId} onChange={e => setSelectedBucketId(e.target.value)}>
                {(vaultData?.buckets ?? []).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-ghost flex-1" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

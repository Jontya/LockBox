import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { VaultEntry } from '../../types/vault';
import { useVaultStore } from '../../store/vaultStore';
import { copyToClipboard } from '../../lib/clipboard';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  entry: VaultEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MASK = '••••••••••••••••';

export default function EntryDetailModal({ entry, onClose, onEdit, onDelete }: Props) {
  const { config } = useVaultStore();
  const clearMs = (config?.clipboard_clear_seconds ?? 60) * 1000;
  const clearSecs = config?.clipboard_clear_seconds ?? 60;
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleReveal = (field: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  };

  const handleCopy = (value: string) => {
    copyToClipboard(value, clearMs);
    toast.success(`Copied — clears in ${clearSecs}s`);
  };

  const renderField = (label: string, value: string, fieldKey: string, masked: boolean) => {
    const isRevealed = revealed.has(fieldKey);
    const display = masked && !isRevealed ? MASK : value;
    return (
      <div className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <div className="flex items-center gap-1 bg-zinc-700/50 rounded-md px-3 py-2">
          <span className="flex-1 text-sm text-zinc-100 font-mono break-all">{display}</span>
          {masked && (
            <button className="icon-btn w-6 h-6 flex-shrink-0" onClick={() => toggleReveal(fieldKey)}>
              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
          <button className="icon-btn w-6 h-6 flex-shrink-0" onClick={() => handleCopy(value)}>
            <Copy size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div ref={cardRef} className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-base font-semibold text-zinc-100 truncate">{entry.label}</span>
            <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded flex-shrink-0">
              {entry.type === 'api_key' ? 'API Key' : 'Account'}
            </span>
          </div>
          <button className="icon-btn flex-shrink-0 ml-2" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {entry.type === 'api_key' ? (
          <>
            {renderField('API Key', entry.value, 'value', true)}
            {entry.notes && renderField('Notes', entry.notes, 'notes', false)}
          </>
        ) : (
          <>
            {renderField('Username', entry.username, 'username', false)}
            {renderField('Password', entry.password, 'password', true)}
            {entry.notes && renderField('Notes', entry.notes, 'notes', false)}
          </>
        )}

        <div className="flex gap-2 pt-1">
          <button className="btn-subtle flex-1" onClick={onEdit}>Edit</button>
          <button className="btn-destructive flex-1" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

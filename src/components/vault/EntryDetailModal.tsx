import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { VaultEntry } from '../../types/vault';
import { useVaultStore } from '../../store/vaultStore';
import { copyToClipboard } from '../../lib/clipboard';

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

  const [revealed, setRevealed] = useState<Set<string>>(new Set());

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
      <div className="mb-4">
        <div className="text-xs text-zinc-500 mb-1">{label}</div>
        <div className="flex items-center gap-2 bg-zinc-700/50 rounded-md px-3 py-2">
          <span className="flex-1 text-sm text-zinc-100 font-mono break-all">{display}</span>
          {masked && (
            <button
              className="text-zinc-400 hover:text-zinc-100"
              onClick={() => toggleReveal(fieldKey)}
            >
              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <button
            className="text-zinc-400 hover:text-zinc-100"
            onClick={() => handleCopy(value)}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-medium text-zinc-100">{entry.label}</span>
            <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
              {entry.type === 'api_key' ? 'API Key' : 'Account'}
            </span>
          </div>
          <button className="text-zinc-400 hover:text-zinc-100 ml-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {entry.type === 'api_key' ? (
          <>
            {renderField('API Key', entry.value, 'value', true)}
            {entry.notes && (
              <div className="mb-4">
                <div className="text-xs text-zinc-500 mb-1">Notes</div>
                <div className="bg-zinc-700/50 rounded-md px-3 py-2 text-sm text-zinc-300 whitespace-pre-wrap">{entry.notes}</div>
              </div>
            )}
          </>
        ) : (
          <>
            {renderField('Username', entry.username, 'username', false)}
            {renderField('Password', entry.password, 'password', true)}
            {entry.notes && (
              <div className="mb-4">
                <div className="text-xs text-zinc-500 mb-1">Notes</div>
                <div className="bg-zinc-700/50 rounded-md px-3 py-2 text-sm text-zinc-300 whitespace-pre-wrap">{entry.notes}</div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 mt-2">
          <button
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm px-4 py-2 rounded-md"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-md"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

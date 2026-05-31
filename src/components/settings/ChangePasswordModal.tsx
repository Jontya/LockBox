import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props {
  onClose: () => void;
}

function strengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const segmentColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

export default function ChangePasswordModal({ onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useFocusTrap(cardRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const score = strengthScore(newPass);

  const handleSubmit = async () => {
    if (!current) { toast.error('Enter current password'); return; }
    if (newPass.length < 4) { toast.error('New password must be at least 4 characters'); return; }
    if (newPass !== confirm) { toast.error('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      await tauriApi.changePassword(current, newPass);
      toast.success('Password changed');
      onClose();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center">
      <div ref={cardRef} className="bg-zinc-900 border border-zinc-700 rounded-lg w-80 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100">Change Password</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Current password</label>
          <input
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1.5 outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">New password</label>
          <input
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1.5 outline-none focus:border-zinc-400"
          />
          {newPass.length > 0 && (
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < score ? segmentColors[score - 1] : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1.5 outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-sm px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

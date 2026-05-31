import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useFocusTrap } from '../../lib/useFocusTrap';

interface Props { onClose: () => void; }

function strengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
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
    <div className="modal-backdrop" style={{ zIndex: 60 }}>
      <div ref={cardRef} className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-semibold text-zinc-100">Change Password</span>
          <button onClick={onClose} className="icon-btn"><X size={15} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Current password</label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)} className="field" placeholder="••••••••" />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">New password</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="field" placeholder="••••••••" />
            {newPass.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? segmentColors[score - 1] : 'bg-zinc-700'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Confirm new password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="field" placeholder="••••••••" />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn-sm">
            {submitting ? 'Saving…' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

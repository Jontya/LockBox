import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';

interface Props {
  onNext: () => void;
}

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (pw.length === 0) return 0;
  if (pw.length < 8) return 1;
  if (pw.length < 12) return 2;
  if (pw.length < 16) return 3;
  return 4;
}

const segmentColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

export default function CreatePasswordStep({ onNext }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  async function handleSubmit() {
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError(null);
    setLoading(true);
    try {
      await tauriApi.createVault(password);
      onNext();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Create your master password</h2>
        <p className="text-sm text-zinc-500 mt-1">This is the only key to your vault. There is no recovery option.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-400">Master password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="field pr-10"
            placeholder="••••••••"
            autoFocus
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength >= i ? segmentColors[strength] : 'bg-zinc-700'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-400">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="field pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6"
          >
            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="rounded-md border border-amber-800/60 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-300/90">
        If you forget your master password, your vault cannot be recovered.
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating vault…' : 'Create Vault'}
      </button>
    </div>
  );
}

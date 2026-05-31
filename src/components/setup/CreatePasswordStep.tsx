import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';

interface Props {
  onNext: () => void;
}

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  const len = pw.length;
  if (len === 0) return 0;
  if (len < 8) return 1;
  if (len < 12) return 2;
  if (len < 16) return 3;
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
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
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
      <h2 className="text-lg font-medium text-zinc-100">Create your master password</h2>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-zinc-400">Master password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${strength >= i ? segmentColors[strength] : 'bg-zinc-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-zinc-400">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="bg-amber-950 border border-amber-700 rounded-md p-3 text-amber-300 text-sm">
        ⚠️ There is no password recovery. If you forget your master password, your vault cannot be recovered.
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Vault'}
      </button>
    </div>
  );
}

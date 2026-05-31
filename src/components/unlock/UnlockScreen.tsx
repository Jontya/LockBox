import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { exit } from '@tauri-apps/plugin-process';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';

interface Props {
  wasAutoLocked?: boolean;
}

export default function UnlockScreen({ wasAutoLocked = false }: Props) {
  const { setAppState, setVaultData, setConfig } = useVaultStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleUnlock() {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      const ok = await tauriApi.unlockVault(password);
      if (ok) {
        const [data, config] = await Promise.all([
          tauriApi.getVaultData(),
          tauriApi.getConfig(),
        ]);
        setVaultData(data);
        setConfig(config);
        setAppState('unlocked');
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setError('Incorrect password');
        if (next >= 15) {
          await exit(0);
        } else if (next === 10) {
          startCooldown(300);
        } else if (next === 5) {
          startCooldown(30);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleUnlock();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (error) setError('');
  }

  const disabled = cooldown > 0 || loading;

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900">
      <div className="max-w-sm w-full bg-zinc-800 rounded-lg p-8">
        <div className="text-xl font-semibold text-zinc-100 mb-6">🔒 LockBox</div>

        {wasAutoLocked && (
          <div className="mb-4 rounded-md bg-zinc-700 px-4 py-3 text-sm text-zinc-300">
            LockBox was locked due to inactivity.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1" htmlFor="master-password">
            Master password
          </label>
          <div className="relative">
            <input
              id="master-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={`w-full rounded-md bg-zinc-700 px-3 py-2 pr-10 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 border ${error ? 'border-red-500' : 'border-zinc-600'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          {cooldown > 0 && (
            <p className="mt-1 text-xs text-amber-400">
              Too many attempts. Try again in {cooldown}s.
            </p>
          )}
        </div>

        <button
          onClick={handleUnlock}
          disabled={disabled}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}

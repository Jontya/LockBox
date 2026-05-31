import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current!); intervalRef.current = null; return 0; }
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
        const [data, config] = await Promise.all([tauriApi.getVaultData(), tauriApi.getConfig()]);
        setVaultData(data);
        setConfig(config);
        setAppState('unlocked');
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setError('Incorrect password');
        if (next >= 15) await exit(0);
        else if (next === 10) startCooldown(300);
        else if (next === 5) startCooldown(30);
      }
    } finally {
      setLoading(false);
    }
  }

  const disabled = cooldown > 0 || loading;

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900">
      <div
        className="w-full max-w-sm mx-4 bg-zinc-800 rounded-xl p-8"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="text-base font-semibold text-zinc-100 tracking-tight">LockBox</span>
        </div>

        {/* Auto-lock banner */}
        {wasAutoLocked && (
          <div className="mb-5 rounded-md border border-zinc-700 bg-zinc-700/40 px-3 py-2.5 text-sm text-zinc-400">
            Locked due to inactivity.
          </div>
        )}

        {/* Field */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-zinc-400" htmlFor="master-password">
            Master password
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="master-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); }}
              disabled={disabled}
              className={`field pr-10 ${error ? 'field-error' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {cooldown > 0 && (
            <p className="text-xs text-amber-400">Too many attempts. Try again in {cooldown}s.</p>
          )}
        </div>

        <button
          onClick={handleUnlock}
          disabled={disabled}
          className="btn-primary w-full"
        >
          {loading ? 'Unlocking…' : 'Unlock'}
        </button>
      </div>
    </div>
  );
}

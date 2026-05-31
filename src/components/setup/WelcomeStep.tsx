import { Lock } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center gap-7 text-center py-2">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">LockBox</h1>
          <p className="text-sm text-zinc-400">Your credentials, encrypted and stored locally.</p>
          <p className="text-xs text-zinc-600">Zero cloud. Zero network. Just you.</p>
        </div>
      </div>
      <button onClick={onNext} className="btn-primary">
        Get Started
      </button>
    </div>
  );
}

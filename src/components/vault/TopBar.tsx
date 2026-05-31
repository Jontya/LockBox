import { Search, Settings, Lock } from 'lucide-react';

interface Props {
  onSearchOpen: () => void;
  onSettingsOpen: () => void;
  onLock: () => void;
}

export default function TopBar({ onSearchOpen, onSettingsOpen, onLock }: Props) {
  return (
    <div className="flex items-center justify-between px-4 h-10 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
      <span className="text-sm font-semibold text-zinc-100 tracking-tight select-none">LockBox</span>
      <div className="flex gap-0.5">
        <button onClick={onSearchOpen} className="icon-btn" aria-label="Search">
          <Search size={15} />
        </button>
        <button onClick={onSettingsOpen} className="icon-btn" aria-label="Settings">
          <Settings size={15} />
        </button>
        <button onClick={onLock} className="icon-btn" aria-label="Lock vault">
          <Lock size={15} />
        </button>
      </div>
    </div>
  );
}

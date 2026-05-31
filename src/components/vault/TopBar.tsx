import { Search, Settings, Lock } from 'lucide-react';

interface Props {
  onSearchOpen: () => void;
  onSettingsOpen: () => void;
  onLock: () => void;
}

export default function TopBar({ onSearchOpen, onSettingsOpen, onLock }: Props) {
  return (
    <div className="flex items-center justify-between px-4 h-10 bg-zinc-900 border-b border-zinc-800">
      <span className="text-sm font-semibold text-zinc-100">🔒 LockBox</span>
      <div className="flex gap-1">
        <button
          onClick={onSearchOpen}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          onClick={onSettingsOpen}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onLock}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Lock"
        >
          <Lock size={16} />
        </button>
      </div>
    </div>
  );
}

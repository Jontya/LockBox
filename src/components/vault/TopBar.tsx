import { Search, Settings, Lock, Minus, Square, X } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

interface Props {
  onSearchOpen: () => void;
  onSettingsOpen: () => void;
  onLock: () => void;
}

const appWindow = getCurrentWebviewWindow();

export default function TopBar({ onSearchOpen, onSettingsOpen, onLock }: Props) {
  return (
    <div
      className="flex items-center h-10 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 select-none"
      data-tauri-drag-region
      onMouseDown={() => appWindow.startDragging()}
    >
      {/* Drag region + label */}
      <div className="flex items-center gap-2 px-4 flex-1 min-w-0" data-tauri-drag-region>
        <span className="text-sm font-semibold text-zinc-100 tracking-tight" data-tauri-drag-region>
          LockBox
        </span>
      </div>

      {/* Vault controls — not drag region */}
      <div className="flex items-center gap-0.5 px-1">
        <button onClick={onSearchOpen} className="icon-btn" aria-label="Search">
          <Search size={14} />
        </button>
        <button onClick={onSettingsOpen} className="icon-btn" aria-label="Settings">
          <Settings size={14} />
        </button>
        <button onClick={onLock} className="icon-btn" aria-label="Lock vault">
          <Lock size={14} />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-zinc-800 mx-1" />

      {/* Window controls */}
      <div className="flex items-center">
        <button
          onClick={() => appWindow.minimize()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Minimise"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Maximise"
        >
          <Square size={11} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-white hover:bg-red-600 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

import { Minus, Square, X } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const appWindow = getCurrentWebviewWindow();

export default function TopBar() {
  return (
    <div
      className="flex items-center h-10 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 select-none"
      data-tauri-drag-region
      onMouseDown={() => appWindow.startDragging()}
    >
      {/* Drag region + label */}
      <div className="flex items-center gap-2 px-4 flex-1 min-w-0" data-tauri-drag-region>
        <img src="/lockbox.svg" alt="" className="w-4 h-4 flex-shrink-0" draggable="false" data-tauri-drag-region />
        <span className="text-sm font-semibold text-zinc-100 tracking-tight" data-tauri-drag-region>
          LockBox
        </span>
      </div>

      {/* Window controls */}
      <div className="flex items-center">
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.minimize()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Minimise"
        >
          <Minus size={13} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Maximise"
        >
          <Square size={11} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.close()}
          className="flex items-center justify-center w-11 h-10 text-zinc-400 hover:text-white hover:bg-red-600 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

import { Minus, Square, X } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const appWindow = getCurrentWebviewWindow();

export default function TitleBar() {
  return (
    <div
      className="flex items-center justify-between h-9 bg-zinc-900 flex-shrink-0 select-none"
      data-tauri-drag-region
      onMouseDown={() => appWindow.startDragging()}
    >
      <div className="flex items-center gap-2 px-4" data-tauri-drag-region>
        <img src="/lockbox.svg" alt="" className="w-3.5 h-3.5 flex-shrink-0" draggable="false" data-tauri-drag-region />
        <span className="text-xs font-semibold text-zinc-500 tracking-tight" data-tauri-drag-region>LockBox</span>
      </div>
      <div className="flex items-center">
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.minimize()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Minimise"
        >
          <Minus size={13} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Maximise"
        >
          <Square size={11} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()} onClick={() => appWindow.close()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-white hover:bg-red-600 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

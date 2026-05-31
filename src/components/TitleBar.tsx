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
      <span className="text-xs font-semibold text-zinc-500 px-4 tracking-tight" data-tauri-drag-region>
        LockBox
      </span>
      <div className="flex items-center">
        <button
          onClick={() => appWindow.minimize()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Minimise"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-100"
          aria-label="Maximise"
        >
          <Square size={11} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex items-center justify-center w-11 h-9 text-zinc-500 hover:text-white hover:bg-red-600 transition-colors duration-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

import { KeyRound, User } from 'lucide-react';
import type { VaultEntry } from '../../types/vault';

interface Props {
  entry: VaultEntry;
  onClick: () => void;
  bucketColor?: string;
}

export default function EntryCard({ entry, onClick, bucketColor }: Props) {
  const Icon = entry.type === 'api_key' ? KeyRound : User;
  const subtitle = entry.type === 'api_key' ? 'API Key' : 'Account';
  const iconStyle = bucketColor ? { color: bucketColor } : undefined;
  const iconClass = bucketColor ? 'w-4 h-4 flex-shrink-0' : `w-4 h-4 flex-shrink-0 ${entry.type === 'api_key' ? 'text-blue-400' : 'text-purple-400'}`;

  return (
    <button
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left cursor-pointer
                 hover:bg-zinc-800 transition-[background-color] duration-150
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      onClick={onClick}
    >
      <Icon className={iconClass} style={iconStyle} strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-100 truncate">{entry.label}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{subtitle} · {entry.created_at.slice(0, 10)}</div>
      </div>
    </button>
  );
}

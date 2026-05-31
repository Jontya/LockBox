import { Key, User } from 'lucide-react';
import type { VaultEntry } from '../../types/vault';

interface Props {
  entry: VaultEntry;
  onClick: () => void;
}

export default function EntryCard({ entry, onClick }: Props) {
  const Icon = entry.type === 'api_key' ? Key : User;
  const iconColor = entry.type === 'api_key' ? 'text-blue-400' : 'text-purple-400';
  const subtitle = entry.type === 'api_key' ? 'API Key' : 'Account';

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={onClick}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-100 truncate">{entry.label}</div>
        <div className="text-xs text-zinc-500">
          {subtitle} · {entry.created_at}
        </div>
      </div>
    </div>
  );
}

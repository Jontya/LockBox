import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useVaultStore } from '../../store/vaultStore';
import type { VaultEntry } from '../../types/vault';
import EntryCard from './EntryCard';

interface Props {
  onAddEntry: () => void;
}

function sortEntries(entries: VaultEntry[], sort: string): VaultEntry[] {
  return [...entries].sort((a, b) => {
    switch (sort) {
      case 'newest': return b.created_at.localeCompare(a.created_at);
      case 'oldest': return a.created_at.localeCompare(b.created_at);
      case 'az': return a.label.localeCompare(b.label);
      case 'za': return b.label.localeCompare(a.label);
      default: return 0;
    }
  });
}

export default function EntryList({ onAddEntry }: Props) {
  const { vaultData, selectedBucketId } = useVaultStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const buckets = vaultData?.buckets ?? [];

  const filterEntries = (entries: VaultEntry[]) => {
    const filtered = search
      ? entries.filter(e => e.label.toLowerCase().includes(search.toLowerCase()))
      : entries;
    return sortEntries(filtered, sort);
  };

  const selectedBucket = selectedBucketId
    ? buckets.find(b => b.id === selectedBucketId)
    : null;

  const renderEmptyState = (hasSearch: boolean) => (
    <div className="text-zinc-500 text-sm text-center py-8">
      {hasSearch ? 'No entries match your search.' : 'No entries. Add one with the button above.'}
    </div>
  );

  const renderEntries = () => {
    if (selectedBucket) {
      const entries = filterEntries(selectedBucket.entries);
      if (entries.length === 0) return renderEmptyState(search.length > 0);
      return entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} onClick={() => {}} />
      ));
    }

    if (buckets.length === 0) {
      return (
        <div className="text-zinc-500 text-sm text-center py-8">
          Create a bucket to get started.
        </div>
      );
    }

    return buckets.map((bucket, idx) => {
      const entries = filterEntries(bucket.entries);
      return (
        <div key={bucket.id}>
          <div className={`text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1.5 ${idx === 0 ? 'mt-0' : 'mt-2'}`}>
            {bucket.name}
          </div>
          {entries.length === 0
            ? renderEmptyState(search.length > 0)
            : entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} onClick={() => {}} />
              ))}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <input
          className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-zinc-800 border border-zinc-600 rounded-md px-2 py-1.5 text-sm text-zinc-300"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5"
          onClick={onAddEntry}
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-1">
        {renderEntries()}
      </div>
    </div>
  );
}

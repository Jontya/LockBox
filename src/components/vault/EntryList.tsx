import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useVaultStore } from '../../store/vaultStore';
import type { VaultEntry } from '../../types/vault';
import EntryCard from './EntryCard';
import { getBucketColor } from '../../lib/bucketColors';
import EntryDetailModal from './EntryDetailModal';
import AddEditEntryModal from './AddEditEntryModal';
import ConfirmDeleteEntryModal from './ConfirmDeleteEntryModal';

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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-zinc-600 text-sm text-center py-10">{message}</div>
  );
}

export default function EntryList({ onAddEntry: _onAddEntry }: Props) {
  const { vaultData, selectedBucketId } = useVaultStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const buckets = vaultData?.buckets ?? [];

  const filterEntries = (entries: VaultEntry[]) => {
    const filtered = search
      ? entries.filter(e => e.label.toLowerCase().includes(search.toLowerCase()))
      : entries;
    return sortEntries(filtered, sort);
  };

  const selectedBucket = selectedBucketId ? buckets.find(b => b.id === selectedBucketId) : null;

  const renderEntries = () => {
    if (selectedBucket) {
      const entries = filterEntries(selectedBucket.entries);
      if (entries.length === 0) return <EmptyState message={search ? 'No entries match your search.' : 'No entries. Add one above.'} />;
      const color = getBucketColor(selectedBucket.color);
      return entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} bucketColor={color} />
      ));
    }

    if (buckets.length === 0) return <EmptyState message="Create a bucket to get started." />;

    return buckets.map((bucket, idx) => {
      const entries = filterEntries(bucket.entries);
      return (
        <div key={bucket.id}>
          <div className={`text-xs font-medium text-zinc-500 px-2 py-1.5 ${idx === 0 ? '' : 'mt-3'}`}>
            {bucket.name}
          </div>
          {entries.length === 0
            ? <EmptyState message={search ? 'No entries match.' : 'No entries yet.'} />
            : entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} bucketColor={getBucketColor(bucket.color)} />
              ))}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800">
        <input
          className="field flex-1"
          placeholder="Search entries…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="field !w-auto cursor-pointer"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <button className="btn-primary btn-sm flex-shrink-0" onClick={() => setShowAdd(true)}>
          <Plus size={13} />
          Add
        </button>
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto py-1.5 px-2">
        {renderEntries()}
      </div>

      {selectedEntry && !showEdit && !showDelete && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={() => setShowEdit(true)}
          onDelete={() => setShowDelete(true)}
        />
      )}
      {showAdd && (
        <AddEditEntryModal bucketId={selectedBucketId ?? undefined} onClose={() => setShowAdd(false)} />
      )}
      {showEdit && selectedEntry && (
        <AddEditEntryModal
          entry={selectedEntry}
          onClose={() => { setShowEdit(false); setSelectedEntry(null); }}
        />
      )}
      {showDelete && selectedEntry && (
        <ConfirmDeleteEntryModal
          entry={selectedEntry}
          onClose={() => { setShowDelete(false); setSelectedEntry(null); }}
        />
      )}
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Key, User } from 'lucide-react';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket, VaultEntry } from '../../types/vault';

interface SearchResult {
  bucket: Bucket;
  entry: VaultEntry;
}

interface Props {
  onClose: () => void;
}

export default function GlobalSearchOverlay({ onClose }: Props) {
  const { vaultData, setSelectedBucketId } = useVaultStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allResults: SearchResult[] = query.trim()
    ? (vaultData?.buckets ?? []).flatMap((bucket) =>
        bucket.entries
          .filter((entry) => entry.label.toLowerCase().includes(query.toLowerCase()))
          .map((entry) => ({ bucket, entry }))
      )
    : [];

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedBucketId(result.bucket.id);
      onClose();
    },
    [setSelectedBucketId, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    }
  };

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Group results by bucket
  const grouped: { bucket: Bucket; entries: { entry: VaultEntry; globalIndex: number }[] }[] = [];
  let globalIndex = 0;
  for (const result of allResults) {
    let group = grouped.find((g) => g.bucket.id === result.bucket.id);
    if (!group) {
      group = { bucket: result.bucket, entries: [] };
      grouped.push(group);
    }
    group.entries.push({ entry: result.entry, globalIndex: globalIndex++ });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search all entries..."
            className="bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 text-base w-full px-0 py-3"
          />
        </div>

        {query.trim() && (
          <div className="border-t border-zinc-700 max-h-80 overflow-y-auto">
            {allResults.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">No entries found.</p>
            ) : (
              grouped.map(({ bucket, entries }) => (
                <div key={bucket.id}>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-2">
                    {bucket.name}
                  </div>
                  {entries.map(({ entry, globalIndex: gi }) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${
                        gi === selectedIndex ? 'bg-zinc-700' : 'hover:bg-zinc-700'
                      }`}
                      onClick={() => handleSelect({ bucket, entry })}
                      onMouseEnter={() => setSelectedIndex(gi)}
                    >
                      {entry.type === 'api_key' ? (
                        <Key className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-zinc-100 flex-1">{entry.label}</span>
                      <span className="text-xs text-zinc-500">
                        {entry.type === 'api_key' ? 'API Key' : 'Account'}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="border-t border-zinc-700">
            <p className="text-zinc-500 text-sm text-center py-8">Type to search</p>
          </div>
        )}
      </div>
    </div>
  );
}

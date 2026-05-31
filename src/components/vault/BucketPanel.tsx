import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Lock, Plus, Settings } from 'lucide-react';
import { getBucketColor } from '../../lib/bucketColors';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import ConfirmDeleteBucketModal from './ConfirmDeleteBucketModal';
import CreateBucketModal from './CreateBucketModal';
import EditBucketModal from './EditBucketModal';

interface ContextMenuState { bucketId: string; x: number; y: number; }

interface Props {
  onSettingsOpen: () => void;
  onLock: () => void;
}

export default function BucketPanel({ onSettingsOpen, onLock }: Props) {
  const { vaultData, selectedBucketId, setSelectedBucketId } = useVaultStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editBucket, setEditBucket] = useState<Bucket | null>(null);
  const [deleteBucket, setDeleteBucket] = useState<Bucket | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, bucketId: string) => {
    e.preventDefault();
    setContextMenu({ bucketId, x: e.clientX, y: e.clientY });
  };

  const toggleExpand = (bucketId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(bucketId)) next.delete(bucketId);
      else next.add(bucketId);
      return next;
    });
  };

  const buckets = vaultData?.buckets ?? [];
  const contextBucket = contextMenu ? buckets.find(b => b.id === contextMenu.bucketId) : null;

  const ctxMenuStyle: React.CSSProperties = contextMenu
    ? { position: 'fixed', left: contextMenu.x, top: contextMenu.y, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }
    : {};

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      <div className="flex-1 overflow-y-auto py-2">

        {/* Overview */}
        <button
          onClick={() => setSelectedBucketId(null)}
          className={`flex items-center gap-2.5 h-9 w-full px-4 text-left text-sm
            transition-[background-color,color] duration-150
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-500
            ${selectedBucketId === null
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
            }`}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-zinc-500" />
          <span className="truncate flex-1">Overview</span>
        </button>

        {/* Divider */}
        {buckets.length > 0 && <div className="mx-4 my-1.5 border-t border-zinc-800" />}

        {buckets.length === 0 ? (
          <p className="text-xs text-zinc-600 px-4 py-3">No buckets yet.</p>
        ) : (
          buckets.map(bucket => {
            const isExpanded = expanded.has(bucket.id);
            const color = getBucketColor(bucket.color);
            return (
              <div key={bucket.id}>
                <div className={`flex items-center h-9 w-full pr-1
                  ${selectedBucketId === bucket.id ? 'bg-zinc-800' : ''}`}>
                  {/* Chevron toggle */}
                  <button
                    onClick={() => toggleExpand(bucket.id)}
                    className="flex items-center justify-center w-6 h-9 ml-2 flex-shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors duration-100
                               focus-visible:outline-none"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {/* Bucket name */}
                  <button
                    onClick={() => setSelectedBucketId(bucket.id)}
                    onContextMenu={e => handleContextMenu(e, bucket.id)}
                    className={`flex items-center gap-2 flex-1 h-9 min-w-0 text-left text-sm
                      transition-[color] duration-150
                      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-500
                      ${selectedBucketId === bucket.id
                        ? 'text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate">{bucket.name}</span>
                  </button>
                </div>

                {/* Expanded entries */}
                {isExpanded && bucket.entries.length > 0 && (
                  <div className="pb-0.5">
                    {bucket.entries.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedBucketId(bucket.id)}
                        className="flex items-center gap-2 w-full h-7 pl-10 pr-3 text-xs text-zinc-500 hover:text-zinc-300
                                   hover:bg-zinc-800/50 transition-colors duration-100 text-left focus-visible:outline-none"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate">{entry.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {isExpanded && bucket.entries.length === 0 && (
                  <div className="pl-10 pr-3 py-1 text-xs text-zinc-700">Empty</div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-zinc-800">
        <div className="flex items-center px-3 pt-2 gap-1">
          <button
            onClick={onSettingsOpen}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 flex-1 px-2 py-1.5 rounded
                       transition-[color] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Settings"
          >
            <Settings size={13} />
            Settings
          </button>
          <button
            onClick={onLock}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 flex-1 px-2 py-1.5 rounded
                       transition-[color] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Lock vault"
          >
            <Lock size={13} />
            Lock
          </button>
        </div>
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 w-full px-2 py-1.5 rounded
                       transition-[color] duration-150
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <Plus size={13} />
            New Bucket
          </button>
        </div>
      </div>

      {contextMenu && contextBucket && (
        <div
          ref={contextMenuRef}
          style={ctxMenuStyle}
          className="bg-zinc-800 border border-zinc-700 rounded-md z-50 py-1 min-w-[144px]"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors duration-100"
            onClick={() => { setEditBucket(contextBucket); setContextMenu(null); }}
          >
            Rename / recolour
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors duration-100"
            onClick={() => { setDeleteBucket(contextBucket); setContextMenu(null); }}
          >
            Delete
          </button>
        </div>
      )}

      {showCreate && <CreateBucketModal onClose={() => setShowCreate(false)} />}
      {editBucket && <EditBucketModal bucket={editBucket} onClose={() => setEditBucket(null)} />}
      {deleteBucket && <ConfirmDeleteBucketModal bucket={deleteBucket} onClose={() => setDeleteBucket(null)} />}
    </div>
  );
}

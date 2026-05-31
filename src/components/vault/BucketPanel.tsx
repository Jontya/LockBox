import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { getBucketColor } from '../../lib/bucketColors';
import { useVaultStore } from '../../store/vaultStore';
import type { Bucket } from '../../types/vault';
import ConfirmDeleteBucketModal from './ConfirmDeleteBucketModal';
import CreateBucketModal from './CreateBucketModal';
import EditBucketModal from './EditBucketModal';

interface ContextMenuState { bucketId: string; x: number; y: number; }

export default function BucketPanel() {
  const { vaultData, selectedBucketId, setSelectedBucketId } = useVaultStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editBucket, setEditBucket] = useState<Bucket | null>(null);
  const [deleteBucket, setDeleteBucket] = useState<Bucket | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
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

  const buckets = vaultData?.buckets ?? [];
  const contextBucket = contextMenu ? buckets.find(b => b.id === contextMenu.bucketId) : null;

  const ctxMenuStyle: React.CSSProperties = contextMenu
    ? { position: 'fixed', left: contextMenu.x, top: contextMenu.y, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }
    : {};

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      <div className="flex-1 overflow-y-auto py-2">
        {buckets.length === 0 ? (
          <p className="text-xs text-zinc-600 px-4 py-3">No buckets yet.</p>
        ) : (
          buckets.map(bucket => (
            <button
              key={bucket.id}
              onClick={() => setSelectedBucketId(bucket.id)}
              onContextMenu={e => handleContextMenu(e, bucket.id)}
              className={`flex items-center gap-2.5 h-9 w-full px-4 text-left text-sm
                transition-[background-color,color] duration-150
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-500
                ${selectedBucketId === bucket.id
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getBucketColor(bucket.color) }}
              />
              <span className="truncate flex-1">{bucket.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-3 border-t border-zinc-800">
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

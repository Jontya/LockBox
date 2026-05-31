import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { ParsedEntry, CsvParseResult, ApiKeyEntry, AccountEntry } from '../../types/vault';

interface Props {
  onClose: () => void;
}

type Tab = 'env' | 'csv';
type EntryType = 'api_key' | 'account';

export default function ImportModal({ onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const [tab, setTab] = useState<Tab>('env');

  // ENV state
  const [envEntries, setEnvEntries] = useState<ParsedEntry[]>([]);
  const [envBucketId, setEnvBucketId] = useState<string>('');

  // CSV state
  const [csvResult, setCsvResult] = useState<CsvParseResult | null>(null);
  const [csvRaw, setCsvRaw] = useState<string>('');
  const [csvBucketId, setCsvBucketId] = useState<string>('');
  const [csvLabelCol, setCsvLabelCol] = useState<string>('');
  const [csvValueCol, setCsvValueCol] = useState<string>('');
  const [csvUsernameCol, setCsvUsernameCol] = useState<string>('');
  const [csvNotesCol, setCsvNotesCol] = useState<string>('');
  const [csvEntryType, setCsvEntryType] = useState<EntryType>('api_key');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Set default bucket when vaultData loads
  useEffect(() => {
    if (vaultData?.buckets.length) {
      const first = vaultData.buckets[0].id;
      if (!envBucketId) setEnvBucketId(first);
      if (!csvBucketId) setCsvBucketId(first);
    }
  }, [vaultData]);

  const handlePickEnv = async () => {
    const path = await open({ filters: [{ name: 'ENV', extensions: ['env', 'txt'] }], multiple: false });
    if (typeof path !== 'string') return;
    const content = await readTextFile(path);
    const entries = await tauriApi.parseEnvFile(content);
    setEnvEntries(entries);
  };

  const handleImportEnv = async () => {
    if (!vaultData || !envBucketId || envEntries.length === 0) return;
    const newEntries: ApiKeyEntry[] = envEntries.map(e => ({
      type: 'api_key',
      id: crypto.randomUUID(),
      label: e.label,
      value: e.value,
      notes: '',
      created_at: new Date().toISOString(),
      archived: false,
    }));
    const updated = {
      ...vaultData,
      buckets: vaultData.buckets.map(b =>
        b.id === envBucketId ? { ...b, entries: [...b.entries, ...newEntries] } : b
      ),
    };
    setVaultData(updated);
    await tauriApi.saveVaultData(updated);
    toast.success(`Imported ${newEntries.length} entries`);
    onClose();
  };

  const handlePickCsv = async () => {
    const path = await open({ filters: [{ name: 'CSV', extensions: ['csv'] }], multiple: false });
    if (typeof path !== 'string') return;
    const content = await readTextFile(path);
    setCsvRaw(content);
    const result = await tauriApi.parseCsvFile(content);
    setCsvResult(result);
    if (result.headers.length > 0) setCsvLabelCol(result.headers[0]);
    if (result.headers.length > 1) setCsvValueCol(result.headers[1]);
  };

  const handleImportCsv = async () => {
    if (!vaultData || !csvBucketId || !csvRaw || !csvLabelCol || !csvValueCol) return;
    const lines = csvRaw.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    const labelIdx = headers.indexOf(csvLabelCol);
    const valueIdx = headers.indexOf(csvValueCol);
    const usernameIdx = csvUsernameCol ? headers.indexOf(csvUsernameCol) : -1;
    const notesIdx = csvNotesCol ? headers.indexOf(csvNotesCol) : -1;

    const newEntries: Array<ApiKeyEntry | AccountEntry> = dataRows
      .filter(row => row.length > Math.max(labelIdx, valueIdx))
      .map(row => {
        const label = labelIdx >= 0 ? (row[labelIdx] ?? '') : '';
        const value = valueIdx >= 0 ? (row[valueIdx] ?? '') : '';
        const notes = notesIdx >= 0 ? (row[notesIdx] ?? '') : '';
        if (csvEntryType === 'account') {
          const username = usernameIdx >= 0 ? (row[usernameIdx] ?? '') : '';
          const entry: AccountEntry = {
            type: 'account',
            id: crypto.randomUUID(),
            label,
            username,
            password: value,
            notes,
            created_at: new Date().toISOString(),
            archived: false,
          };
          return entry;
        } else {
          const entry: ApiKeyEntry = {
            type: 'api_key',
            id: crypto.randomUUID(),
            label,
            value,
            notes,
            created_at: new Date().toISOString(),
            archived: false,
          };
          return entry;
        }
      });

    const updated = {
      ...vaultData,
      buckets: vaultData.buckets.map(b =>
        b.id === csvBucketId ? { ...b, entries: [...b.entries, ...newEntries] } : b
      ),
    };
    setVaultData(updated);
    await tauriApi.saveVaultData(updated);
    toast.success(`Imported ${newEntries.length} entries`);
    onClose();
  };

  const buckets = vaultData?.buckets ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-xl mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <span className="text-sm font-semibold text-zinc-100">Import</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-zinc-700">
          {(['env', 'csv'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {t === 'env' ? 'ENV File' : 'CSV File'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          {tab === 'env' && (
            <>
              <button
                onClick={handlePickEnv}
                className="self-start text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              >
                Choose .env file
              </button>

              {envEntries.length > 0 && (
                <>
                  <div className="text-xs text-zinc-400">{envEntries.length} entries found</div>
                  <div className="rounded border border-zinc-700 overflow-hidden">
                    {envEntries.map((e, i) => (
                      <div key={i} className="flex justify-between px-3 py-1.5 text-sm even:bg-zinc-700/30">
                        <span className="text-xs text-zinc-300 font-mono">{e.label}</span>
                        <span className="text-xs text-zinc-400 font-mono">••••••••</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-300 shrink-0">Destination bucket</label>
                    <select
                      value={envBucketId}
                      onChange={e => setEnvBucketId(e.target.value)}
                      className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                    >
                      {buckets.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleImportEnv}
                    className="self-start text-sm px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Import
                  </button>
                </>
              )}
            </>
          )}

          {tab === 'csv' && (
            <>
              <button
                onClick={handlePickCsv}
                className="self-start text-sm px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              >
                Choose CSV file
              </button>

              {csvResult && (
                <>
                  <div className="text-xs text-zinc-400">{csvResult.total_rows} total rows</div>

                  {/* Preview table */}
                  <div className="overflow-x-auto rounded border border-zinc-700">
                    <table className="text-xs font-mono w-full border-collapse">
                      <thead>
                        <tr>
                          {csvResult.headers.map(h => (
                            <th key={h} className="border border-zinc-600 px-2 py-1 text-zinc-300 bg-zinc-700/50 text-left">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvResult.preview_rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-zinc-600 px-2 py-1 text-zinc-400">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Column mapping */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-zinc-300 w-40 shrink-0">Label column <span className="text-zinc-500">(required)</span></label>
                      <select
                        value={csvLabelCol}
                        onChange={e => setCsvLabelCol(e.target.value)}
                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                      >
                        <option value="">— select —</option>
                        {csvResult.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-zinc-300 w-40 shrink-0">Value/Password <span className="text-zinc-500">(required)</span></label>
                      <select
                        value={csvValueCol}
                        onChange={e => setCsvValueCol(e.target.value)}
                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                      >
                        <option value="">— select —</option>
                        {csvResult.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-zinc-300 w-40 shrink-0">Username <span className="text-zinc-500">(optional)</span></label>
                      <select
                        value={csvUsernameCol}
                        onChange={e => setCsvUsernameCol(e.target.value)}
                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                      >
                        <option value="">— none —</option>
                        {csvResult.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-zinc-300 w-40 shrink-0">Notes <span className="text-zinc-500">(optional)</span></label>
                      <select
                        value={csvNotesCol}
                        onChange={e => setCsvNotesCol(e.target.value)}
                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                      >
                        <option value="">— none —</option>
                        {csvResult.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Entry type toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-300">Entry type</span>
                    <div className="flex rounded overflow-hidden border border-zinc-600">
                      {(['api_key', 'account'] as EntryType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setCsvEntryType(t)}
                          className={`px-3 py-1 text-sm transition-colors ${
                            csvEntryType === t
                              ? 'bg-zinc-600 text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-100'
                          }`}
                        >
                          {t === 'api_key' ? 'API Key' : 'Account'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-300 shrink-0">Destination bucket</label>
                    <select
                      value={csvBucketId}
                      onChange={e => setCsvBucketId(e.target.value)}
                      className="flex-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 px-2 py-1"
                    >
                      {buckets.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleImportCsv}
                    disabled={!csvLabelCol || !csvValueCol}
                    className="self-start text-sm px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

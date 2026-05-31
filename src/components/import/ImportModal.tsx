import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';
import type { ParsedEntry, CsvParseResult, ApiKeyEntry, AccountEntry } from '../../types/vault';

interface Props { onClose: () => void; }
type Tab = 'env' | 'csv';
type EntryType = 'api_key' | 'account';

const colSelect = 'bg-zinc-700 border border-zinc-600 rounded-md text-sm text-zinc-100 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full';

export default function ImportModal({ onClose }: Props) {
  const { vaultData, setVaultData } = useVaultStore();
  const [tab, setTab] = useState<Tab>('env');

  const [envEntries, setEnvEntries] = useState<ParsedEntry[]>([]);
  const [envBucketId, setEnvBucketId] = useState<string>('');

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
      type: 'api_key', id: crypto.randomUUID(), label: e.label, value: e.value,
      notes: '', created_at: new Date().toISOString(), archived: false,
    }));
    const updated = { ...vaultData, buckets: vaultData.buckets.map(b =>
      b.id === envBucketId ? { ...b, entries: [...b.entries, ...newEntries] } : b) };
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
          return { type: 'account', id: crypto.randomUUID(), label, username, password: value, notes, created_at: new Date().toISOString(), archived: false } as AccountEntry;
        }
        return { type: 'api_key', id: crypto.randomUUID(), label, value, notes, created_at: new Date().toISOString(), archived: false } as ApiKeyEntry;
      });
    const updated = { ...vaultData, buckets: vaultData.buckets.map(b =>
      b.id === csvBucketId ? { ...b, entries: [...b.entries, ...newEntries] } : b) };
    setVaultData(updated);
    await tauriApi.saveVaultData(updated);
    toast.success(`Imported ${newEntries.length} entries`);
    onClose();
  };

  const buckets = vaultData?.buckets ?? [];

  return (
    <div className="modal-backdrop">
      <div className="modal-box max-w-xl flex flex-col max-h-[80vh] !p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <span className="text-sm font-semibold text-zinc-100">Import</span>
          <button onClick={onClose} className="icon-btn"><X size={15} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          {(['env', 'csv'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-[background-color,color] duration-150
                ${tab === t ? 'text-zinc-100 border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t === 'env' ? '.env file' : 'CSV file'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          {tab === 'env' && (
            <>
              <button onClick={handlePickEnv} className="btn-subtle btn-sm w-fit">Choose .env file</button>
              {envEntries.length > 0 && (
                <>
                  <p className="text-xs text-zinc-500">{envEntries.length} entries found</p>
                  <div className="rounded-md border border-zinc-700 overflow-hidden">
                    {envEntries.map((e, i) => (
                      <div key={i} className="flex justify-between px-3 py-1.5 even:bg-zinc-700/20">
                        <span className="text-xs text-zinc-300 font-mono">{e.label}</span>
                        <span className="text-xs text-zinc-600 font-mono">••••••••</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-400 flex-shrink-0">Destination bucket</label>
                    <select value={envBucketId} onChange={e => setEnvBucketId(e.target.value)} className={colSelect}>
                      {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleImportEnv} className="btn-primary btn-sm w-fit">
                    Import {envEntries.length} entries
                  </button>
                </>
              )}
            </>
          )}

          {tab === 'csv' && (
            <>
              <button onClick={handlePickCsv} className="btn-subtle btn-sm w-fit">Choose CSV file</button>
              {csvResult && (
                <>
                  <p className="text-xs text-zinc-500">{csvResult.total_rows} rows detected</p>
                  {/* Preview */}
                  <div className="overflow-x-auto rounded-md border border-zinc-700">
                    <table className="text-xs font-mono w-full border-collapse">
                      <thead>
                        <tr>{csvResult.headers.map(h => (
                          <th key={h} className="border border-zinc-700 px-2 py-1.5 text-zinc-400 bg-zinc-700/40 text-left font-medium">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>{csvResult.preview_rows.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => (
                          <td key={j} className="border border-zinc-700 px-2 py-1 text-zinc-500">{cell}</td>
                        ))}</tr>
                      ))}</tbody>
                    </table>
                  </div>
                  {/* Column mapping */}
                  <div className="grid grid-cols-[160px_1fr] gap-x-3 gap-y-2.5 items-center">
                    {[
                      { label: 'Label column', required: true, value: csvLabelCol, set: setCsvLabelCol, none: false },
                      { label: 'Value / Password', required: true, value: csvValueCol, set: setCsvValueCol, none: false },
                      { label: 'Username', required: false, value: csvUsernameCol, set: setCsvUsernameCol, none: true },
                      { label: 'Notes', required: false, value: csvNotesCol, set: setCsvNotesCol, none: true },
                    ].map(col => (
                      <>
                        <label key={col.label + 'l'} className="text-sm text-zinc-400">
                          {col.label}{col.required && <span className="text-zinc-600 ml-1">(required)</span>}
                        </label>
                        <select key={col.label + 's'} value={col.value} onChange={e => col.set(e.target.value)} className={colSelect}>
                          {col.none && <option value="">— none —</option>}
                          {!col.none && <option value="">— select —</option>}
                          {csvResult.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </>
                    ))}
                  </div>
                  {/* Entry type */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">Import as</span>
                    <div className="flex gap-1 p-1 bg-zinc-700/40 rounded-md">
                      {(['api_key', 'account'] as EntryType[]).map(t => (
                        <button key={t} onClick={() => setCsvEntryType(t)}
                          className={`text-xs px-3 py-1.5 rounded transition-[background-color,color] duration-150
                            ${csvEntryType === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                          {t === 'api_key' ? 'API Key' : 'Account'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Destination */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-400 flex-shrink-0">Destination bucket</label>
                    <select value={csvBucketId} onChange={e => setCsvBucketId(e.target.value)} className={colSelect}>
                      {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleImportCsv}
                    disabled={!csvLabelCol || !csvValueCol}
                    className="btn-primary btn-sm w-fit"
                  >
                    Import rows
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

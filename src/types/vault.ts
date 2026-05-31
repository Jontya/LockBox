export type VaultEntryType = 'api_key' | 'account';

export interface ApiKeyEntry {
  type: 'api_key';
  id: string;
  label: string;
  value: string;
  notes: string;
  created_at: string;
  archived: boolean;
}

export interface AccountEntry {
  type: 'account';
  id: string;
  label: string;
  username: string;
  password: string;
  notes: string;
  created_at: string;
  archived: boolean;
}

export type VaultEntry = ApiKeyEntry | AccountEntry;

export interface Bucket {
  id: string;
  name: string;
  color: string;
  created_at: string;
  entries: VaultEntry[];
}

export interface VaultData {
  version: number;
  buckets: Bucket[];
}

export interface AppConfig {
  auto_lock_minutes: number;
  clipboard_clear_seconds: number;
  backup_path: string | null;
  lock_on_minimise: boolean;
  always_on_top: boolean;
  theme: string;
}

export interface ParsedEntry {
  label: string;
  value: string;
}

export interface CsvParseResult {
  headers: string[];
  preview_rows: string[][];
  total_rows: number;
}

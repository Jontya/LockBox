import { invoke } from '@tauri-apps/api/core';
import type { VaultData, AppConfig, ParsedEntry, CsvParseResult } from '../types/vault';

export const tauriApi = {
  vaultExists: () => invoke<boolean>('vault_exists'),
  createVault: (password: string) => invoke<void>('create_vault', { password }),
  unlockVault: (password: string) => invoke<boolean>('unlock_vault', { password }),
  lockVault: () => invoke<void>('lock_vault'),
  changePassword: (current: string, newPassword: string) =>
    invoke<void>('change_password', { current, new_password: newPassword }),
  getVaultData: () => invoke<VaultData>('get_vault_data'),
  saveVaultData: (data: VaultData) => invoke<void>('save_vault_data', { data }),
  getConfig: () => invoke<AppConfig>('get_config'),
  saveConfig: (config: AppConfig) => invoke<void>('save_config', { config }),
  setBackupPath: (path: string) => invoke<void>('set_backup_path', { path }),
  backupNow: () => invoke<void>('backup_now'),
  parseEnvFile: (content: string) => invoke<ParsedEntry[]>('parse_env_file', { content }),
  parseCsvFile: (content: string) => invoke<CsvParseResult>('parse_csv_file', { content }),
};

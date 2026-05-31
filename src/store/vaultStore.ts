import { create } from 'zustand';
import type { VaultData, AppConfig } from '../types/vault';

export type AppState = 'loading' | 'setup' | 'locked' | 'unlocked';

interface VaultStore {
  appState: AppState;
  vaultData: VaultData | null;
  config: AppConfig | null;
  selectedBucketId: string | null;
  wasAutoLocked: boolean;

  setAppState: (state: AppState) => void;
  setVaultData: (data: VaultData | null) => void;
  setConfig: (config: AppConfig | null) => void;
  setSelectedBucketId: (id: string | null) => void;
  setWasAutoLocked: (v: boolean) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  appState: 'loading',
  vaultData: null,
  config: null,
  selectedBucketId: null,
  wasAutoLocked: false,

  setAppState: (appState) => set({ appState }),
  setVaultData: (vaultData) => set({ vaultData }),
  setConfig: (config) => set({ config }),
  setSelectedBucketId: (selectedBucketId) => set({ selectedBucketId }),
  setWasAutoLocked: (wasAutoLocked) => set({ wasAutoLocked }),
}));

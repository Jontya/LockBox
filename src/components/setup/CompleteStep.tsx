import toast from 'react-hot-toast';
import { tauriApi } from '../../lib/tauri';
import { useVaultStore } from '../../store/vaultStore';

export default function CompleteStep() {
  const { setAppState, setVaultData } = useVaultStore();

  async function handleOpen() {
    try {
      const data = await tauriApi.getVaultData();
      setVaultData(data);
      setAppState('unlocked');
    } catch (err) {
      toast.error(String(err));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-zinc-100">Your vault is ready</h2>
        <p className="text-sm text-zinc-400">LockBox is set up and your vault is encrypted.</p>
      </div>

      <div className="bg-zinc-800 rounded-lg p-4 flex flex-col gap-1">
        <span className="text-xs text-zinc-400">Vault location</span>
        <span className="text-sm text-zinc-300 font-mono">%APPDATA%\LockBox\vault.dat</span>
      </div>

      <button
        onClick={handleOpen}
        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white w-fit"
      >
        Open LockBox
      </button>
    </div>
  );
}

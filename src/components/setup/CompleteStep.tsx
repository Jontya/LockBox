import { CheckCircle } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Your vault is ready</h2>
          <p className="text-sm text-zinc-500">Your vault is encrypted and saved locally.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Vault location</span>
        <span className="text-xs text-zinc-400 font-mono">%APPDATA%\LockBox\vault.dat</span>
      </div>

      <button onClick={handleOpen} className="btn-primary w-fit">
        Open LockBox
      </button>
    </div>
  );
}

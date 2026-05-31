interface Props {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl font-bold">🔒 LockBox</div>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium text-zinc-100">Your credentials, encrypted locally.</p>
        <p className="text-sm text-zinc-400">Zero cloud. Zero network. Just you.</p>
      </div>
      <button
        onClick={onNext}
        className="mt-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white"
      >
        Get Started
      </button>
    </div>
  );
}

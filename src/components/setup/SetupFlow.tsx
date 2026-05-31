import { useState } from 'react';
import WelcomeStep from './WelcomeStep';
import CreatePasswordStep from './CreatePasswordStep';
import BackupStep from './BackupStep';
import CompleteStep from './CompleteStep';

type Step = 'welcome' | 'password' | 'backup' | 'complete';

export default function SetupFlow() {
  const [step, setStep] = useState<Step>('welcome');

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full">
        {step === 'welcome' && <WelcomeStep onNext={() => setStep('password')} />}
        {step === 'password' && <CreatePasswordStep onNext={() => setStep('backup')} />}
        {step === 'backup' && <BackupStep onNext={() => setStep('complete')} />}
        {step === 'complete' && <CompleteStep />}
      </div>
    </div>
  );
}

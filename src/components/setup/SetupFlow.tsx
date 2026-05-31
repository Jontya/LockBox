import { useState } from 'react';
import WelcomeStep from './WelcomeStep';
import CreatePasswordStep from './CreatePasswordStep';
import BackupStep from './BackupStep';
import CompleteStep from './CompleteStep';

type Step = 'welcome' | 'password' | 'backup' | 'complete';

export default function SetupFlow() {
  const [step, setStep] = useState<Step>('welcome');

  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 overflow-y-auto py-6">
      <div
        className="bg-zinc-800 rounded-xl w-full max-w-md mx-4 p-7"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)' }}
      >
        {step === 'welcome'   && <WelcomeStep onNext={() => setStep('password')} />}
        {step === 'password'  && <CreatePasswordStep onNext={() => setStep('backup')} />}
        {step === 'backup'    && <BackupStep onNext={() => setStep('complete')} />}
        {step === 'complete'  && <CompleteStep />}
      </div>
    </div>
  );
}

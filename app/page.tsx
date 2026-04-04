'use client';

import { useApp } from '@/lib/context';
import ProgressBar from '@/components/shared/ProgressBar';
import UnitToggle from '@/components/shared/UnitToggle';
import StepOne from '@/components/StepOne/StepOne';
import StepTwo from '@/components/StepTwo/StepTwo';
import StepThree from '@/components/StepThree/StepThree';

export default function Home() {
  const { currentStep, startOver } = useApp();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28 sm:pb-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            <span className="text-[#E8601C]">Gravel</span>Fuel
          </h1>
          <p className="text-xs text-[#444444]">
            Ride Fueling & Hydration Planner
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <UnitToggle />
          {currentStep > 1 && (
            <button
              onClick={startOver}
              className="text-xs text-[#444444] hover:text-[#E8601C] font-medium"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Progress */}
      <ProgressBar />

      {/* Steps */}
      <main className="mt-6">
        {currentStep === 1 && <StepOne />}
        {currentStep === 2 && <StepTwo />}
        {currentStep === 3 && <StepThree />}
      </main>
    </div>
  );
}

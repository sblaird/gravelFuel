'use client';

import { useApp } from '@/lib/context';
import DurationPicker from './DurationPicker';
import IntensitySelector from './IntensitySelector';

export default function StepOne() {
  const { durationMinutes, intensity, goToStep, recalculate } = useApp();

  const isValid = durationMinutes >= 30 && durationMinutes <= 1440 && intensity !== null;

  const handleNext = () => {
    if (!isValid) return;
    recalculate();
    goToStep(2);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Step 1: Ride Inputs
        </h2>
        <p className="text-sm text-[#444444] mt-1">
          How long and how hard will you ride?
        </p>
      </div>

      <DurationPicker />
      <IntensitySelector />

      {!intensity && (
        <p className="text-sm text-red-600" role="alert">
          Select an intensity level to continue.
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none z-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full rounded-xl bg-[#E8601C] py-3.5 text-base font-bold text-white transition-opacity disabled:opacity-40 sm:w-auto sm:px-8"
        >
          Calculate Targets
        </button>
      </div>
    </div>
  );
}

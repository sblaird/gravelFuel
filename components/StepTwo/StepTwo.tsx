'use client';

import { useApp } from '@/lib/context';
import TargetDisplay from './TargetDisplay';
import WeatherDisplay from './WeatherDisplay';
import CarbSlider from './CarbSlider';

export default function StepTwo() {
  const { plan, goToStep, recalculate } = useApp();

  const handleNext = () => {
    recalculate();
    goToStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Step 2: Your Targets
        </h2>
        <p className="text-sm text-[#444444] mt-1">
          Here&apos;s what your body needs for this ride.
        </p>
      </div>

      <WeatherDisplay />
      <TargetDisplay />
      <CarbSlider />

      <div className="flex gap-3 fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none z-10">
        <button
          onClick={() => goToStep(1)}
          className="rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-bold text-[#444444]"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!plan}
          className="flex-1 rounded-xl bg-[#E8601C] py-3.5 text-base font-bold text-white transition-opacity disabled:opacity-40 sm:flex-none sm:px-8"
        >
          Build Recipe
        </button>
      </div>
    </div>
  );
}

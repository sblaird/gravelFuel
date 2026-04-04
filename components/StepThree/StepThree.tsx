'use client';

import { useApp } from '@/lib/context';
import BottleConfig from './BottleConfig';
import GelSelector from './GelSelector';
import RecipeCard from './RecipeCard';
import GelSchedule from './GelSchedule';
import RideSummary from './RideSummary';
import ExportPlan from './ExportPlan';

export default function StepThree() {
  const { plan, goToStep } = useApp();

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Step 3: Your Fueling Recipe
        </h2>
        <p className="text-sm text-[#444444] mt-1">
          Exactly what to mix, eat, and carry.
        </p>
      </div>

      <BottleConfig />
      <RecipeCard />
      <GelSelector />
      <GelSchedule />
      <RideSummary />
      <ExportPlan />

      <div className="flex gap-3 fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none z-10">
        <button
          onClick={() => goToStep(2)}
          className="rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-bold text-[#444444]"
        >
          Back
        </button>
        <button
          onClick={() => goToStep(1)}
          className="flex-1 rounded-xl border-2 border-[#E8601C] py-3.5 text-base font-bold text-[#E8601C] sm:flex-none sm:px-8"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

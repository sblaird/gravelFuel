'use client';

import { useApp } from '@/lib/context';
import type { GatoradeVariant } from '@/types';
import GelSelector from './GelSelector';
import RecipeCard from './RecipeCard';
import GelSchedule from './GelSchedule';
import RideSummary from './RideSummary';
import ExportPlan from './ExportPlan';

const variants: { key: GatoradeVariant; label: string }[] = [
  { key: 'thirst_quencher', label: 'Gatorade Thirst Quencher' },
  { key: 'endurance', label: 'Gatorade Endurance' },
];

export default function StepThree() {
  const { gatoradeVariant, setGatoradeVariant, recalculate, goToStep } = useApp();

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Step 3: Your Fueling Recipe
        </h2>
        <p className="text-sm text-[#444444] mt-1">
          Total amounts for your ride — divide into bottles as you like.
        </p>
      </div>

      {/* Gatorade Variant */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1A1A1A]">
          Gatorade Powder
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          {variants.map((v) => (
            <button
              key={v.key}
              onClick={() => {
                setGatoradeVariant(v.key);
                recalculate();
              }}
              className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                gatoradeVariant === v.key
                  ? 'border-[#E8601C] bg-[#E8601C]/5 text-[#E8601C]'
                  : 'border-gray-200 text-[#444444]'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

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

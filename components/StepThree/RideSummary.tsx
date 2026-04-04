'use client';

import { useApp } from '@/lib/context';

export default function RideSummary() {
  const { plan } = useApp();

  if (!plan) return null;

  const hours = plan.inputs.durationMinutes / 60;

  return (
    <div className="rounded-xl bg-[#1A1A1A] p-4 space-y-3">
      <h3 className="text-sm font-bold text-white">Ride Summary</h3>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold text-[#E8601C]">
            {Math.round(plan.totalCarbsGhr)}
          </p>
          <p className="text-xs text-gray-400">g carbs/hr</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#E8601C]">
            {Math.round(plan.totalCarbsRide)}g
          </p>
          <p className="text-xs text-gray-400">Total Carbs</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#E8601C]">
            {plan.hydrationTargets.totalFluidL.toFixed(1)}L
          </p>
          <p className="text-xs text-gray-400">Total Fluid</p>
        </div>
      </div>

      {plan.gelRecipe && plan.gelRecipe.gelsPerHour > 0 && (
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
          {plan.drinkMix.carbsFromDrinkGhr}g/hr from drink mix +{' '}
          {plan.gelRecipe.carbsFromGelsGhr}g/hr from gels
        </div>
      )}

      <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
        {hours.toFixed(1)} hours &middot;{' '}
        {plan.hydrationTargets.fluidTargetLhr.toFixed(2)} L/hr
      </div>
    </div>
  );
}

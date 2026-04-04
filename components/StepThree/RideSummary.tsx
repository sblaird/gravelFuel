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
            {plan.drinkMix.totalBottles}
          </p>
          <p className="text-xs text-gray-400">
            {plan.drinkMix.totalBottles === 1 ? 'Bottle' : 'Bottles'}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#E8601C]">
            {plan.gelRecipe?.totalGels ?? 0}
          </p>
          <p className="text-xs text-gray-400">
            {(plan.gelRecipe?.totalGels ?? 0) === 1 ? 'Gel' : 'Gels'}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#E8601C]">
            {Math.round(plan.totalCarbsRide)}g
          </p>
          <p className="text-xs text-gray-400">Total Carbs</p>
        </div>
      </div>

      <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
        {hours.toFixed(1)} hours &middot; {Math.round(plan.totalCarbsGhr)}g
        carbs/hr &middot; {plan.drinkMix.bottlesPerHour} bottles/hr
      </div>
    </div>
  );
}

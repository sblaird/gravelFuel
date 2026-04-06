'use client';

import { useApp } from '@/lib/context';

export default function TargetDisplay() {
  const { plan } = useApp();

  if (!plan) return null;

  const { carbTargets, hydrationTargets } = plan;
  const hours = plan.inputs.durationMinutes / 60;

  const formatFluid = (liters: number) => {
    return liters >= 1
      ? `${(Math.round(liters * 10) / 10).toFixed(1)} L`
      : `${Math.round(liters * 1000)} mL`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Carb Target */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#444444]">
          Carbohydrate Target
        </h3>
        <p className="text-2xl font-bold text-[#1A1A1A]">
          {carbTargets.carbRangeLow} – {carbTargets.carbRangeHigh}
          <span className="text-base font-medium text-[#444444]"> g/hr</span>
        </p>
        <p className="text-sm text-[#444444]">
          {Math.round(carbTargets.totalCarbsLow)} – {Math.round(carbTargets.totalCarbsHigh)}g
          total for a {hours.toFixed(1)}-hour ride
        </p>
        <p className="text-xs text-[#E8601C] font-medium">
          Targeting {Math.round(carbTargets.carbTargetGhr)}g/hr (midpoint)
        </p>
      </div>

      {/* Hydration Target */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#444444]">
          Hydration Target
        </h3>
        <p className="text-2xl font-bold text-[#1A1A1A]">
          {formatFluid(hydrationTargets.fluidRangeLow)} –{' '}
          {formatFluid(hydrationTargets.fluidRangeHigh)}
          <span className="text-base font-medium text-[#444444]"> /hr</span>
        </p>
        <p className="text-sm text-[#444444]">
          {formatFluid(hydrationTargets.totalFluidL)} total for the ride
        </p>
        {hydrationTargets.heatTier && (
          <p className="text-xs text-[#E8601C] font-medium">
            Weather-adjusted ({hydrationTargets.weatherMultiplier}x multiplier)
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useApp } from '@/lib/context';

export default function CarbSlider() {
  const { plan, customCarbTarget, setCustomCarbTarget, recalculate } = useApp();

  if (!plan) return null;

  const { carbRangeLow, carbRangeHigh, carbTargetGhr } = plan.carbTargets;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCustomCarbTarget(val);
    recalculate();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1A1A1A]">
          Adjust Carb Target
        </label>
        <span className="text-sm font-bold text-[#E8601C]">
          {Math.round(customCarbTarget ?? carbTargetGhr)}g/hr
        </span>
      </div>
      <input
        type="range"
        min={carbRangeLow}
        max={carbRangeHigh}
        step={1}
        value={customCarbTarget ?? carbTargetGhr}
        onChange={handleChange}
        className="w-full accent-[#E8601C]"
        aria-label="Carbohydrate target grams per hour"
      />
      <div className="flex justify-between text-xs text-[#444444]">
        <span>{carbRangeLow}g</span>
        <span>{carbRangeHigh}g</span>
      </div>
    </div>
  );
}

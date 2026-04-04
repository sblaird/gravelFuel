'use client';

import { useApp } from '@/lib/context';
import { INTENSITY_TIERS } from '@/lib/products';

export default function IntensitySelector() {
  const { intensity, setIntensity } = useApp();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#1A1A1A]">
        Ride Intensity
      </label>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
        {INTENSITY_TIERS.map((tier) => {
          const selected = intensity === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => setIntensity(tier.key)}
              className={`flex-shrink-0 snap-start w-[140px] sm:w-auto rounded-xl border-2 p-3 text-left transition-all ${
                selected
                  ? 'border-[#E8601C] bg-[#E8601C]/5'
                  : 'border-gray-200 bg-white hover:border-[#E8601C]/40'
              }`}
              role="radio"
              aria-checked={selected}
              aria-label={`${tier.label} - ${tier.description}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold ${
                    selected ? 'text-[#E8601C]' : 'text-[#444444]'
                  }`}
                >
                  {tier.zone}
                </span>
                {selected && (
                  <div className="h-3 w-3 rounded-full bg-[#E8601C]" />
                )}
              </div>
              <p className="text-sm font-bold text-[#1A1A1A] leading-tight">
                {tier.label}
              </p>
              <p className="text-xs text-[#444444] mt-1">{tier.description}</p>
              <p className="text-xs text-[#444444] mt-1">
                {tier.carbRange[0]}–{tier.carbRange[1]}g/hr
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

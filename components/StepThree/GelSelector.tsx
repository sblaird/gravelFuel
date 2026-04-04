'use client';

import { useApp } from '@/lib/context';
import { GEL_PRODUCTS } from '@/lib/products';

export default function GelSelector() {
  const { selectedGel, setSelectedGel, plan, recalculate } = useApp();

  const needsGel = plan?.drinkMix.concentrationExceeded;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Gel Supplement
        </h3>
        {needsGel && (
          <p className="text-xs text-[#E8601C] mt-1">
            Your carb target exceeds what the drink mix can deliver at safe
            concentration. Select a gel to fill the gap.
          </p>
        )}
        {!needsGel && (
          <p className="text-xs text-[#444444] mt-1">
            Your drink mix covers the full carb target. Gels are optional.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {GEL_PRODUCTS.map((gel) => {
          const selected = selectedGel?.id === gel.id;
          return (
            <button
              key={gel.id}
              onClick={() => {
                setSelectedGel(selected ? null : gel);
                recalculate();
              }}
              className={`rounded-lg border-2 p-3 text-left transition-colors ${
                selected
                  ? 'border-[#E8601C] bg-[#E8601C]/5'
                  : 'border-gray-200 hover:border-[#E8601C]/40'
              }`}
            >
              <p className="text-sm font-bold text-[#1A1A1A] leading-tight">
                {gel.name}
              </p>
              <p className="text-xs text-[#444444] mt-1">
                {gel.carbsPerServing}g carbs
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

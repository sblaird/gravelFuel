'use client';

import { useApp } from '@/lib/context';
import type { BottleSize, GatoradeVariant } from '@/types';

export default function BottleConfig() {
  const { bottleSize, gatoradeVariant, setBottleSize, setGatoradeVariant, recalculate } =
    useApp();

  const bottles: { size: BottleSize; label: string }[] = [
    { size: 500, label: '500 mL' },
    { size: 620, label: '620 mL' },
    { size: 750, label: '750 mL' },
  ];

  const variants: { key: GatoradeVariant; label: string }[] = [
    { key: 'thirst_quencher', label: 'Gatorade Thirst Quencher' },
    { key: 'endurance', label: 'Gatorade Endurance' },
  ];

  return (
    <div className="space-y-4">
      {/* Bottle Size */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1A1A1A]">
          Bottle Size
        </label>
        <div className="flex gap-2">
          {bottles.map((b) => (
            <button
              key={b.size}
              onClick={() => {
                setBottleSize(b.size);
                recalculate();
              }}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition-colors ${
                bottleSize === b.size
                  ? 'border-[#E8601C] bg-[#E8601C]/5 text-[#E8601C]'
                  : 'border-gray-200 text-[#444444]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
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
    </div>
  );
}

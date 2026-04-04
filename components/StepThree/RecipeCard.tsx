'use client';

import { useApp } from '@/lib/context';
import { mlToFlOz, gramsToTbsp } from '@/lib/calculations';

export default function RecipeCard() {
  const { plan, unitSystem } = useApp();

  if (!plan) return null;

  const { drinkMix } = plan;
  const gatoradeLabel =
    drinkMix.gatoradeVariant === 'endurance'
      ? 'Gatorade Endurance'
      : 'Gatorade TQ';

  const ingredients = [
    {
      quantity: unitSystem === 'imperial'
        ? mlToFlOz(drinkMix.waterMlPerBottle)
        : drinkMix.waterMlPerBottle,
      unit: unitSystem === 'imperial' ? 'fl oz' : 'mL',
      name: 'Water',
    },
    {
      quantity: drinkMix.gatoradeScoopsPerBottle,
      unit: drinkMix.gatoradeScoopsPerBottle === 1 ? 'scoop' : 'scoops',
      name: gatoradeLabel,
    },
    {
      quantity: unitSystem === 'imperial'
        ? drinkMix.sugarTspPerBottle
        : drinkMix.sugarGramsPerBottle,
      unit: unitSystem === 'imperial' ? 'tsp' : 'g',
      name: 'Sugar',
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="bg-[#1A1A1A] px-4 py-3">
        <h3 className="text-sm font-bold text-white">
          Drink Mix — Per Bottle ({drinkMix.bottleSizeMl} mL)
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {ingredients.map((ing) => (
          <div
            key={ing.name}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1A1A1A]" style={{ minWidth: '3rem' }}>
                {typeof ing.quantity === 'number'
                  ? ing.quantity % 1 === 0
                    ? ing.quantity
                    : ing.quantity.toFixed(1)
                  : ing.quantity}
              </span>
              <span className="text-sm text-[#444444]">{ing.unit}</span>
            </div>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {ing.name}
            </span>
          </div>
        ))}
      </div>

      {drinkMix.concentrationExceeded && (
        <div className="border-t border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs text-orange-700">
            <strong>Note:</strong> Drink mix capped at 8% concentration ({drinkMix.concentrationPercent}% actual).
            Remaining carbs should come from gels.
          </p>
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-3 text-sm text-[#444444]">
        <span className="font-medium">{drinkMix.carbsFromDrinkGhr}g carbs/hr</span>
        {' '}from drink mix &middot;{' '}
        <span className="font-medium">{drinkMix.bottlesPerHour}</span> bottles/hr
      </div>
    </div>
  );
}

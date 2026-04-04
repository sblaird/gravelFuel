'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { mlToFlOz } from '@/lib/calculations';
import { DRINK_MIX_PRODUCTS, MAX_CARB_CONCENTRATION } from '@/lib/products';

export default function RecipeCard() {
  const { plan, unitSystem } = useApp();

  // Local overrides for interactive adjustment
  const [scoopsOverride, setScoopsOverride] = useState<number | null>(null);

  // Reset override when plan changes (bottle size, gatorade variant, etc.)
  useEffect(() => {
    setScoopsOverride(null);
  }, [
    plan?.drinkMix.bottleSizeMl,
    plan?.drinkMix.gatoradeVariant,
    plan?.drinkMix.carbsFromDrinkGhr,
    plan?.drinkMix.bottlesPerHour,
  ]);

  if (!plan) return null;

  const { drinkMix } = plan;
  const gatorade =
    drinkMix.gatoradeVariant === 'endurance'
      ? DRINK_MIX_PRODUCTS.gatorade_endurance
      : DRINK_MIX_PRODUCTS.gatorade_tq;
  const gatoradeLabel =
    drinkMix.gatoradeVariant === 'endurance'
      ? 'Gatorade Endurance'
      : 'Gatorade TQ';

  // Calculated carbs per bottle from the plan
  const carbsPerBottle = drinkMix.carbsFromDrinkGhr / drinkMix.bottlesPerHour;
  const maxCarbsPerBottle = drinkMix.bottleSizeMl * MAX_CARB_CONCENTRATION;

  // Current scoops (user-adjusted or plan default)
  const scoops = scoopsOverride ?? drinkMix.gatoradeScoopsPerBottle;

  // Max scoops: can't exceed carbs-per-bottle target with gatorade alone
  const maxScoops = Math.floor(
    Math.min(carbsPerBottle, maxCarbsPerBottle) / gatorade.carbsPerServing
  );

  // Derived sugar from remaining carbs
  const carbsFromGatorade = scoops * gatorade.carbsPerServing;
  const sugarGrams = Math.max(
    0,
    Math.round((carbsPerBottle - carbsFromGatorade) * 10) / 10
  );
  const sugarTsp = Math.round((sugarGrams / 4) * 10) / 10;

  // Actual concentration check
  const actualCarbs = carbsFromGatorade + sugarGrams;
  const concentrationPct =
    Math.round((actualCarbs / drinkMix.bottleSizeMl) * 100 * 100) / 100;

  const adjustScoops = (delta: number) => {
    const next = Math.max(0, Math.min(maxScoops, scoops + delta));
    setScoopsOverride(next);
  };

  const adjustSugar = (deltaGrams: number) => {
    // Changing sugar means inversely changing gatorade scoops
    const newSugar = Math.max(0, sugarGrams + deltaGrams);
    const newGatoradeCarbs = Math.max(0, carbsPerBottle - newSugar);
    const newScoops = Math.max(
      0,
      Math.min(maxScoops, Math.round(newGatoradeCarbs / gatorade.carbsPerServing))
    );
    setScoopsOverride(newScoops);
  };

  const waterDisplay =
    unitSystem === 'imperial'
      ? mlToFlOz(drinkMix.waterMlPerBottle)
      : drinkMix.waterMlPerBottle;
  const waterUnit = unitSystem === 'imperial' ? 'fl oz' : 'mL';

  const sugarDisplay = unitSystem === 'imperial' ? sugarTsp : sugarGrams;
  const sugarUnit = unitSystem === 'imperial' ? 'tsp' : 'g';

  const formatNum = (n: number) =>
    n % 1 === 0 ? String(n) : n.toFixed(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="bg-[#1A1A1A] px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          Drink Mix — Per Bottle ({drinkMix.bottleSizeMl} mL)
        </h3>
        {scoopsOverride !== null && (
          <button
            onClick={() => setScoopsOverride(null)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {/* Water — static */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A1A]" style={{ minWidth: '3rem' }}>
              {formatNum(waterDisplay)}
            </span>
            <span className="text-sm text-[#444444]">{waterUnit}</span>
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">Water</span>
        </div>

        {/* Gatorade — adjustable */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustScoops(-1)}
              disabled={scoops <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease Gatorade scoops"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1A1A1A] w-12 text-center">
              {scoops}
            </span>
            <button
              onClick={() => adjustScoops(1)}
              disabled={scoops >= maxScoops}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase Gatorade scoops"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">
              {scoops === 1 ? 'scoop' : 'scoops'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">
              {gatoradeLabel}
            </span>
            <p className="text-xs text-[#444444]">{carbsFromGatorade}g carbs</p>
          </div>
        </div>

        {/* Sugar — adjustable */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustSugar(-4)}
              disabled={sugarGrams <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease sugar"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1A1A1A] w-12 text-center">
              {formatNum(sugarDisplay)}
            </span>
            <button
              onClick={() => adjustSugar(4)}
              disabled={scoops <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase sugar"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">{sugarUnit}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">Sugar</span>
            <p className="text-xs text-[#444444]">{formatNum(sugarGrams)}g carbs</p>
          </div>
        </div>
      </div>

      {/* Concentration bar */}
      <div className="border-t border-gray-100 px-4 py-3 space-y-1">
        <div className="flex items-center justify-between text-xs text-[#444444]">
          <span>Concentration</span>
          <span
            className={
              concentrationPct > 8 ? 'font-bold text-red-600' : 'font-medium'
            }
          >
            {concentrationPct}%
            {concentrationPct > 8 ? ' — exceeds 8% limit' : ''}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              concentrationPct > 8 ? 'bg-red-500' : 'bg-[#E8601C]'
            }`}
            style={{ width: `${Math.min(100, (concentrationPct / 10) * 100)}%` }}
          />
        </div>
      </div>

      {drinkMix.concentrationExceeded && (
        <div className="border-t border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs text-orange-700">
            <strong>Note:</strong> Drink mix capped at 8% concentration.
            Remaining carbs should come from gels.
          </p>
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-3 text-sm text-[#444444]">
        <span className="font-medium">
          {formatNum(actualCarbs * drinkMix.bottlesPerHour)}g carbs/hr
        </span>
        {' '}from drink mix &middot;{' '}
        <span className="font-medium">{drinkMix.bottlesPerHour}</span> bottles/hr
      </div>
    </div>
  );
}

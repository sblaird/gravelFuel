'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { mlToFlOz, litersToFlOz } from '@/lib/calculations';
import { DRINK_MIX_PRODUCTS } from '@/lib/products';

const SUGAR_GRAMS_PER_CUP = 200;
const SUGAR_CUP_INCREMENT = 1 / 8;
const SCOOP_INCREMENT = 0.5;
const SALT_TSP_INCREMENT = 1 / 8;

function formatFraction(value: number): string {
  const fractions: Record<string, string> = {
    '0': '',
    '0.125': '⅛',
    '0.25': '¼',
    '0.375': '⅜',
    '0.5': '½',
    '0.625': '⅝',
    '0.75': '¾',
    '0.875': '⅞',
  };
  if (value === 0) return '0';
  const whole = Math.floor(value);
  const frac = Math.round((value - whole) * 8) / 8;
  const fracStr = fractions[frac.toFixed(3)] || fractions[frac.toString()] || '';
  if (whole === 0) return fracStr || '0';
  if (!fracStr) return String(whole);
  return `${whole} ${fracStr}`;
}

function formatNum(n: number): string {
  if (n % 1 === 0) return String(n);
  if (Math.abs(n * 2 - Math.round(n * 2)) < 0.001) {
    const whole = Math.floor(n);
    return whole > 0 ? `${whole}.5` : '0.5';
  }
  return n.toFixed(1);
}

export default function RecipeCard() {
  const { plan, unitSystem } = useApp();

  // Gatorade ratio override: fraction of total drink carbs from Gatorade (0–1)
  const [gatoradeRatio, setGatoradeRatio] = useState<number | null>(null);
  const [saltTspPerHour, setSaltTspPerHour] = useState(0.25);

  useEffect(() => {
    setGatoradeRatio(null);
  }, [
    plan?.drinkMix.gatoradeVariant,
    plan?.drinkMix.carbsFromDrinkGhr,
    plan?.carbTargets.carbTargetGhr,
  ]);

  if (!plan) return null;

  const hours = plan.inputs.durationMinutes / 60;
  const { drinkMix, hydrationTargets } = plan;

  const gatorade =
    drinkMix.gatoradeVariant === 'endurance'
      ? DRINK_MIX_PRODUCTS.gatorade_endurance
      : DRINK_MIX_PRODUCTS.gatorade_tq;
  const gatoradeLabel =
    drinkMix.gatoradeVariant === 'endurance'
      ? 'Gatorade Endurance'
      : 'Gatorade TQ';

  // Total carbs from drink mix for the whole ride
  const totalDrinkCarbs = Math.round(drinkMix.carbsFromDrinkGhr * hours);

  // Default split: 1 scoop worth per "unit", rest is sugar
  const defaultGatoradeCarbs =
    drinkMix.gatoradeScoopsPerBottle *
    gatorade.carbsPerServing *
    drinkMix.bottlesPerHour *
    hours;
  const defaultRatio = Math.min(1, defaultGatoradeCarbs / Math.max(1, totalDrinkCarbs));
  const ratio = gatoradeRatio ?? defaultRatio;

  // Derive totals from ratio
  const totalGatoradeCarbs = Math.round(totalDrinkCarbs * ratio);
  const totalSugarCarbs = totalDrinkCarbs - totalGatoradeCarbs;

  const totalGatoradeScoops =
    Math.round((totalGatoradeCarbs / gatorade.carbsPerServing) * 2) / 2;
  const totalSugarGrams = Math.max(0, totalSugarCarbs); // 1g sugar ≈ 1g carbs
  const totalSugarCups = totalSugarGrams / SUGAR_GRAMS_PER_CUP;
  const totalSugarCupsSnapped = Math.round(totalSugarCups * 8) / 8;

  // Total water
  const totalWaterL = hydrationTargets.totalFluidL;
  const totalWaterMl = Math.round(totalWaterL * 1000);

  // Total salt
  const totalSaltTsp = Math.round(saltTspPerHour * hours * 8) / 8;
  const totalSaltTbsp = totalSaltTsp / 3;

  // Max scoops: all drink carbs from Gatorade
  const maxScoops =
    Math.floor((totalDrinkCarbs / gatorade.carbsPerServing) * 2) / 2;

  const adjustScoops = (delta: number) => {
    const newScoops = Math.round(Math.max(0, Math.min(maxScoops, totalGatoradeScoops + delta)) * 2) / 2;
    const newGatoradeCarbs = newScoops * gatorade.carbsPerServing;
    setGatoradeRatio(Math.min(1, newGatoradeCarbs / Math.max(1, totalDrinkCarbs)));
  };

  const adjustSugarByCups = (deltaCups: number) => {
    const newSugarGrams = Math.max(0, totalSugarGrams + deltaCups * SUGAR_GRAMS_PER_CUP);
    const newSugarCarbs = Math.min(totalDrinkCarbs, newSugarGrams);
    setGatoradeRatio(Math.max(0, (totalDrinkCarbs - newSugarCarbs) / Math.max(1, totalDrinkCarbs)));
  };

  const adjustSalt = (deltaTsp: number) => {
    setSaltTspPerHour((prev) => Math.round(Math.max(0, prev + deltaTsp) * 8) / 8);
  };

  const waterDisplay = unitSystem === 'imperial'
    ? litersToFlOz(totalWaterL)
    : totalWaterL >= 1
      ? `${totalWaterL.toFixed(1)}`
      : `${totalWaterMl}`;
  const waterUnit = unitSystem === 'imperial'
    ? 'fl oz'
    : totalWaterL >= 1 ? 'L' : 'mL';

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="bg-[#1A1A1A] px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          Drink Mix — Total for {formatNum(hours)}-Hour Ride
        </h3>
        {gatoradeRatio !== null && (
          <button
            onClick={() => setGatoradeRatio(null)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      {/* Total carb target banner */}
      <div className="bg-[#E8601C]/5 px-4 py-3 border-b border-[#E8601C]/10">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-[#1A1A1A]">
            Total drink carbs
          </span>
          <span className="text-xl font-bold text-[#E8601C]">
            {totalDrinkCarbs}g
          </span>
        </div>
        <p className="text-xs text-[#444444] mt-0.5">
          {drinkMix.carbsFromDrinkGhr}g/hr &middot; Divide into your bottles as needed
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Total Water */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A1A]" style={{ minWidth: '3rem' }}>
              {waterDisplay}
            </span>
            <span className="text-sm text-[#444444]">{waterUnit}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">Water</span>
            <p className="text-xs text-[#444444]">
              {formatNum(hydrationTargets.fluidTargetLhr)} L/hr
            </p>
          </div>
        </div>

        {/* Total Gatorade — 0.5 scoop increments */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustScoops(-SCOOP_INCREMENT)}
              disabled={totalGatoradeScoops <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease Gatorade scoops"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1A1A1A] w-12 text-center">
              {formatNum(totalGatoradeScoops)}
            </span>
            <button
              onClick={() => adjustScoops(SCOOP_INCREMENT)}
              disabled={totalGatoradeScoops >= maxScoops}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase Gatorade scoops"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">scoops</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">
              {gatoradeLabel}
            </span>
            <p className="text-xs text-[#444444]">{totalGatoradeCarbs}g carbs</p>
          </div>
        </div>

        {/* Total Sugar — 1/8 cup increments */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustSugarByCups(-SUGAR_CUP_INCREMENT)}
              disabled={totalSugarGrams <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease sugar"
            >
              −
            </button>
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {formatFraction(totalSugarCupsSnapped)}
              </span>
            </div>
            <button
              onClick={() => adjustSugarByCups(SUGAR_CUP_INCREMENT)}
              disabled={totalGatoradeScoops <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase sugar"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">cup</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">Sugar</span>
            <p className="text-xs text-[#444444]">
              {totalSugarGrams}g carbs
            </p>
          </div>
        </div>

        {/* Total Salt — tsp (1/8 increments) */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustSalt(-SALT_TSP_INCREMENT)}
              disabled={saltTspPerHour <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease salt"
            >
              −
            </button>
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {formatFraction(totalSaltTsp)}
              </span>
            </div>
            <button
              onClick={() => adjustSalt(SALT_TSP_INCREMENT)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase salt"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">tsp total</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">
              Table Salt
            </span>
            <p className="text-xs text-[#444444]">
              {formatFraction(Math.round(totalSaltTbsp * 2) / 2)} tbsp &middot;{' '}
              ~{Math.round(totalSaltTsp * 2300)}mg sodium
            </p>
          </div>
        </div>
      </div>

      {drinkMix.concentrationExceeded && (
        <div className="border-t border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs text-orange-700">
            <strong>Note:</strong> At 8% max concentration, drink mix alone
            can&apos;t hit your carb target. The remainder comes from gels below.
          </p>
        </div>
      )}
    </div>
  );
}

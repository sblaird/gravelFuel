'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { mlToFlOz } from '@/lib/calculations';
import { DRINK_MIX_PRODUCTS, MAX_CARB_CONCENTRATION } from '@/lib/products';

// 1 cup sugar = 200g, so 1/8 cup = 25g
const SUGAR_GRAMS_PER_CUP = 200;
const SUGAR_CUP_INCREMENT = 1 / 8; // 1/8 cup
const SUGAR_GRAM_INCREMENT = SUGAR_GRAMS_PER_CUP * SUGAR_CUP_INCREMENT; // 25g

const SCOOP_INCREMENT = 0.5;

// Salt: 1 tsp = ~6g sodium (2,300mg), 1 tbsp = 3 tsp = ~18g
const SALT_TSP_INCREMENT = 1 / 8;
const SALT_TBSP_INCREMENT = 0.5;

/** Display a number as a fraction string (e.g. 0.125 → "⅛", 1.5 → "1 ½") */
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
  // Round fractional part to nearest 1/8
  const frac = Math.round((value - whole) * 8) / 8;
  const fracStr = fractions[frac.toFixed(3)] || fractions[frac.toString()] || '';

  if (whole === 0) return fracStr || '0';
  if (!fracStr) return String(whole);
  return `${whole} ${fracStr}`;
}

function formatNum(n: number): string {
  if (n % 1 === 0) return String(n);
  // Check if it's a clean half
  if (Math.abs(n * 2 - Math.round(n * 2)) < 0.001) {
    const whole = Math.floor(n);
    return whole > 0 ? `${whole}.5` : '0.5';
  }
  return n.toFixed(1);
}

export default function RecipeCard() {
  const { plan, unitSystem } = useApp();

  const [scoopsOverride, setScoopsOverride] = useState<number | null>(null);
  const [saltTsp, setSaltTsp] = useState(0.25); // default ¼ tsp per bottle

  // Reset overrides when plan changes
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

  // Carbs per bottle from the plan
  const carbsPerBottle = drinkMix.carbsFromDrinkGhr / drinkMix.bottlesPerHour;
  const maxCarbsPerBottle = drinkMix.bottleSizeMl * MAX_CARB_CONCENTRATION;

  // Current scoops (user-adjusted or plan default), snapped to 0.5
  const scoops = scoopsOverride ?? drinkMix.gatoradeScoopsPerBottle;

  // Max scoops at 0.5 increments
  const maxScoops =
    Math.floor(
      (Math.min(carbsPerBottle, maxCarbsPerBottle) / gatorade.carbsPerServing) *
        2
    ) / 2;

  // Derived sugar from remaining carbs
  const carbsFromGatorade = scoops * gatorade.carbsPerServing;
  const sugarGrams = Math.max(
    0,
    Math.round((carbsPerBottle - carbsFromGatorade) * 10) / 10
  );
  const sugarCups = sugarGrams / SUGAR_GRAMS_PER_CUP;
  // Snap to nearest 1/8 cup for display
  const sugarCupsSnapped = Math.round(sugarCups * 8) / 8;

  // Actual concentration
  const actualCarbs = carbsFromGatorade + sugarGrams;
  const concentrationPct =
    Math.round((actualCarbs / drinkMix.bottleSizeMl) * 100 * 100) / 100;

  // Salt display
  const saltTbsp = saltTsp / 3;

  const adjustScoops = (delta: number) => {
    const next = Math.round(Math.max(0, Math.min(maxScoops, scoops + delta)) * 2) / 2;
    setScoopsOverride(next);
  };

  const adjustSugarByCups = (deltaCups: number) => {
    const newSugarGrams = Math.max(0, sugarGrams + deltaCups * SUGAR_GRAMS_PER_CUP);
    const newGatoradeCarbs = Math.max(0, carbsPerBottle - newSugarGrams);
    const newScoops = Math.max(
      0,
      Math.min(
        maxScoops,
        Math.round((newGatoradeCarbs / gatorade.carbsPerServing) * 2) / 2
      )
    );
    setScoopsOverride(newScoops);
  };

  const adjustSalt = (deltaTsp: number) => {
    setSaltTsp((prev) => {
      const next = Math.round(Math.max(0, prev + deltaTsp) * 8) / 8;
      return next;
    });
  };

  const waterDisplay =
    unitSystem === 'imperial'
      ? mlToFlOz(drinkMix.waterMlPerBottle)
      : drinkMix.waterMlPerBottle;
  const waterUnit = unitSystem === 'imperial' ? 'fl oz' : 'mL';

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
            <span
              className="text-2xl font-bold text-[#1A1A1A]"
              style={{ minWidth: '3rem' }}
            >
              {formatNum(waterDisplay)}
            </span>
            <span className="text-sm text-[#444444]">{waterUnit}</span>
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">Water</span>
        </div>

        {/* Gatorade — 0.5 scoop increments */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustScoops(-SCOOP_INCREMENT)}
              disabled={scoops <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease Gatorade scoops"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1A1A1A] w-12 text-center">
              {formatNum(scoops)}
            </span>
            <button
              onClick={() => adjustScoops(SCOOP_INCREMENT)}
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
            <p className="text-xs text-[#444444]">
              {formatNum(carbsFromGatorade)}g carbs
            </p>
          </div>
        </div>

        {/* Sugar — 1/8 cup increments */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustSugarByCups(-SUGAR_CUP_INCREMENT)}
              disabled={sugarGrams <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease sugar"
            >
              −
            </button>
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {formatFraction(sugarCupsSnapped)}
              </span>
            </div>
            <button
              onClick={() => adjustSugarByCups(SUGAR_CUP_INCREMENT)}
              disabled={scoops <= 0}
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
              {formatNum(sugarGrams)}g &middot; {formatNum(sugarGrams)}g carbs
            </p>
          </div>
        </div>

        {/* Table Salt — tsp (1/8 increments) + tbsp (0.5 increments) */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustSalt(-SALT_TSP_INCREMENT)}
              disabled={saltTsp <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Decrease salt"
            >
              −
            </button>
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {formatFraction(saltTsp)}
              </span>
            </div>
            <button
              onClick={() => adjustSalt(SALT_TSP_INCREMENT)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-[#1A1A1A] disabled:opacity-30 active:bg-gray-200"
              aria-label="Increase salt"
            >
              +
            </button>
            <span className="text-sm text-[#444444]">tsp</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-[#1A1A1A]">
              Table Salt
            </span>
            <p className="text-xs text-[#444444]">
              {formatFraction(Math.round(saltTbsp * 2) / 2)} tbsp &middot;{' '}
              ~{Math.round(saltTsp * 2300 / 1)}mg sodium
            </p>
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
            style={{
              width: `${Math.min(100, (concentrationPct / 10) * 100)}%`,
            }}
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
        <span className="font-medium">{drinkMix.bottlesPerHour}</span>{' '}
        bottles/hr
      </div>
    </div>
  );
}

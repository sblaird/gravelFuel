import type {
  IntensityLevel,
  IntensityTier,
  HeatTier,
  BottleSize,
  GatoradeVariant,
  GelProduct,
  CarbTargets,
  HydrationTargets,
  DrinkMixRecipe,
  GelRecipe,
  FuelingPlan,
} from '@/types';
import {
  INTENSITY_TIERS,
  HEAT_MULTIPLIERS,
  MAX_CARB_CONCENTRATION,
  DRINK_MIX_PRODUCTS,
} from './products';

// ── Intensity Lookup ────────────────────────────────────────────────
export function getIntensityTier(level: IntensityLevel): IntensityTier {
  return INTENSITY_TIERS.find((t) => t.key === level)!;
}

// ── Carb Targets ────────────────────────────────────────────────────
export function calculateCarbTargets(
  intensity: IntensityLevel,
  durationMinutes: number,
  customTargetGhr?: number
): CarbTargets {
  const tier = getIntensityTier(intensity);
  const [low, high] = tier.carbRange;
  const midpoint = (low + high) / 2;
  const hours = durationMinutes / 60;

  let carbTargetGhr = midpoint;
  if (customTargetGhr !== undefined) {
    carbTargetGhr = Math.max(low, Math.min(high, customTargetGhr));
  }

  return {
    carbRangeLow: low,
    carbRangeHigh: high,
    carbTargetGhr,
    totalCarbsLow: low * hours,
    totalCarbsHigh: high * hours,
    totalCarbsTarget: carbTargetGhr * hours,
  };
}

// ── Heat Tier Classification ────────────────────────────────────────
export function calculateHeatTier(
  temperatureC: number,
  humidityPercent: number
): HeatTier {
  if (temperatureC > 35) return 'extreme';
  if (temperatureC >= 28) {
    return humidityPercent > 60 ? 'hot_humid' : 'hot';
  }
  if (temperatureC >= 22) {
    return humidityPercent > 60 ? 'warm_humid' : 'warm';
  }
  if (temperatureC >= 15) return 'mild';
  return 'cool';
}

// ── Hydration Targets ───────────────────────────────────────────────
export function calculateHydrationTargets(
  intensity: IntensityLevel,
  durationMinutes: number,
  heatTier: HeatTier | null
): HydrationTargets {
  const tier = getIntensityTier(intensity);
  const [fluidLow, fluidHigh] = tier.fluidRange;
  const baseMidpoint = (fluidLow + fluidHigh) / 2;
  const hours = durationMinutes / 60;

  const multiplier = heatTier ? HEAT_MULTIPLIERS[heatTier] : 1.0;
  const fluidTargetLhr = baseMidpoint * multiplier;

  return {
    fluidRangeLow: fluidLow * multiplier,
    fluidRangeHigh: fluidHigh * multiplier,
    fluidTargetLhr,
    totalFluidL: fluidTargetLhr * hours,
    weatherMultiplier: multiplier,
    heatTier,
  };
}

// ── Drink Mix Calculator ────────────────────────────────────────────
export function calculateDrinkMix(
  carbTargetGhr: number,
  fluidTargetLhr: number,
  bottleSize: BottleSize,
  gatoradeVariant: GatoradeVariant
): DrinkMixRecipe {
  const bottleVolumeMl = bottleSize;
  const bottlesPerHour = fluidTargetLhr / (bottleVolumeMl / 1000);

  // Max carbs per bottle at the configured concentration ceiling
  const maxCarbsPerBottle = bottleVolumeMl * MAX_CARB_CONCENTRATION;
  const maxCarbsGhr = maxCarbsPerBottle * bottlesPerHour;
  const concentrationExceeded = carbTargetGhr > maxCarbsGhr;

  // Actual carbs from drink per hour (capped at concentration limit)
  const drinkCarbsGhr = Math.min(carbTargetGhr, maxCarbsGhr);
  const carbsPerBottle = drinkCarbsGhr / bottlesPerHour;

  // Distribute between Gatorade and sugar
  // Strategy: Use 1 scoop of Gatorade first (for electrolytes), fill remainder with sugar
  const gatorade =
    gatoradeVariant === 'endurance'
      ? DRINK_MIX_PRODUCTS.gatorade_endurance
      : DRINK_MIX_PRODUCTS.gatorade_tq;

  const gatoradeScoopsPerBottle = Math.min(
    Math.floor(carbsPerBottle / gatorade.carbsPerServing),
    Math.max(1, Math.floor(carbsPerBottle / gatorade.carbsPerServing))
  );
  const carbsFromGatorade = gatoradeScoopsPerBottle * gatorade.carbsPerServing;
  const remainingCarbs = Math.max(0, carbsPerBottle - carbsFromGatorade);
  const sugarGrams = remainingCarbs; // 1g sugar ≈ 1g carbs
  const sugarTsp = sugarGrams / 4;

  const actualCarbsPerBottle = carbsFromGatorade + sugarGrams;
  const actualConcentration = (actualCarbsPerBottle / bottleVolumeMl) * 100;

  return {
    bottleSizeMl: bottleSize,
    bottlesPerHour: Math.round(bottlesPerHour * 100) / 100,
    totalBottles: 0, // Set by caller with duration
    carbsFromDrinkGhr: Math.round(drinkCarbsGhr * 100) / 100,
    sugarGramsPerBottle: Math.round(sugarGrams * 10) / 10,
    sugarTspPerBottle: Math.round(sugarTsp * 10) / 10,
    gatoradeScoopsPerBottle,
    gatoradeVariant,
    waterMlPerBottle: bottleVolumeMl,
    concentrationPercent: Math.round(actualConcentration * 100) / 100,
    concentrationExceeded,
  };
}

// ── Gel Recipe Calculator ───────────────────────────────────────────
export function calculateGelRecipe(
  carbTargetGhr: number,
  drinkCarbsGhr: number,
  gel: GelProduct,
  durationMinutes: number
): GelRecipe {
  const gap = Math.max(0, carbTargetGhr - drinkCarbsGhr);
  const hours = durationMinutes / 60;

  if (gap <= 0) {
    return {
      gel,
      gelsPerHour: 0,
      totalGels: 0,
      carbsFromGelsGhr: 0,
      minutesBetweenGels: 0,
      schedule: 'No gels needed — drink mix covers your carb target.',
    };
  }

  const exactGelsPerHour = gap / gel.carbsPerServing;
  const gelsPerHour = Math.ceil(exactGelsPerHour);
  const totalGels = Math.ceil(gelsPerHour * hours);
  const minutesBetweenGels = Math.floor(60 / gelsPerHour);
  const carbsFromGels = gelsPerHour * gel.carbsPerServing;

  const schedule =
    gelsPerHour === 1
      ? `Take 1 ${gel.name} every 60 minutes`
      : `Take 1 ${gel.name} every ${minutesBetweenGels} minutes`;

  return {
    gel,
    gelsPerHour,
    totalGels,
    carbsFromGelsGhr: carbsFromGels,
    minutesBetweenGels,
    schedule,
  };
}

// ── Full Plan Builder ───────────────────────────────────────────────
interface PlanInput {
  durationMinutes: number;
  intensity: IntensityLevel;
  bottleSize: BottleSize;
  gatoradeVariant: GatoradeVariant;
  gel: GelProduct | null;
  heatTier: HeatTier | null;
  customCarbTarget?: number;
}

export function buildFuelingPlan(input: PlanInput): FuelingPlan {
  const hours = input.durationMinutes / 60;

  const carbTargets = calculateCarbTargets(
    input.intensity,
    input.durationMinutes,
    input.customCarbTarget
  );

  const hydrationTargets = calculateHydrationTargets(
    input.intensity,
    input.durationMinutes,
    input.heatTier
  );

  const drinkMix = calculateDrinkMix(
    carbTargets.carbTargetGhr,
    hydrationTargets.fluidTargetLhr,
    input.bottleSize,
    input.gatoradeVariant
  );

  // Set total bottles based on duration
  drinkMix.totalBottles = Math.ceil(drinkMix.bottlesPerHour * hours);

  let gelRecipe: GelRecipe | null = null;
  if (input.gel && drinkMix.concentrationExceeded) {
    gelRecipe = calculateGelRecipe(
      carbTargets.carbTargetGhr,
      drinkMix.carbsFromDrinkGhr,
      input.gel,
      input.durationMinutes
    );
  }

  const totalCarbsGhr =
    drinkMix.carbsFromDrinkGhr + (gelRecipe?.carbsFromGelsGhr ?? 0);
  const totalCarbsRide = totalCarbsGhr * hours;

  return {
    inputs: {
      durationMinutes: input.durationMinutes,
      intensity: input.intensity,
    },
    carbTargets,
    hydrationTargets,
    drinkMix,
    gelRecipe,
    totalCarbsGhr,
    totalCarbsRide,
  };
}

// ── Unit Conversion Helpers ─────────────────────────────────────────
export function mlToFlOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}

export function litersToFlOz(liters: number): number {
  return Math.round(liters * 33.814 * 10) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round(((c * 9) / 5 + 32) * 10) / 10;
}

export function gramsToOz(g: number): number {
  return Math.round((g / 28.3495) * 10) / 10;
}

export function gramsToTbsp(g: number): number {
  return Math.round((g / 12.5) * 10) / 10;
}

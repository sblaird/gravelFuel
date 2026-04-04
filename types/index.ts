export type IntensityLevel = 'easy' | 'aerobic' | 'tempo' | 'threshold' | 'high';

export interface IntensityTier {
  key: IntensityLevel;
  label: string;
  description: string;
  zone: string;
  carbRange: [number, number]; // [low, high] g/hr
  fluidRange: [number, number]; // [low, high] L/hr
}

export type HeatTier =
  | 'cool'
  | 'mild'
  | 'warm'
  | 'warm_humid'
  | 'hot'
  | 'hot_humid'
  | 'extreme';

export type BottleSize = 500 | 620 | 750;

export type UnitSystem = 'metric' | 'imperial';

export type GatoradeVariant = 'thirst_quencher' | 'endurance';

export interface DrinkMixProduct {
  id: string;
  name: string;
  carbsPerServing: number; // grams
  servingUnit: string;
  servingWeight: number; // grams
}

export interface GelProduct {
  id: string;
  name: string;
  carbsPerServing: number; // grams
  servingWeight: number; // grams
}

export interface WeatherData {
  temperatureC: number;
  humidity: number;
  heatTier: HeatTier;
  multiplier: number;
  description: string;
}

export interface RideInputs {
  durationMinutes: number;
  intensity: IntensityLevel;
}

export interface CarbTargets {
  carbRangeLow: number;
  carbRangeHigh: number;
  carbTargetGhr: number; // user-selected or midpoint
  totalCarbsLow: number;
  totalCarbsHigh: number;
  totalCarbsTarget: number;
}

export interface HydrationTargets {
  fluidRangeLow: number;
  fluidRangeHigh: number;
  fluidTargetLhr: number;
  totalFluidL: number;
  weatherMultiplier: number;
  heatTier: HeatTier | null;
}

export interface DrinkMixRecipe {
  bottleSizeMl: BottleSize;
  bottlesPerHour: number;
  totalBottles: number;
  carbsFromDrinkGhr: number;
  sugarGramsPerBottle: number;
  sugarTspPerBottle: number;
  gatoradeScoopsPerBottle: number;
  gatoradeVariant: GatoradeVariant;
  waterMlPerBottle: number;
  concentrationPercent: number;
  concentrationExceeded: boolean;
}

export interface GelRecipe {
  gel: GelProduct;
  gelsPerHour: number;
  totalGels: number;
  carbsFromGelsGhr: number;
  minutesBetweenGels: number;
  schedule: string;
}

// ── Intervals.icu Types ─────────────────────────────────────────────
export interface IntervalsEvent {
  id: number;
  name: string;
  description?: string;
  start_date_local?: string;
  type?: string;
  category?: string;
  moving_time?: number; // seconds
  icu_training_load?: number;
  icu_intensity?: number; // Intensity Factor (IF)
  indoor?: boolean;
  color?: string;
  // Planned workout fields
  duration?: number; // planned duration in seconds
  joules?: number;
  load_target?: number;
}

export interface PlannedWorkout {
  id: number;
  name: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  raw: IntervalsEvent;
}

export interface FuelingPlan {
  inputs: RideInputs;
  carbTargets: CarbTargets;
  hydrationTargets: HydrationTargets;
  drinkMix: DrinkMixRecipe;
  gelRecipe: GelRecipe | null;
  totalCarbsGhr: number;
  totalCarbsRide: number;
}

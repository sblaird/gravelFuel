import { describe, it, expect } from 'vitest';
import {
  getIntensityTier,
  calculateCarbTargets,
  calculateHeatTier,
  calculateHydrationTargets,
  calculateDrinkMix,
  calculateGelRecipe,
  buildFuelingPlan,
} from '../lib/calculations';
import { GEL_PRODUCTS } from '../lib/products';

describe('getIntensityTier', () => {
  it('returns the correct tier for each intensity level', () => {
    expect(getIntensityTier('easy').carbRange).toEqual([30, 45]);
    expect(getIntensityTier('aerobic').carbRange).toEqual([45, 60]);
    expect(getIntensityTier('tempo').carbRange).toEqual([60, 75]);
    expect(getIntensityTier('threshold').carbRange).toEqual([75, 90]);
    expect(getIntensityTier('high').carbRange).toEqual([90, 120]);
  });
});

describe('calculateCarbTargets', () => {
  it('calculates midpoint carb target for a 4-hour tempo ride', () => {
    const result = calculateCarbTargets('tempo', 240);
    expect(result.carbRangeLow).toBe(60);
    expect(result.carbRangeHigh).toBe(75);
    expect(result.carbTargetGhr).toBe(67.5); // midpoint
    expect(result.totalCarbsTarget).toBe(270); // 67.5 * 4
  });

  it('uses custom carb target when provided', () => {
    const result = calculateCarbTargets('tempo', 240, 70);
    expect(result.carbTargetGhr).toBe(70);
    expect(result.totalCarbsTarget).toBe(280);
  });

  it('clamps custom target to range bounds', () => {
    const result = calculateCarbTargets('tempo', 240, 200);
    expect(result.carbTargetGhr).toBe(75);
  });

  it('handles short ride (30 min)', () => {
    const result = calculateCarbTargets('easy', 30);
    expect(result.totalCarbsTarget).toBe(18.75); // 37.5 * 0.5
  });
});

describe('calculateHeatTier', () => {
  it('returns cool for low temperatures', () => {
    expect(calculateHeatTier(10, 50)).toBe('cool');
  });

  it('returns mild for moderate temperatures', () => {
    expect(calculateHeatTier(18, 40)).toBe('mild');
  });

  it('returns warm for warm dry conditions', () => {
    expect(calculateHeatTier(25, 50)).toBe('warm');
  });

  it('returns warm_humid for warm humid conditions', () => {
    expect(calculateHeatTier(25, 70)).toBe('warm_humid');
  });

  it('returns hot for hot dry conditions', () => {
    expect(calculateHeatTier(30, 50)).toBe('hot');
  });

  it('returns hot_humid for hot humid conditions', () => {
    expect(calculateHeatTier(30, 70)).toBe('hot_humid');
  });

  it('returns extreme for very hot conditions', () => {
    expect(calculateHeatTier(38, 50)).toBe('extreme');
  });
});

describe('calculateHydrationTargets', () => {
  it('applies weather multiplier to fluid targets', () => {
    const result = calculateHydrationTargets('tempo', 240, 'hot_humid');
    // Base: 0.75-0.9, midpoint 0.825, multiplied by 1.4 = 1.155
    expect(result.fluidTargetLhr).toBeCloseTo(1.155, 2);
    expect(result.weatherMultiplier).toBe(1.4);
  });

  it('uses 1.0 multiplier for cool weather', () => {
    const result = calculateHydrationTargets('easy', 120, 'cool');
    expect(result.weatherMultiplier).toBe(1.0);
    expect(result.fluidTargetLhr).toBeCloseTo(0.55, 2); // midpoint of 0.5-0.6
  });

  it('returns null heatTier when no weather provided', () => {
    const result = calculateHydrationTargets('easy', 120, null);
    expect(result.heatTier).toBeNull();
    expect(result.weatherMultiplier).toBe(1.0);
  });
});

describe('calculateDrinkMix', () => {
  it('calculates drink mix for 750ml bottles at tempo', () => {
    const result = calculateDrinkMix(67.5, 0.825, 750, 'thirst_quencher');
    expect(result.bottleSizeMl).toBe(750);
    expect(result.bottlesPerHour).toBeGreaterThan(0);
    expect(result.sugarGramsPerBottle).toBeGreaterThanOrEqual(0);
    expect(result.gatoradeScoopsPerBottle).toBeGreaterThanOrEqual(0);
  });

  it('enforces 8% concentration cap', () => {
    const result = calculateDrinkMix(120, 0.5, 500, 'thirst_quencher');
    expect(result.concentrationPercent).toBeLessThanOrEqual(8);
    expect(result.concentrationExceeded).toBe(true);
  });

  it('does not exceed concentration with low carb target', () => {
    const result = calculateDrinkMix(30, 0.6, 750, 'thirst_quencher');
    expect(result.concentrationExceeded).toBe(false);
  });

  it('uses endurance gatorade variant correctly', () => {
    const result = calculateDrinkMix(60, 0.75, 620, 'endurance');
    expect(result.gatoradeVariant).toBe('endurance');
    // Endurance has 19g per scoop vs 13g
    expect(result.gatoradeScoopsPerBottle).toBeGreaterThan(0);
  });

  it('calculates total bottles for ride', () => {
    const result = calculateDrinkMix(60, 0.75, 750, 'thirst_quencher');
    // bottles per hour = 0.75 / 0.75 = 1
    expect(result.bottlesPerHour).toBe(1);
  });
});

describe('calculateGelRecipe', () => {
  it('calculates gel gap fill when drink mix is insufficient', () => {
    const gel = GEL_PRODUCTS.find((g) => g.id === 'gu_energy')!;
    const result = calculateGelRecipe(80, 50, gel, 240);
    // Gap = 30g/hr, GU = 22g, so ~1.36 → 2 gels/hr
    expect(result.gelsPerHour).toBeGreaterThan(0);
    expect(result.totalGels).toBeGreaterThan(0);
    expect(result.schedule).toBeTruthy();
  });

  it('returns null-like values when no gap exists', () => {
    const gel = GEL_PRODUCTS[0];
    const result = calculateGelRecipe(40, 40, gel, 120);
    expect(result.gelsPerHour).toBe(0);
    expect(result.totalGels).toBe(0);
  });

  it('computes gel timing schedule', () => {
    const gel = GEL_PRODUCTS.find((g) => g.id === 'maurten_100')!;
    const result = calculateGelRecipe(90, 50, gel, 180);
    // Gap = 40g/hr, Maurten = 25g, so ~1.6 → 2 gels/hr
    expect(result.minutesBetweenGels).toBeGreaterThan(0);
    expect(result.schedule).toMatch(/every/);
  });
});

describe('buildFuelingPlan', () => {
  it('builds a complete plan for a 3-hour tempo ride', () => {
    const plan = buildFuelingPlan({
      durationMinutes: 180,
      intensity: 'tempo',
      bottleSize: 750,
      gatoradeVariant: 'thirst_quencher',
      gel: GEL_PRODUCTS[0],
      heatTier: 'mild',
    });

    expect(plan.inputs.durationMinutes).toBe(180);
    expect(plan.inputs.intensity).toBe('tempo');
    expect(plan.carbTargets.carbRangeLow).toBe(60);
    expect(plan.hydrationTargets.weatherMultiplier).toBe(1.1);
    expect(plan.drinkMix.bottleSizeMl).toBe(750);
    expect(plan.totalCarbsGhr).toBeGreaterThan(0);
    expect(plan.totalCarbsRide).toBeGreaterThan(0);
  });

  it('builds a plan without gel when drink mix covers target', () => {
    const plan = buildFuelingPlan({
      durationMinutes: 120,
      intensity: 'easy',
      bottleSize: 750,
      gatoradeVariant: 'thirst_quencher',
      gel: null,
      heatTier: 'cool',
    });

    expect(plan.gelRecipe).toBeNull();
    expect(plan.totalCarbsGhr).toBeGreaterThan(0);
  });

  it('handles maximum carb target (high intensity, hot humid)', () => {
    const plan = buildFuelingPlan({
      durationMinutes: 480,
      intensity: 'high',
      bottleSize: 500,
      gatoradeVariant: 'endurance',
      gel: GEL_PRODUCTS.find((g) => g.id === 'maurten_100')!,
      heatTier: 'hot_humid',
    });

    expect(plan.carbTargets.carbTargetGhr).toBe(105); // midpoint of 90-120
    expect(plan.hydrationTargets.weatherMultiplier).toBe(1.4);
    expect(plan.drinkMix.concentrationExceeded).toBe(false); // high fluid = more room
    expect(plan.totalCarbsRide).toBeGreaterThan(0);
  });

  it('handles edge case: 30 minute ride', () => {
    const plan = buildFuelingPlan({
      durationMinutes: 30,
      intensity: 'easy',
      bottleSize: 500,
      gatoradeVariant: 'thirst_quencher',
      gel: null,
      heatTier: null,
    });

    expect(plan.inputs.durationMinutes).toBe(30);
    expect(plan.totalCarbsRide).toBeGreaterThan(0);
  });
});

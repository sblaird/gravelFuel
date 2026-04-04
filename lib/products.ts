import type { DrinkMixProduct, GelProduct, IntensityTier, HeatTier } from '@/types';

// ── Intensity Tiers ─────────────────────────────────────────────────
// Updated carb targets based on peer-reviewed sports nutrition science:
// - Jeukendrup (2014), Burke et al. (2011), Sawka et al. (2007)
// - Glucose-only absorption ceiling: ~60g/hr
// - Glucose + fructose (2:1 ratio): up to 90g/hr
// - Glucose + fructose (1:0.8 ratio, gut-trained): up to 120g/hr
// - kJ-based formula: (kJ/hr × 0.45) / 4
export const INTENSITY_TIERS: IntensityTier[] = [
  {
    key: 'easy',
    label: 'Easy / Recovery',
    description: 'Conversational pace, <90 min can be fasted',
    zone: 'Z1',
    carbRange: [0, 40],
    fluidRange: [0.5, 0.6],
  },
  {
    key: 'aerobic',
    label: 'Aerobic / Endurance',
    description: 'All-day gravel pace, 400–500 kJ/hr',
    zone: 'Z2',
    carbRange: [50, 60],
    fluidRange: [0.6, 0.75],
  },
  {
    key: 'tempo',
    label: 'Tempo / Hard Endurance',
    description: 'Sustained effort, 60–90g/hr range',
    zone: 'Z3',
    carbRange: [60, 90],
    fluidRange: [0.75, 0.9],
  },
  {
    key: 'threshold',
    label: 'Threshold / Race Pace',
    description: 'Race effort, 600–800 kJ/hr',
    zone: 'Z4',
    carbRange: [75, 100],
    fluidRange: [0.9, 1.0],
  },
  {
    key: 'high',
    label: 'High Intensity / Attacks',
    description: 'VO₂ max, ~1000 kJ/hr, gut training required >90g',
    zone: 'Z5+',
    carbRange: [100, 120],
    fluidRange: [1.0, 1.2],
  },
];

// ── Heat Index Multipliers ──────────────────────────────────────────
export const HEAT_MULTIPLIERS: Record<HeatTier, number> = {
  cool: 1.0,
  mild: 1.1,
  warm: 1.15,
  warm_humid: 1.25,
  hot: 1.25,
  hot_humid: 1.4,
  extreme: 1.5,
};

export const HEAT_TIER_LABELS: Record<HeatTier, string> = {
  cool: 'Cool',
  mild: 'Mild',
  warm: 'Warm',
  warm_humid: 'Warm & Humid',
  hot: 'Hot',
  hot_humid: 'Hot & Humid',
  extreme: 'Extreme',
};

// ── Concentration Cap ───────────────────────────────────────────────
export const MAX_CARB_CONCENTRATION = 0.08; // 8%

// ── Drink Mix Products ──────────────────────────────────────────────
export const DRINK_MIX_PRODUCTS: Record<string, DrinkMixProduct> = {
  gatorade_tq: {
    id: 'gatorade_tq',
    name: 'Gatorade Thirst Quencher Powder',
    carbsPerServing: 13,
    servingUnit: 'scoop (9.3g)',
    servingWeight: 9.3,
  },
  gatorade_endurance: {
    id: 'gatorade_endurance',
    name: 'Gatorade Endurance Powder',
    carbsPerServing: 19,
    servingUnit: 'scoop (15g)',
    servingWeight: 15,
  },
  sugar: {
    id: 'sugar',
    name: 'Granulated White Sugar',
    carbsPerServing: 4,
    servingUnit: 'tsp (4g)',
    servingWeight: 4,
  },
};

// ── Gel Products ────────────────────────────────────────────────────
export const GEL_PRODUCTS: GelProduct[] = [
  {
    id: 'untapped_maple',
    name: 'Untapped Maple Syrup',
    carbsPerServing: 28,
    servingWeight: 37,
  },
  {
    id: 'gu_energy',
    name: 'GU Energy Gel',
    carbsPerServing: 22,
    servingWeight: 32,
  },
  {
    id: 'maurten_100',
    name: 'Maurten Gel 100',
    carbsPerServing: 25,
    servingWeight: 40,
  },
  {
    id: 'clif_shot',
    name: 'Clif Shot Energy Gel',
    carbsPerServing: 24,
    servingWeight: 34,
  },
  {
    id: 'spring_energy',
    name: 'Spring Energy',
    carbsPerServing: 30,
    servingWeight: 45,
  },
  {
    id: 'sis_go',
    name: 'SIS Go Isotonic Gel',
    carbsPerServing: 22,
    servingWeight: 60,
  },
];

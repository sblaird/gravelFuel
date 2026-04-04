import type { IntensityLevel, IntervalsEvent, PlannedWorkout } from '@/types';

/**
 * Map Intervals.icu Intensity Factor (IF) to GravelFuel intensity level.
 *
 * IF ranges (based on FTP):
 *   < 0.65  → Easy / Recovery (Z1)
 *   0.65–0.75 → Aerobic / Endurance (Z2)
 *   0.75–0.85 → Tempo (Z3)
 *   0.85–0.95 → Threshold (Z4)
 *   > 0.95  → High Intensity (Z5+)
 *
 * Falls back to name-based heuristics when IF is unavailable.
 */
export function mapIntensityFactor(ifValue: number): IntensityLevel {
  if (ifValue < 0.65) return 'easy';
  if (ifValue < 0.75) return 'aerobic';
  if (ifValue < 0.85) return 'tempo';
  if (ifValue < 0.95) return 'threshold';
  return 'high';
}

/**
 * Infer intensity from workout name/description when no IF is available.
 */
function inferIntensityFromName(name: string): IntensityLevel {
  const lower = name.toLowerCase();
  if (/recovery|easy|spin|cool\s?down|warm\s?up|rest/.test(lower)) return 'easy';
  if (/endurance|base|aerobic|z2|zone\s*2|long\s*ride/.test(lower)) return 'aerobic';
  if (/tempo|sweet\s*spot|ss|z3|zone\s*3/.test(lower)) return 'tempo';
  if (/threshold|ftp|race|z4|zone\s*4|vo2/.test(lower)) return 'threshold';
  if (/sprint|anaerobic|z5|zone\s*5|attack|interval|hiit/.test(lower)) return 'high';
  return 'aerobic'; // safe default for unclassified rides
}

/**
 * Extract planned duration in minutes from an Intervals.icu event.
 * Checks `duration` (planned), then `moving_time` (actual), then estimates from load.
 */
function extractDurationMinutes(event: IntervalsEvent): number {
  if (event.duration && event.duration > 0) {
    return Math.round(event.duration / 60);
  }
  if (event.moving_time && event.moving_time > 0) {
    return Math.round(event.moving_time / 60);
  }
  // Fallback: 60 minutes if nothing available
  return 60;
}

/**
 * Filter and convert Intervals.icu events to PlannedWorkouts for GravelFuel.
 * Only includes cycling-type events (Ride, VirtualRide, Cycling, Workout).
 */
export function parseWorkouts(events: IntervalsEvent[]): PlannedWorkout[] {
  const cyclingTypes = new Set([
    'Ride', 'VirtualRide', 'Cycling', 'Workout', 'GravelRide',
    'MountainBikeRide', 'EBikeRide',
  ]);

  return events
    .filter((e) => {
      // Include if type matches cycling, or if type is missing (generic planned event)
      if (e.type && !cyclingTypes.has(e.type) && e.category !== 'WORKOUT') {
        return false;
      }
      return true;
    })
    .map((event) => {
      const durationMinutes = extractDurationMinutes(event);
      const intensity: IntensityLevel =
        event.icu_intensity != null
          ? mapIntensityFactor(event.icu_intensity)
          : inferIntensityFromName(event.name || '');

      return {
        id: event.id,
        name: event.name || 'Planned Workout',
        durationMinutes,
        intensity,
        raw: event,
      };
    });
}

const INTERVALS_API = 'https://intervals.icu/api/v1';

/**
 * Fetch today's planned workouts directly from Intervals.icu.
 * Uses client-side fetch since Intervals.icu supports CORS and
 * blocks requests from cloud provider IPs (Vercel/AWS).
 */
export async function fetchTodaysWorkouts(
  date?: string
): Promise<PlannedWorkout[]> {
  const athleteId = process.env.NEXT_PUBLIC_INTERVALS_ATHLETE_ID;
  const apiKey = process.env.NEXT_PUBLIC_INTERVALS_API_KEY;

  if (!athleteId || !apiKey) {
    throw new Error('Intervals.icu credentials not configured');
  }

  const param = date || new Date().toISOString().slice(0, 10);
  const credentials = btoa(`API_KEY:${apiKey}`);
  const url = `${INTERVALS_API}/athlete/${athleteId}/events?oldest=${param}&newest=${param}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Intervals.icu returned ${res.status}`);
  }

  const events: IntervalsEvent[] = await res.json();
  return parseWorkouts(events);
}

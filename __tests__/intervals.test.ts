import { describe, it, expect } from 'vitest';
import { mapIntensityFactor, parseWorkouts } from '../lib/intervals';
import type { IntervalsEvent } from '../types';

describe('mapIntensityFactor', () => {
  it('maps low IF to easy', () => {
    expect(mapIntensityFactor(0.55)).toBe('easy');
  });

  it('maps Z2 IF to aerobic', () => {
    expect(mapIntensityFactor(0.70)).toBe('aerobic');
  });

  it('maps tempo IF to tempo', () => {
    expect(mapIntensityFactor(0.80)).toBe('tempo');
  });

  it('maps threshold IF to threshold', () => {
    expect(mapIntensityFactor(0.90)).toBe('threshold');
  });

  it('maps high IF to high', () => {
    expect(mapIntensityFactor(1.05)).toBe('high');
  });

  it('maps boundary 0.65 to aerobic', () => {
    expect(mapIntensityFactor(0.65)).toBe('aerobic');
  });

  it('maps boundary 0.95 to high', () => {
    expect(mapIntensityFactor(0.95)).toBe('high');
  });
});

describe('parseWorkouts', () => {
  it('parses a planned ride with IF and duration', () => {
    const events: IntervalsEvent[] = [
      {
        id: 1,
        name: '2hr Tempo Ride',
        duration: 7200,
        icu_intensity: 0.82,
        type: 'Ride',
      },
    ];
    const result = parseWorkouts(events);
    expect(result).toHaveLength(1);
    expect(result[0].durationMinutes).toBe(120);
    expect(result[0].intensity).toBe('tempo');
  });

  it('infers intensity from name when IF is missing', () => {
    const events: IntervalsEvent[] = [
      { id: 2, name: 'Easy Recovery Spin', duration: 3600 },
    ];
    const result = parseWorkouts(events);
    expect(result[0].intensity).toBe('easy');
  });

  it('infers threshold from name keywords', () => {
    const events: IntervalsEvent[] = [
      { id: 3, name: 'FTP Test', duration: 3600 },
    ];
    const result = parseWorkouts(events);
    expect(result[0].intensity).toBe('threshold');
  });

  it('defaults to aerobic for unclassified names', () => {
    const events: IntervalsEvent[] = [
      { id: 4, name: 'Tuesday Ride', duration: 5400 },
    ];
    const result = parseWorkouts(events);
    expect(result[0].intensity).toBe('aerobic');
  });

  it('uses moving_time when duration is missing', () => {
    const events: IntervalsEvent[] = [
      { id: 5, name: 'Ride', moving_time: 5400 },
    ];
    const result = parseWorkouts(events);
    expect(result[0].durationMinutes).toBe(90);
  });

  it('falls back to 60 min when no duration info', () => {
    const events: IntervalsEvent[] = [
      { id: 6, name: 'Ride' },
    ];
    const result = parseWorkouts(events);
    expect(result[0].durationMinutes).toBe(60);
  });

  it('filters out non-cycling events with known types', () => {
    const events: IntervalsEvent[] = [
      { id: 7, name: 'Morning Run', type: 'Run', duration: 1800 },
      { id: 8, name: 'Gravel Ride', type: 'Ride', duration: 7200 },
    ];
    const result = parseWorkouts(events);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gravel Ride');
  });

  it('includes WORKOUT category events', () => {
    const events: IntervalsEvent[] = [
      { id: 9, name: 'Sweet Spot Intervals', category: 'WORKOUT', duration: 5400 },
    ];
    const result = parseWorkouts(events);
    expect(result).toHaveLength(1);
  });
});

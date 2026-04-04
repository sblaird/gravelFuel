'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { fetchTodaysWorkouts } from '@/lib/intervals';
import type { PlannedWorkout } from '@/types';

export default function WorkoutPicker() {
  const { setDuration, setIntensity } = useApp();
  const [workouts, setWorkouts] = useState<PlannedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchTodaysWorkouts();
        if (!cancelled) {
          setWorkouts(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load workouts from Intervals.icu');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (workout: PlannedWorkout) => {
    setSelected(workout.id);
    setDuration(Math.max(30, workout.durationMinutes));
    setIntensity(workout.intensity);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-[#444444]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8601C] border-t-transparent" />
          Loading today&apos;s workouts from Intervals.icu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-[#444444]">{error}</p>
        <p className="text-xs text-[#444444] mt-1">
          Enter your ride details manually below.
        </p>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-[#444444]">
          No workouts scheduled for today on Intervals.icu.
        </p>
        <p className="text-xs text-[#444444] mt-1">
          Enter your ride details manually below.
        </p>
      </div>
    );
  }

  const intensityLabels: Record<string, string> = {
    easy: 'Easy / Recovery',
    aerobic: 'Aerobic / Endurance',
    tempo: 'Tempo',
    threshold: 'Threshold / Race',
    high: 'High Intensity',
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Today&apos;s Planned Workouts
        </h3>
        <p className="text-xs text-[#444444] mt-0.5">
          From Intervals.icu — tap to auto-fill duration and intensity.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {workouts.map((w) => {
          const isSelected = selected === w.id;
          const hours = Math.floor(w.durationMinutes / 60);
          const mins = w.durationMinutes % 60;
          const durationLabel =
            hours > 0
              ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
              : `${mins}m`;

          return (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={`flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all ${
                isSelected
                  ? 'border-[#E8601C] bg-[#E8601C]/5'
                  : 'border-gray-200 bg-white hover:border-[#E8601C]/40'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">
                  {w.name}
                </p>
                <p className="text-xs text-[#444444] mt-0.5">
                  {durationLabel} &middot; {intensityLabels[w.intensity] ?? w.intensity}
                </p>
              </div>
              {isSelected && (
                <div className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8601C]">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

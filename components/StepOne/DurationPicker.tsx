'use client';

import { useApp } from '@/lib/context';

export default function DurationPicker() {
  const { durationMinutes, setDuration } = useApp();

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  const setHours = (h: number) => {
    const clamped = Math.max(0, Math.min(24, h));
    setDuration(clamped * 60 + minutes);
  };

  const setMinutes = (m: number) => {
    const steps = [0, 15, 30, 45];
    const idx = steps.indexOf(m);
    if (idx >= 0) setDuration(hours * 60 + m);
  };

  const totalMin = hours * 60 + minutes;
  const isInvalid = totalMin < 30 || totalMin > 24 * 60;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#1A1A1A]">
        Planned Ride Duration
      </label>
      <div className="flex items-center gap-4">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#444444] mb-1">Hours</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHours(hours - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-[#1A1A1A] active:bg-gray-200"
              aria-label="Decrease hours"
            >
              −
            </button>
            <span className="w-12 text-center text-2xl font-bold text-[#1A1A1A]">
              {hours}
            </span>
            <button
              onClick={() => setHours(hours + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-[#1A1A1A] active:bg-gray-200"
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>

        <span className="text-2xl font-bold text-[#444444] mt-5">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#444444] mb-1">Minutes</span>
          <div className="flex gap-1">
            {[0, 15, 30, 45].map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  minutes === m
                    ? 'bg-[#E8601C] text-white'
                    : 'bg-gray-100 text-[#1A1A1A] active:bg-gray-200'
                }`}
                aria-label={`${m} minutes`}
              >
                {String(m).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isInvalid && (
        <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
          <span aria-hidden="true">!</span>
          {totalMin < 30
            ? 'Minimum ride duration is 30 minutes.'
            : 'Maximum ride duration is 24 hours.'}
        </p>
      )}
    </div>
  );
}

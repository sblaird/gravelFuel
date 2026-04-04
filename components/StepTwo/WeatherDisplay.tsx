'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { fetchWeatherWithFallback, fetchWeather } from '@/lib/weather';
import { calculateHeatTier, celsiusToFahrenheit } from '@/lib/calculations';
import { HEAT_MULTIPLIERS, HEAT_TIER_LABELS } from '@/lib/products';
import type { HeatTier } from '@/types';

export default function WeatherDisplay() {
  const {
    weatherData,
    weatherLoading,
    weatherError,
    manualWeather,
    unitSystem,
    setWeatherData,
    setWeatherLoading,
    setWeatherError,
    setManualWeather,
    recalculate,
  } = useApp();

  const [showManual, setShowManual] = useState(false);
  const [manualTemp, setManualTemp] = useState('25');
  const [manualHumidity, setManualHumidity] = useState('50');
  const [zipCode, setZipCode] = useState('');
  const [locationName, setLocationName] = useState<string | null>(null);

  // Auto-fetch weather on mount with geolocation → default fallback
  useEffect(() => {
    if (weatherData || manualWeather) return;

    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(null);

    (async () => {
      try {
        const data = await fetchWeatherWithFallback();
        if (!cancelled) {
          setWeatherData(data);
          setWeatherLoading(false);
          recalculate();
        }
      } catch {
        if (!cancelled) {
          setWeatherError('Weather unavailable — using intensity-only hydration targets.');
          setWeatherLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleZipSubmit = async () => {
    if (!zipCode.trim()) return;
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const res = await fetch(`/api/weather?zip=${encodeURIComponent(zipCode.trim())}`);
      if (!res.ok) throw new Error('Zip lookup failed');
      const data = await res.json();

      const heatTier: HeatTier = calculateHeatTier(data.temperatureC, data.humidity);
      const weatherResult = {
        temperatureC: data.temperatureC,
        humidity: data.humidity,
        heatTier,
        multiplier: HEAT_MULTIPLIERS[heatTier],
        description: HEAT_TIER_LABELS[heatTier],
      };
      setWeatherData(weatherResult);
      setLocationName(data.name || zipCode);
      setManualWeather(null);
      setWeatherLoading(false);
      setShowManual(false);
      recalculate();
    } catch {
      setWeatherError('Could not look up that zip code.');
      setWeatherLoading(false);
    }
  };

  const handleManualSubmit = () => {
    let tempC = parseFloat(manualTemp);
    const hum = parseFloat(manualHumidity);
    if (isNaN(tempC) || isNaN(hum)) return;

    // Convert from °F if imperial
    if (unitSystem === 'imperial') {
      tempC = (tempC - 32) * 5 / 9;
    }

    const heatTier: HeatTier = calculateHeatTier(tempC, hum);
    setManualWeather({ temperatureC: tempC, humidity: hum });
    setWeatherData({
      temperatureC: tempC,
      humidity: hum,
      heatTier,
      multiplier: HEAT_MULTIPLIERS[heatTier],
      description: HEAT_TIER_LABELS[heatTier],
    });
    setWeatherError(null);
    setLocationName(null);
    setShowManual(false);
    recalculate();
  };

  const activeData = weatherData;
  const tempDisplay = activeData
    ? unitSystem === 'metric'
      ? `${Math.round(activeData.temperatureC)}°C`
      : `${celsiusToFahrenheit(activeData.temperatureC)}°F`
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Weather Conditions
        </h3>
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-[#E8601C] font-medium hover:underline"
        >
          {showManual ? 'Cancel' : 'Change location'}
        </button>
      </div>

      {weatherLoading && (
        <div className="flex items-center gap-2 text-sm text-[#444444]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8601C] border-t-transparent" />
          Fetching weather...
        </div>
      )}

      {weatherError && !showManual && (
        <p className="text-sm text-[#444444] bg-gray-50 rounded-lg p-3">
          {weatherError}
        </p>
      )}

      {activeData && !showManual && !weatherLoading && (
        <div className="space-y-1">
          <p className="text-sm text-[#1A1A1A]">
            <span className="font-medium">{tempDisplay}</span>,{' '}
            {Math.round(activeData.humidity)}% humidity
            {locationName && (
              <span className="text-[#444444]"> — {locationName}</span>
            )}
          </p>
          <p
            className={`text-sm font-semibold ${
              activeData.heatTier === 'extreme'
                ? 'text-red-600'
                : 'text-[#E8601C]'
            }`}
          >
            {activeData.description} ({activeData.multiplier}x hydration)
          </p>
          {activeData.heatTier === 'extreme' && (
            <div
              className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
              role="alert"
            >
              <strong>Safety Advisory:</strong> Extreme heat detected. Consider
              reducing ride intensity and duration.
            </div>
          )}
        </div>
      )}

      {showManual && (
        <div className="space-y-4">
          {/* Zip Code Lookup */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#444444]">
              Zip Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
                placeholder="e.g. 05651"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleZipSubmit}
                className="rounded-lg bg-[#E8601C] px-4 py-2 text-sm font-bold text-white"
              >
                Lookup
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
            <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#444444]">
              or enter manually
            </p>
          </div>

          {/* Manual temp/humidity */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#444444]">
                Temperature ({unitSystem === 'metric' ? '°C' : '°F'})
              </label>
              <input
                type="number"
                value={manualTemp}
                onChange={(e) => setManualTemp(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#444444]">Humidity (%)</label>
              <input
                type="number"
                value={manualHumidity}
                onChange={(e) => setManualHumidity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleManualSubmit}
            className="rounded-lg bg-[#E8601C] px-4 py-2 text-sm font-bold text-white"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

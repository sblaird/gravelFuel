import type { WeatherData, HeatTier } from '@/types';
import { calculateHeatTier } from './calculations';
import { HEAT_MULTIPLIERS, HEAT_TIER_LABELS } from './products';

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const res = await fetch(
    `/api/weather?lat=${latitude}&lon=${longitude}`
  );

  if (!res.ok) {
    throw new Error('Weather fetch failed');
  }

  const data = await res.json();
  const temperatureC: number = data.temperatureC;
  const humidity: number = data.humidity;
  const heatTier: HeatTier = calculateHeatTier(temperatureC, humidity);
  const multiplier = HEAT_MULTIPLIERS[heatTier];
  const description = HEAT_TIER_LABELS[heatTier];

  return { temperatureC, humidity, heatTier, multiplier, description };
}

export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 300000, // 5 min cache
    });
  });
}

export function getWeatherDescription(
  temperatureC: number,
  humidity: number,
  heatTier: HeatTier
): string {
  const tempF = Math.round((temperatureC * 9) / 5 + 32);
  return `${Math.round(temperatureC)}°C / ${tempF}°F, ${Math.round(humidity)}% humidity — ${HEAT_TIER_LABELS[heatTier]}`;
}

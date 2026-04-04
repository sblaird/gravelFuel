import type { WeatherData, HeatTier } from '@/types';
import { calculateHeatTier } from './calculations';
import { HEAT_MULTIPLIERS, HEAT_TIER_LABELS } from './products';

// Default location: Middlesex, VT (05651)
const DEFAULT_LAT = 44.35;
const DEFAULT_LON = -72.58;

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

export async function fetchWeatherWithFallback(): Promise<WeatherData> {
  // Try browser geolocation first
  try {
    const pos = await getUserLocation();
    return await fetchWeather(pos.coords.latitude, pos.coords.longitude);
  } catch {
    // Fall back to default location
    return await fetchWeather(DEFAULT_LAT, DEFAULT_LON);
  }
}

export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5000,
      maximumAge: 300000, // 5 min cache
    });
  });
}

/**
 * Geocode a US zip code to lat/lon using Open-Meteo's geocoding API.
 */
export async function geocodeZip(
  zip: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  const res = await fetch(
    `/api/weather?zip=${encodeURIComponent(zip)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.lat != null) {
    return { lat: data.lat, lon: data.lon, name: data.name || zip };
  }
  return null;
}

export function getWeatherDescription(
  temperatureC: number,
  humidity: number,
  heatTier: HeatTier
): string {
  const tempF = Math.round((temperatureC * 9) / 5 + 32);
  return `${Math.round(temperatureC)}°C / ${tempF}°F, ${Math.round(humidity)}% humidity — ${HEAT_TIER_LABELS[heatTier]}`;
}

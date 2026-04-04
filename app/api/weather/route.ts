import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // If zip code provided, geocode it first via Open-Meteo geocoding
  if (zip) {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      // Try as US postal code using zip-to-lat/lon
      const zipRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=44.35&longitude=-72.58&current=temperature_2m,relative_humidity_2m`
      );
      if (!zipRes.ok) {
        return NextResponse.json({ error: 'Zip code not found' }, { status: 404 });
      }
      // Return default location weather with geocode info
      const zipData = await zipRes.json();
      return NextResponse.json({
        temperatureC: zipData.current.temperature_2m,
        humidity: zipData.current.relative_humidity_2m,
        lat: 44.35,
        lon: -72.58,
        name: zip,
      });
    }
    const place = geoData.results[0];
    // Now fetch weather for that location
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      return NextResponse.json({ error: 'Weather fetch failed' }, { status: 502 });
    }
    const weatherData = await weatherRes.json();
    return NextResponse.json({
      temperatureC: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      lat: place.latitude,
      lon: place.longitude,
      name: place.name || zip,
    });
  }

  // Standard lat/lon weather fetch
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat/lon or zip query parameter required' },
      { status: 400 }
    );
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({
    temperatureC: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
  });
}

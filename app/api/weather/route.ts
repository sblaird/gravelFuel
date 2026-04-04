import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon query parameters are required' },
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
  const temperatureC: number = data.current.temperature_2m;
  const humidity: number = data.current.relative_humidity_2m;

  return NextResponse.json({ temperatureC, humidity });
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const INTERVALS_API = 'https://intervals.icu/api/v1';

export async function GET(request: NextRequest) {
  const athleteId = process.env.INTERVALS_ATHLETE_ID;
  const apiKey = process.env.INTERVALS_API_KEY;

  if (!athleteId || !apiKey) {
    return NextResponse.json(
      { error: 'Intervals.icu credentials not configured' },
      { status: 500 }
    );
  }

  // Default to today's date
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const credentials = btoa(`API_KEY:${apiKey}`);
  const url = `${INTERVALS_API}/athlete/${athleteId}/events?oldest=${dateParam}&newest=${dateParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Intervals.icu returned ${res.status}` },
        { status: res.status }
      );
    }

    const events = await res.json();
    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch from Intervals.icu' },
      { status: 502 }
    );
  }
}

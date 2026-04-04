import { NextRequest, NextResponse } from 'next/server';

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

  const credentials = Buffer.from(`API_KEY:${apiKey}`).toString('base64');
  const url = `${INTERVALS_API}/athlete/${athleteId}/events?oldest=${dateParam}&newest=${dateParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'GravelFuel/1.0',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Intervals.icu returned ${res.status}`, detail: body },
        { status: res.status }
      );
    }

    const events = await res.json();
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch from Intervals.icu', detail: String(err) },
      { status: 502 }
    );
  }
}

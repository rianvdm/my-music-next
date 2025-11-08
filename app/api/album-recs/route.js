// ABOUTME: API route that proxies album recommendations requests to Cloudflare Worker
// ABOUTME: Adds API key header server-side to prevent exposure to browser

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const album = searchParams.get('album');
  const artist = searchParams.get('artist');

  if (!album || !artist) {
    return NextResponse.json(
      { error: 'Album and artist parameters are required' },
      { status: 400 }
    );
  }

  try {
    const workerUrl = `https://api-perplexity-albumrecs.rian-db8.workers.dev?album=${encodeURIComponent(
      album
    )}&artist=${encodeURIComponent(artist)}`;

    const response = await fetch(workerUrl, {
      headers: {
        'X-API-Key': process.env.ALBUM_DETAIL_API_KEY,
        Referer: 'https://listentomore.com',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch album recommendations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to album recs worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

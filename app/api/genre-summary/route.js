// ABOUTME: API route that proxies genre summary requests to Cloudflare Worker
// ABOUTME: Adds API key header server-side to prevent exposure to browser

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');

  if (!genre) {
    return NextResponse.json({ error: 'Genre parameter is required' }, { status: 400 });
  }

  try {
    const workerUrl = `https://api-perplexity-genresummary.rian-db8.workers.dev?genre=${encodeURIComponent(
      genre
    )}`;

    const response = await fetch(workerUrl, {
      headers: {
        'X-API-Key': process.env.ALBUM_DETAIL_API_KEY,
        Referer: 'https://listentomore.com',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch genre summary' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to genre summary worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

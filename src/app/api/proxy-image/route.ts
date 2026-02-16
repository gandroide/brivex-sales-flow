import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // Pass strictly necessary headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    headers.set('Content-Type', contentType);
    // Cache control for performance
    headers.set('Cache-Control', 'public, max-age=3600'); 

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(`Proxy Error fetching ${url}:`, error);
    // Fallback? Or just 404 so React-PDF handles specific error?
    // Returning 404 allows the caller to handle it or show broken image
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 404 });
  }
}

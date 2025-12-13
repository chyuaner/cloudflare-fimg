import { handleRequest } from '../../core/app';
import { VercelAssetLoader } from '../../core/loaders/VercelAssetLoader';
import { ImageResponse } from 'next/og';

export const runtime = 'edge'; // Vercel Edge Runtime

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Next.js App Router doesn't automatically serve public/index.html for / if a dynamic route exists.
  // We manually proxy / to /index.html.
  if (pathname === '/') {
    try {
      const indexUrl = new URL('/index.html', request.url);
      const indexResponse = await fetch(indexUrl);
      if (indexResponse.ok) {
        return indexResponse;
      }
    } catch (e) {
      // Ignore error, fall through to fallback logic
    }
  }

  const origin = url.origin;
  
  const loader = new VercelAssetLoader(origin);
  
  // Vercel might not pass exact process.env in the same way, but let's try
  // We can also pass an empty object or specific env vars if needed.
  const env = {
    // Pass any needed env vars here
    ENABLE_DEBUG: process.env.ENABLE_DEBUG,
  };

  return handleRequest(request, loader, env, ImageResponse);
}

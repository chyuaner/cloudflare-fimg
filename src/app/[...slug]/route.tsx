import { handleRequest } from '../../core/app';
import { VercelAssetLoader } from '../../core/loaders/VercelAssetLoader';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Prevent recursion: if we are trying to load a font/image from public but it hit this route,
  // it means the file is missing or not served correctly. Return 404 to stop the loop.
  if (pathname.startsWith('/font/') || pathname.startsWith('/images/')) {
    return new Response('Asset not found', { status: 404 });
  }

  const origin = url.origin;
  
  const loader = new VercelAssetLoader(origin);
  const env = { ENABLE_DEBUG: process.env.ENABLE_DEBUG };

  return handleRequest(request, loader, env, ImageResponse);
}

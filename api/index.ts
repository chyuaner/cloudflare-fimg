import { handleRequest } from '../src/core/app';
import { VercelAssetLoader } from '../src/core/loaders/VercelAssetLoader';

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge', // Use Vercel Edge Runtime
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  
  // Use the origin from the request to initialize the loader
  const loader = new VercelAssetLoader(url.origin);

  // Vercel Edge Functions uses standard Web API Request/Response
  return handleRequest(request, loader, {
    ENABLE_DEBUG: process.env.ENABLE_DEBUG,
  }, ImageResponse);
}

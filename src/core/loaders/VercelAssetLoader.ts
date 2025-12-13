import type { AssetLoader } from '../assetLoader';

export class VercelAssetLoader implements AssetLoader {
  private origin: string;

  constructor(origin: string) {
    this.origin = origin;
  }

  private getUrl(path: string): string {
    // In Vercel Edge Runtime (Next.js), we can use the relative URL from import.meta.url
    // We assume the assets are in public/, and this file is in src/core/loaders/
    // Relative path from src/core/loaders/ to public/ is ../../../public/
    // However, for Next.js, public assets are served at root.
    // The standard way to access bundled assets in Edge is:
    return new URL(path, import.meta.url).toString();
  }

  async loadFont(name: string): Promise<ArrayBuffer> {
    // Try to load via standard fetch (which might loop if not careful)
    // OR use the bundler's URL.
    // For Vercel OG, typically we point to the absolute URL.
    // Given the recursion issue, sticking to relative URL from import.meta.url is safest if the bundler supports it.
    // Note: Next.js treats `public` as root.
    // Let's try constructing the URL to the deployment URL if possible, or fall back to this relative approach.
    // Actually, `new URL('../../public/font/' + name, import.meta.url)` is the pattern for bundling.
    
    // We need to map the incoming path (e.g. 'Lobster.ttf') to the relative path.
    const relativePath = `../../../public/font/${name}`;
    const url = new URL(relativePath, import.meta.url);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load font ${name}: ${response.statusText}`);
    }
    return response.arrayBuffer();
  }

  async loadImage(path: string): Promise<ArrayBuffer> {
     // path is like dir/file.ext
     // assume path is relative to public root?
     // e.g. path = 'bg/5/3/ph/...' -> this is likely NOT a static file path, but a generated one?
     // Wait, `loadImage` in parsing might request a background image TPL.
     // If `bg.bgcolor` is a url, it might be external or internal.
     // If internal, we need to handle it.
     
     // For now, let's assume path is a full URL or relative path.
     // If it starts with http, fetch it directly.
     if (path.startsWith('http')) {
         const response = await fetch(path);
         if (!response.ok) throw new Error(`Failed to load external image ${path}`);
         return response.arrayBuffer();
     }

     // Internal static image?
     // The current usage of loadImage seems to be for `tpl` background which might be static files?
     // If so, same logic as fonts.
     const relativePath = `../../../public${path}`;
     const url = new URL(relativePath, import.meta.url);
     
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load image ${path}: ${response.statusText}`);
    }
    return response.arrayBuffer();
  }

  async loadText(path: string): Promise<string> {
    const relativePath = `../../../public${path}`;
    const url = new URL(relativePath, import.meta.url);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load text ${path}: ${response.statusText}`);
    }
    return response.text();
  }
}

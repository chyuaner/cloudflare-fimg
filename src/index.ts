import { handleRequest } from "./core/app";
import { CloudflareAssetLoader } from "./core/loaders/CloudflareAssetLoader";
import { ImageResponse } from '@cf-wasm/og';
import { splitUrl } from "./core/urlUtils/splitUrl";
import { parseSingleSize, parseSize } from "./core/urlUtils/parseUrl";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Serve static assets (HTML, CSS, JS) from the ASSETS binding
    // These are built by Astro and deployed with the worker
    if (pathname === '/' || pathname.startsWith('/assets/') || pathname.endsWith('.html') || pathname.endsWith('.css') || pathname.endsWith('.js')) {
      if (env.ASSETS) {
        try {
          const response = await env.ASSETS.fetch(request);
          if (response.status !== 404) {
            return response;
          }
        } catch (e) {
          console.error('Error serving static asset:', e);
        }
      }
    }

    //
    // 處理結尾斜線
    const normalizedPath = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
    const fullPath = normalizedPath + url.search;
    const { canvas: rawCanvasParam, bg, content, query } = splitUrl(fullPath);
    const shadowValue = bg.shadow ? parseSingleSize(bg.shadow) : 0;
    const radiusValue = bg.radius ? parseSingleSize(bg.radius) : 0;
    // 一旦有用到陰影或圓角，直接導流到下游主機商
    if (shadowValue>0) {
      return fetch(url.toString(), request);
    }

    // if (condition) {

    // } else {
    //   const { width: origWidth, height: origHeight } = parseSize(rawCanvasParam);
    // }

    // 使用Cloudflare Workers運算產圖
    const environmentInfo = {
      platform: 'Cloudflare Workers'
    };
    // Handle dynamic image generation
    const loader = new CloudflareAssetLoader(env.ASSETS);
    return handleRequest(request, {assetLoader: loader, ImageResponseClass: ImageResponse}, env, environmentInfo);
  },
} satisfies ExportedHandler<CloudflareBindings>;

import { Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash'
import { AssetLoader } from './core/assetLoader';
import { applyRoutes } from './core/router';

type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    assetLoader: AssetLoader;
  }
};

const app = new Hono<Env>({ strict: true });
app.use(trimTrailingSlash())

// -----------------------------------------------------------------------------
// 處理靜態資源路由
// -----------------------------------------------------------------------------
// Middleware to ensure assetLoader is available
app.use('*', async (c, next) => {
  if (!c.get('assetLoader')) {
    // In CF worker, index.ts should set this.
    // In Node adapter, server.ts should set this.
    return c.text('Internal Server Error: AssetLoader not configured', 500);
  }
  await next();
});

// Root handler to serve index.html
// Root handler to serve index.html
// Static assets (including index.html) are handled by Cloudflare Workers Assets or Node serve-static middleware.
// This route is only a fallback or for dynamic API logic.


// -----------------------------------------------------------------------------
// 處理圖片生成 動態路由
// -----------------------------------------------------------------------------

applyRoutes(app);


export default app;

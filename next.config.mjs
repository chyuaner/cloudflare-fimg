
import fs from 'node:fs';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use src/app as the app directory (default in Next.js 13+ if src/app exists)
  // We can explicitly set other config here if needed.
  // Rewrites to serve Astro-built static files instead of hitting the dynamic route
  async rewrites() {
    const publicDir = path.resolve('public');
    const staticPages = [];

    // Safety check if public dir exists
    if (fs.existsSync(publicDir)) {
      const items = fs.readdirSync(publicDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          // Check if this directory has index.html
          const indexPath = path.join(publicDir, item.name, 'index.html');
          if (fs.existsSync(indexPath)) {
             // Avoid adding generator here to keep manual control or just add it universally
             // The user said: "However /generator is special... I accept hardcoding it"
             // But valid dynamic logic is: if it exists, serve it.
             // If I add it here, it covers /generator -> /generator/index.html
             // But the user also needs /generator/:path* -> /generator/index.html
             
             // Base rule for the folder root: /intro -> /intro/index.html
             staticPages.push({
               source: `/${item.name}`,
               destination: `/${item.name}/index.html`,
             });
          }
        }
      }
    }

    // Special handling for generator sub-paths
    // The dynamic loop above handles /generator -> /generator/index.html
    // We just need to add the wildcard rule.
    const generatorWildcard = {
      source: '/generator/:path*',
      destination: '/generator/index.html',
    };

    return [
      ...staticPages,
      generatorWildcard
    ];
  },
};

export default nextConfig;

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  outDir: './public',
  publicDir: './static',
  srcDir: './src/frontend',
  server: {
    port: 4321,
    host: true
  },
  vite: {
    plugins: [tailwindcss({
      config: path.resolve('./tailwind.config.js'),
    })],
  },
});

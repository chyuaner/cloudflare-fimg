import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs'; // ES‑module 方式

export default defineConfig({
  // ---------- 基本目錄 ----------
  outDir: './public',          // 產出目錄（build 時使用）
  publicDir: './static',      // 靜態資源目錄
  srcDir: './src/frontend',   // 前端原始檔案目錄

  // ---------- 開發伺服器 ----------
  server: {
    port: 4321,
    host: true,
  },

  // -------------------------------------------------
  // Vite 設定 – 只針對「符合規則」的路徑走代理
  // -------------------------------------------------
  vite: {
    plugins: [
      tailwindcss({
        config: path.resolve('./tailwind.config.js'),
      })
    ],
    server: {
      proxy: {
        // 正則：數字 / 數字x數字、/bg、/ph、/404
        //   ^/(\d+(x\d+)?)/.*$   → 例如 /60/abc、/800x600/foo
        //   |^/(bg|ph)/.*$       → 例如 /bg/logo.png、/ph/avatar.jpg
        //   |^/404$              → 正好是 /404
        '^/(\\d+(x\\d+)?)/.*$|^/(bg|ph)/.*$|^/404$': {
          target: 'http://localhost:8787', // 你的 API 伺服器
          changeOrigin: true,
          // 只要符合正則就直接代理，不需要任何 bypass 處理
        },
      },
    },
  },
});

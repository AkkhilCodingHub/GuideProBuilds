// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: './client',
  server: {
    port: 5000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: [
      'all',
      '660e9c7f-3141-4dbd-8183-19ca3ca59670-00-8kbsm0162vfq.worf.replit.dev'
      'c3b84242-00f7-4826-8ecd-eadfc2d1095b-00-1d4pgor8p63pn.worf.replit.dev',
      'guideprobuilds.onrender.com'
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5000,
      clientPort: 5000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
    },
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  }
});
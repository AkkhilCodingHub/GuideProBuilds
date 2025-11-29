import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// mongoimport  (103.87.27.240) nF4!xZ2qP9@tVr7#Lk1 mongopass
export default defineConfig({
  server: {
    port: 5000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: [
      'all',
      'c3b84242-00f7-4826-8ecd-eadfc2d1095b-00-1d4pgor8p63pn.worf.replit.dev',
      '8d9f23c3-dee7-4afa-9844-11f36d9b77e1-00-tuumndcnprge.picard.replit.dev'
    ],
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      port: 5000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path, { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  root: resolve(__dirname, "client"),
  server: {
    port: 5000,
<<<<<<< Updated upstream
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: [
      'all',
      '660e9c7f-3141-4dbd-8183-19ca3ca59670-00-8kbsm0162vfq.worf.replit.dev'
      'c3b84242-00f7-4826-8ecd-eadfc2d1095b-00-1d4pgor8p63pn.worf.replit.dev',
      'guideprobuilds.onrender.com'
    ],
=======
>>>>>>> Stashed changes
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
  plugins: [react(), tailwindcss()],
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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'wouter'],
          'ui': ['@radix-ui/react-dialog', 'lucide-react', 'framer-motion']
        }
      }
    }
  }
})
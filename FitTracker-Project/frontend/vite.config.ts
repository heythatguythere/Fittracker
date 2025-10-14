import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
<<<<<<< Current (Your changes)
  plugins: [react(), cloudflare()],
=======
  plugins: [react()],
>>>>>>> Incoming (Background Agent changes)
  publicDir: 'public',
  server: {
    // THIS IS THE NEW PROXY CONFIGURATION
    proxy: {
      // Any request starting with /api will be forwarded to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Any request starting with /auth will also be forwarded
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
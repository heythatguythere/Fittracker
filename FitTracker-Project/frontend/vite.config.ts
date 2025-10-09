import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    // THIS IS THE NEW PROXY CONFIGURATION
    proxy: {
      // Any request starting with /api will be forwarded to the backend
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? process.env.VITE_API_URL || 'https://your-app-name.vercel.app'
          : 'http://localhost:5000',
        changeOrigin: true,
      },
      // Any request starting with /auth will also be forwarded
      '/auth': {
        target: process.env.NODE_ENV === 'production' 
          ? process.env.VITE_API_URL || 'https://your-app-name.vercel.app'
          : 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
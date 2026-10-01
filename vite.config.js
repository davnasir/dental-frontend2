import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'https://server.alldigitalsolution.xyz',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://server.alldigitalsolution.xyz',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'https://server.alldigitalsolution.xyz',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'https://server.alldigitalsolution.xyz',
        changeOrigin: true,
      },
      '/realtime': {
        target: 'https://server.alldigitalsolution.xyz',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

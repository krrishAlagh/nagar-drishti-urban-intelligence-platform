import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3005,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5005',
          changeOrigin: true,
        },
        '/datasets': {
          target: 'http://localhost:5005',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:5005',
          ws: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/server/**',
          '**/server/data/**',
          '**/ai_engine/**',
          '**/datasets/**',
          '**/runs/**',
          '**/*.json',
          '**/.gemini/**'
        ]
      }
    },
  };
});


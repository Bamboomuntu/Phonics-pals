import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['**/*.mp3', '**/*.wav', '**/*.png', '**/*.webp', '**/*.svg'],
          manifest: {
            name: 'Phonic Pals - Adventure in Pronunciation',
            short_name: 'Phonic Pals',
            description: 'Bilingual English-Lusoga pronunciation game for Ugandan kids',
            theme_color: '#f0fdf4',
            background_color: '#f0fdf4',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,tsx,ts,json,woff2,mp3,wav,png,webp,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'tailwind-cache',
                  expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
              },
              {
                urlPattern: /^https:\/\/esm\.sh\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'esm-sh-cache',
                  expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
              },
              {
                // Cache any pre-generated audio/image assets
                urlPattern: /\/assets\/cache\//i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'phonic-assets',
                  expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
    };
});

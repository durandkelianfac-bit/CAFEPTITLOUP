import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.BASE_PATH ?? './',
  test: { include: ['tests/**/*.test.ts'] },
  build: { chunkSizeWarningLimit: 900 },
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg', 'apple-touch-icon.png'],
    manifest: {
      name: 'CAFEP Philo — Cartes de révision', short_name: 'CAFEP Philo', lang: 'fr',
      description: 'Révision par flashcards et répétition espacée pour le CAFEP de philosophie',
      start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
      background_color: '#f6f3ec', theme_color: '#1f3a5f',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json}'], navigateFallback: 'index.html', maximumFileSizeToCacheInBytes: 4_000_000 },
  })],
});

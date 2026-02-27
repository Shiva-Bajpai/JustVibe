import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vibe-icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'JustVibe',
        short_name: 'Vibe',
        description: 'Just vibes, nothing else',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',

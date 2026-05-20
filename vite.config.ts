import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.pfb", "**/*.ttf"],
  plugins: [
    vue(),
    VitePWA({
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "favicon.svg"],
      workbox: {
        globPatterns: ["assets/*", "**/*.{js,css,html}"],
        maximumFileSizeToCacheInBytes: 10000000,
      },
      manifest: {
        name: "PDFPRN",
        short_name: "PDFPRN",
        description:
          "PDFPRN is a pure frontend website that makes your PDFs look like they were printed by real printers. Simulates color/grayscale laser, inkjet, and dot-matrix printers.",
        theme_color: "#0f0f13",
        icons: [
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "pwa-maskable-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "pwa-maskable-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
      },
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
  // worker: {
  //   format: "es",
  // },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
});

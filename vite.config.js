import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// import { VitePWA } from 'vite-plugin-pwa'; // Disabled - see PWA_SETUP.md for setup
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), 
      svgr(),
      // PWA Configuration - Currently disabled
      // To enable PWA, uncomment the import above and this code block
      // See PWA_SETUP.md for setup instructions
      // ...(env.VITE_ENABLE_PWA === 'true' ? [
      //   VitePWA({
      //     registerType: 'autoUpdate',
      //     includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt'],
      //     manifest: {
      //       name: 'Momentum AI',
      //       short_name: 'Momentum AI',
      //       description: 'AI-powered content creation and management platform',
      //       theme_color: '#0f172a',
      //       background_color: '#0f172a',
      //       display: 'standalone',
      //       orientation: 'portrait',
      //       scope: '/',
      //       start_url: '/',
      //       icons: [
      //         {
      //           src: '/pwa-192x192.png',
      //           sizes: '192x192',
      //           type: 'image/png'
      //         },
      //         {
      //           src: '/pwa-512x512.png',
      //           sizes: '512x512',
      //           type: 'image/png'
      //         },
      //         {
      //           src: '/pwa-512x512.png',
      //           sizes: '512x512',
      //           type: 'image/png',
      //           purpose: 'any maskable'
      //         }
      //       ]
      //     },
      //     workbox: {
      //       runtimeCaching: [
      //         {
      //           urlPattern: /^https:\/\/api\..+/i,
      //           handler: 'NetworkFirst',
      //           options: {
      //             cacheName: 'api-cache',
      //             expiration: {
      //               maxEntries: 50,
      //               maxAgeSeconds: 60 * 60 * 24
      //             },
      //             cacheableResponse: {
      //               statuses: [0, 200]
      //             }
      //           }
      //         }
      //       ]
      //     },
      //     devOptions: {
      //       enabled: false
      //     }
      //   })
      // ] : [])
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      open: true,
      // Proxy API requests to the backend server
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    // Only pass through VITE_ prefixed environment variables to the client
    // This is the default behavior, but we're being explicit here
    envPrefix: 'VITE_',
  };
});

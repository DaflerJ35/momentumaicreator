import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  // Build plugins array
  const plugins = [
    react(), 
    svgr(),
  ];

  // PWA Configuration - Enabled via VITE_ENABLE_PWA environment variable
  if (env.VITE_ENABLE_PWA === 'true') {
    try {
      // Dynamically import VitePWA only when PWA is enabled
      const { default: VitePWA } = await import('vite-plugin-pwa');
      plugins.push(
        VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt'],
        manifest: {
          name: 'Momentum AI',
          short_name: 'Momentum AI',
          description: 'AI-powered content creation and management platform',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\..+/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false // Disable PWA in development
        }
      })
      );
    } catch (error) {
      console.warn('PWA plugin not available. Install vite-plugin-pwa to enable PWA features.', error.message);
    }
  }

  return {
    plugins,
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
          secure: false,
          // Configure for Vercel deployment
          ...(process.env.VERCEL && {
            target: `https://${process.env.VERCEL_URL}`,
          })
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable in production for better performance
      // Code splitting optimization
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'animation-vendor': ['framer-motion'],
            'ui-vendor': ['lucide-react'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/database'],
            'chart-vendor': ['recharts'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
    },
    // Only pass through VITE_ prefixed environment variables to the client
    // This is the default behavior, but we're being explicit here
    envPrefix: 'VITE_',
  };
});

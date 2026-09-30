/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import analog from '@analogjs/platform';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import fg from 'fast-glob';

// Nitro's SSR module resolver (exsolve) trips Node's DEP0155 trailing-slash
// deprecation while resolving a FontAwesome subpath during the server build.
// That is third-party build tooling, not this project's code, so silence only
// that one deprecation and leave every other warning intact.
const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error, ...rest: unknown[]) => {
  if (rest.includes('DEP0155') || String(warning).includes('deprecated trailing slash pattern')) {
    return;
  }
  (originalEmitWarning as (...a: unknown[]) => void)(warning, ...rest);
}) as typeof process.emitWarning;

/**
 * Custom plugin to watch component SCSS and HTML files during build --watch.
 * By default, Rollup only watches files in the module graph.
 * Component styles/templates are loaded via Angular plugin transforms, not imports,
 * so we need to explicitly add them to the watch list.
 * Only applies to build mode (not dev server which has its own HMR).
 */
const isWatch = process.argv.includes('--watch');

function watchComponentAssets(): Plugin {
  return {
    name: 'watch-component-assets',
    apply: 'build',
    buildStart() {
      if (!isWatch) return; // Only scan files when actually watching
      const patterns = ['src/**/*.component.scss', 'src/**/*.component.html', 'src/styles.scss'];
      const files = fg.sync(patterns, { cwd: __dirname });
      for (const file of files) {
        this.addWatchFile(resolve(__dirname, file));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables (available via import.meta.env in app code)
  loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  // API target: configurable via VITE_API_URL for Docker dev (defaults to local Kestrel)
  const apiTarget = process.env['VITE_API_URL'] || 'https://localhost:1998';
  const apiSecure = !!process.env['VITE_API_URL']; // false for localhost self-signed certs, true for external URLs

  return {
    root: __dirname,
    publicDir: 'public',

    build: {
      outDir: '../wwwroot',
      // The SSR bundle and the Nitro output are written inside this directory
      // while the client build runs alongside them, so emptying it here is a
      // race that can delete the server entry before Nitro reads it. The
      // pre-build script clears the directory once, before either build starts.
      emptyOutDir: false,
      // External source maps in dev for debugging TS in browser DevTools (faster than inline)
      // Note: Angular optimizer doesn't generate its own sourcemaps, so some mappings may be imprecise
      sourcemap: isDev,
      // Skip minification in dev for better debugging and faster builds
      minify: !isDev,
      target: ['es2022'],
      reportCompressedSize: !isDev,
      chunkSizeWarningLimit: 600, // Increase from default 500kb

      rollupOptions: {
        // Suppress noisy warnings from third-party packages
        onwarn(warning, warn) {
          // Suppress Angular optimizer sourcemap warnings (optimizer doesn't generate sourcemaps)
          if (
            warning.plugin === '@analogjs/vite-plugin-angular-optimizer' ||
            warning.message?.includes('Sourcemap is likely to be incorrect')
          ) {
            return;
          }
          warn(warning);
        },
        output: {
          // Manual chunks for better code splitting (skip in dev for faster builds)
          ...(!isDev && { manualChunks: (id: string) => {
            // Angular core and common - shared across all routes
            if (id.includes('@angular/core') || id.includes('@angular/common')) {
              return 'angular-core';
            }
            // Angular CDK - foundation for Material
            if (id.includes('@angular/cdk')) {
              return 'angular-cdk';
            }
            // Angular Material - split by component category
            if (id.includes('@angular/material')) {
              // Dialog, overlay, popup components (used for modals)
              if (
                id.includes('/dialog') ||
                id.includes('/snack-bar') ||
                id.includes('/bottom-sheet') ||
                id.includes('/tooltip')
              ) {
                return 'mat-overlay';
              }
              // Form-related components
              if (
                id.includes('/form-field') ||
                id.includes('/input') ||
                id.includes('/select') ||
                id.includes('/checkbox') ||
                id.includes('/radio') ||
                id.includes('/slide-toggle') ||
                id.includes('/slider') ||
                id.includes('/datepicker') ||
                id.includes('/autocomplete') ||
                id.includes('/chips')
              ) {
                return 'mat-forms';
              }
              // Table and list components
              if (
                id.includes('/table') ||
                id.includes('/sort') ||
                id.includes('/paginator') ||
                id.includes('/list')
              ) {
                return 'mat-data';
              }
              // Navigation components
              if (
                id.includes('/toolbar') ||
                id.includes('/sidenav') ||
                id.includes('/menu') ||
                id.includes('/tabs')
              ) {
                return 'mat-nav';
              }
              // Button, card, icon - used everywhere
              if (
                id.includes('/button') ||
                id.includes('/card') ||
                id.includes('/icon') ||
                id.includes('/progress')
              ) {
                return 'mat-basic';
              }
              // Everything else in Material
              return 'mat-core';
            }
            // Angular forms, router, platform
            if (
              id.includes('@angular/forms') ||
              id.includes('@angular/router') ||
              id.includes('@angular/platform-browser')
            ) {
              return 'angular-platform';
            }
            // RxJS
            if (id.includes('rxjs')) {
              return 'rxjs';
            }
            // FontAwesome icons
            if (id.includes('@fortawesome')) {
              return 'icons';
            }
            // FullCalendar (large library)
            if (id.includes('@fullcalendar') || id.includes('fullcalendar')) {
              return 'calendar';
            }
            // Chart.js
            if (id.includes('chart.js') || id.includes('ng2-charts')) {
              return 'charts';
            }
          } }),
        },
      },
    },

    resolve: {
      mainFields: ['module'],
      alias: [
        // Handle @testing as the barrel export
        { find: /^@testing$/, replacement: resolve(__dirname, 'src/testing/index.ts') },
        // Handle @testing/subpath imports
        { find: /^@testing\/(.*)$/, replacement: resolve(__dirname, 'src/testing/$1') },
        // Swap environment file in dev mode (like Angular CLI fileReplacements)
        ...(isDev
          ? [{ find: /.*environments\/environment$/, replacement: resolve(__dirname, 'src/environments/environment.development.ts') }]
          : []),
      ],
    },

    plugins: [
      // Watch component SCSS/HTML files during build --watch mode
      watchComponentAssets(),
      // Use simple Angular plugin for dev (no SSR/Nitro overhead)
      // Use full Analog platform for production SSR builds
      isDev
        ? angular({
            inlineStylesExtension: 'scss',
          })
        : analog({
            ssr: true,
            ssrBuildDir: '../wwwroot/ssr',
            entryServer: 'src/main.server.ts',
            prerender: {
              routes: [], // Disable prerendering - .NET handles SSR at runtime
            },

            nitro: {
              routeRules: {
                // Proxy API requests to .NET backend
                '/api/**': {
                  proxy: 'https://localhost:1998/api/**',
                },
                // Proxy Scalar API docs
                '/scalar/**': {
                  proxy: 'https://localhost:1998/scalar/**',
                },
              },
              output: {
                dir: '../wwwroot/.output',
                publicDir: '../wwwroot/.output/public',
              },
              // Node server preset for production SSR
              preset: 'node-server',
            },

            vite: {
              inlineStylesExtension: 'scss',
            },
          }),
    ],

    // Environment variable handling
    define: {
      // Expose production flag
      'import.meta.env.PROD': JSON.stringify(!isDev),
      'import.meta.env.DEV': JSON.stringify(isDev),
    },

    // Suppress Sass deprecation warnings from Angular Material
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['if-function', 'global-builtin', 'import', 'color-functions'],
        },
      },
    },

    // Dev server configuration
    server: {
      port: Number(process.env['PORT']) || 2026,
      host: process.env['VITE_API_URL'] ? '0.0.0.0' : 'localhost', // Bind all interfaces in Docker
      open: false,
      https:
        process.env['VITE_HTTPS_CERT'] && process.env['VITE_HTTPS_KEY']
          ? {
              cert: readFileSync(process.env['VITE_HTTPS_CERT']),
              key: readFileSync(process.env['VITE_HTTPS_KEY']),
            }
          : undefined,
      // Proxy for dev server (Nitro handles this in SSR mode)
      proxy: {
        '/api': {
          target: apiTarget,
          secure: apiSecure,
          changeOrigin: true,
        },
        '/scalar': {
          target: apiTarget,
          secure: apiSecure,
          changeOrigin: true,
        },
        // SignalR hub for real-time notifications
        '/hubs': {
          target: apiTarget,
          secure: apiSecure,
          changeOrigin: true,
          ws: true, // Enable WebSocket proxying
        },
      },
    },

    // Preview server configuration
    preview: {
      port: 2026,
      host: 'localhost',
    },

    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['src/**/*.spec.ts'],
      reporters: ['default'],
      // Run tests sequentially for Angular TestBed isolation
      sequence: {
        hooks: 'stack',
      },
      // Suppress jsdom CSS parsing errors (modern CSS features not supported)
      onConsoleLog(log: string | unknown) {
        if (typeof log === 'string' && log.includes('Could not parse CSS stylesheet')) {
          return false; // Don't print this log
        }
        return true;
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: 'coverage',
        include: ['src/app/**/*.ts'],
        exclude: [
          'src/app/**/*.spec.ts',
          'src/app/**/*.d.ts',
          'src/testing/**/*',
          'src/**/*.config.ts',
          'src/**/*.routes.ts',
        ],
        thresholds: {
          statements: 75,
          branches: 60,
          functions: 75,
          lines: 75,
        },
      },
    },
  };
});

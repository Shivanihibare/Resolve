import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawBasePath = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/';
  const basePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`;

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'spa-github-pages-fallback',
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist');
          const indexHtml = path.join(distDir, 'index.html');
          if (!fs.existsSync(indexHtml)) return;

          // 1. Create 404.html for GitHub Pages fallback
          fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));

          // 2. Pre-generate subpath directory index.html files for direct navigation / refresh
          const directRoutes = [
            'customer/login',
            'customer/register',
            'agent/login',
            'customer',
            'customer/tickets',
            'customer/tickets/new',
            'agent',
            'agent/tickets',
            'agent/analytics',
            'documentation',
          ];

          for (const route of directRoutes) {
            const routeDir = path.join(distDir, route);
            fs.mkdirSync(routeDir, { recursive: true });
            fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

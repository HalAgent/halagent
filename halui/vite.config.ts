import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  server: {
    host: '0.0.0.0',
    proxy: {
        '/dev': {
          target: 'https://web3agent.site/dev',
          secure: false,
          ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/dev/, ''),
        },
        '/api': {
          target: 'https://web3agent.site/api',
          secure: false,
          ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
    },
  },
  base: './',
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
});

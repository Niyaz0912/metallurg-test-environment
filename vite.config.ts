import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { ProxyOptions } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const proxyConfig: ProxyOptions = {
  target: 'http://localhost:3001',
  changeOrigin: true,
  secure: false,
  rewrite: (path) => path.replace(/^\/api/, ''),
  ws: true,
  configure: (proxy) => {
    proxy.on('error', (err) => {
      console.log('Proxy error:', err instanceof Error ? err.message : String(err));
    });
    
    proxy.on('proxyReq', (_, req) => {
      console.log('Proxying request:', (req as { method?: string; url?: string }).method, 
                 (req as { method?: string; url?: string }).url);
    });
    
    proxy.on('proxyRes', (proxyRes, req) => {
      console.log('Proxied response:', 
                 (req as { method?: string; url?: string }).method, 
                 (req as { method?: string; url?: string }).url, 
                 '->', 
                 (proxyRes as { statusCode?: number }).statusCode);
    });
  }
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': proxyConfig
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});
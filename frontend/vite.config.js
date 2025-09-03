import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Загружаем env переменные based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  
  return {
    base: '/', // Added base URL
    plugins: [react()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src/app'),
        '@common': path.resolve(__dirname, './src/common'),
        '@data': path.resolve(__dirname, './src/data'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    
    // Для preview режима (npm run preview)
    preview: {
      port: 4173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    }
  };
});

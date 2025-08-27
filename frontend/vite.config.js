import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Загружаем env переменные based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.includes('localhost') 
            ? 'http://localhost:3001' 
            : 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
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
    }
  };
});
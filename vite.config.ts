import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,        // явно указываем нужный порт
    strictPort: true,  // если порт занят, то запуск не произойдет (ошибка)
    host: true,        // слушать и localhost и IP-машины (если нужно)
  },
});


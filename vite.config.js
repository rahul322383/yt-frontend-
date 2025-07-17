
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // ✅ Required for alias

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve( 'src'), // ✅ So @ means src/
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [tailwindcss(), react()],
});

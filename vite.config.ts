import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure the server runs on a known host and port for development
  server: {
    port: 3000,
    host: 'localhost',
  },
  // We can use the 'src' directory as the base for imports
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
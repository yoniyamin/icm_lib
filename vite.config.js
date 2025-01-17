import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Split vendor libraries
        },
      },
    },
  },
  chunkSizeWarningLimit: 1000, // Adjust size limit if needed
  base: "/icm_lib/",
  server: {
    port: 3000,
    open: true,
  },
});

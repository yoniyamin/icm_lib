import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/icm_lib/src",
  build: {
    sourcemap: true, // Disable source maps
  },
  server: {
    port: 3000,
    open: true,
  },
});

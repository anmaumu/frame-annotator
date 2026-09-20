import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // keep asset paths relative so the built output also works from file:// (Electron)
  plugins: [react()],
  server: { port: 5173 },
});

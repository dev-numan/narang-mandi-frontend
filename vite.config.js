import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Must match the backend `PORT` in server/.env (default 5010).
  const target = env.VITE_PROXY_TARGET || 'http://localhost:5010';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy API + uploaded images to the Express server during development
        '/api': { target, changeOrigin: true },
        '/uploads': { target, changeOrigin: true },
      },
    },
  };
});

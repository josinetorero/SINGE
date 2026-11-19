import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useMock = env.VITE_USE_MOCK === 'true';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: useMock
        ? undefined
        : {
            '/api': {
              target: env.VITE_BACKEND_URL || 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
              configure: (proxy) => {
                proxy.on('error', (err, req, res) => {
                  if (!res.headersSent) {
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    res.end(
                      JSON.stringify({
                        error: 'Backend offline',
                        message: 'O servidor Laravel não está a correr em http://localhost:8000',
                      })
                    );
                  }
                });
              },
            },
          },
    },
  };
});

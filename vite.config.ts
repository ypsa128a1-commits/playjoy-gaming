import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    
    export default defineConfig({
      plugins: [
        react(),
        // tailwindcss() sementara dinonaktifkan untuk bypass build error
      ],
      server: {
        host: '0.0.0.0',
        port: 5173,
      }
    });
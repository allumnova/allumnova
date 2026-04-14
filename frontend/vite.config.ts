import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        hmr: {
            clientPort: 3000,
        },
        proxy: {
            '/api': {
                target: 'https://allumnova.cloud',
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: 'https://allumnova.cloud',
                changeOrigin: true,
                secure: false
            }
        }
    },
});

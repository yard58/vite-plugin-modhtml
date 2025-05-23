import { defineConfig } from 'vite';
import modhtml from '../dist/index.js';
import { resolve } from 'path';


export default defineConfig({
    root: resolve(__dirname),
    build: {
        emptyOutDir: true
    },
    plugins: [
        modhtml()
    ],
    server: {
        host: '192.168.1.41',
        port: 5173,
        strictPort: true
    },
    clearScreen: true
});


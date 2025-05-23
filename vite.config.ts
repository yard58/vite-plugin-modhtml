import { defineConfig } from 'vite';
import modhtmlPlugin from './src/index';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: () => 'index.js',
        },
        target: 'node18',
        rollupOptions: {
            external: [
                'path',
                'fs',
                'parse5'
            ],
            output: {
            }
        }
    },
    plugins: [
        modhtmlPlugin(),
        dts()
    ]
});
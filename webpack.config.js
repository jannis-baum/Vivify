import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, 'build');

export default {
    mode: 'production',
    entry: {
        main: path.resolve(buildDir, 'dist', 'app.js'),
    },
    output: {
        path: buildDir,
        filename: 'bundle.js',
        chunkFormat: 'module',
    },
    externals: {
        'utf-8-validate': 'esm utf-8-validate',
        bufferutil: 'esm bufferutil',
    },
    target: 'node',
};

import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, 'build');

if (!('VIV_VERSION' in process.env)) {
    throw new Error('VIV_VERSION environment variable has to be set to build');
}
const version = process.env.VIV_VERSION;

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
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VERSION': JSON.stringify(version),
        }),
    ],
};

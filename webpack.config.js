const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        main: './src/app.ts',
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
            },
        ],
    },
    target: 'node',
    externals: {
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
    },
};

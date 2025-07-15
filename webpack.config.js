
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
require('dotenv').config({ path: `.env` });

module.exports = {
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
        }),
        new CopyPlugin({
            patterns: [
                { from: '*.html', to: '.', context: '.' },
                { from: 'static/css', to: 'css' },
            ],
        }),
    ],
    devtool: 'source-map',
};

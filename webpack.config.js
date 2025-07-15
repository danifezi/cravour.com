
const path = require('path');
const webpack = require('webpack');
require('dotenv').config({ path: `.env` });

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/index.tsx',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
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
            'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
        }),
    ],
    devtool: 'source-map',
};


// webpack.config.js
const path = require('path');
const webpack = require('webpack');
require('dotenv').config({ path: `.env` });

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    // Entry point is now at the root level.
    entry: './index.tsx',
    output: {
        filename: 'index.js',
        // Output path is the project's root directory.
        path: path.resolve(__dirname),
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
            // Ensure the API key is available in the build process
            'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
        }),
    ],
    devtool: 'source-map',
};

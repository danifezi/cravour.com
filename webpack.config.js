
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
        clean: true, // Clean the output directory before emit.
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
            // This is required for the @google/genai SDK to work correctly.
            // It safely provides the API key from your environment to the build process.
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
        }),
        new CopyPlugin({
            patterns: [
                // Copy all content from the 'public' folder directly into the 'dist' folder.
                // This includes HTML files and the CSS directory.
                { from: 'public', to: '.' },
            ],
        }),
    ],
    devtool: 'source-map',
};

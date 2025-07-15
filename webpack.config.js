
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
            // Fallback for process.env.API_KEY to avoid breaking the build
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
        }),
        new CopyPlugin({
            patterns: [
                // Copy all HTML files explicitly from the root to the dist folder
                { from: 'index.html', to: 'index.html' },
                { from: 'cravour-ads.html', to: 'cravour-ads.html' },
                { from: 'create_plan.html', to: 'create_plan.html' },
                { from: 'expense_report.html', to: 'expense_report.html' },
                { from: 'fund_wallet.html', to: 'fund_wallet.html' },
                { from: 'merchant_onboarding.html', to: 'merchant_onboarding.html' },
                { from: 'my_plans.html', to: 'my_plans.html' },
                
                // Copy the entire css directory from static to dist/css
                { from: 'static/css', to: 'css' },
            ],
        }),
    ],
    devtool: 'source-map',
};

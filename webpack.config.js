const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

// List of HTML pages to be generated from the public directory
const pages = [
    "index",
    "cravour-ads",
    "create_plan",
    "expense_report",
    "fund_wallet",
    "merchant_onboarding",
    "my_plans"
];

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        hot: true,
        open: true,
        port: 8080
    },
    plugins: [
        ...pages.map(page => {
            return new HtmlWebpackPlugin({
                template: `./public/${page}.html`, // Templates are in the public directory
                filename: `${page}.html`,
                chunks: ['main'] // Use the main chunk for all pages
            });
        }),
        // Use dotenv-webpack to load .env file for API_KEY
        new Dotenv(),
        // Fallback DefinePlugin if .env isn't used
        new webpack.DefinePlugin({
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
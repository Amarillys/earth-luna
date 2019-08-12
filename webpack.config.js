/* eslint-env node */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const env = process.env.NODE_ENV;

module.exports = {
    mode: "development",
    entry: "./index.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: env === "production" ? "none" : "inline-source-map",
    devServer: {
        contentBase: './dist',
        port: '8080',
        inline: true,
        hot: true
    },

    resolve: {
        extensions: ['.ts', '.js', '.json']
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader'
        }],
    },

    // Other options...
    plugins: [
        new BundleAnalyzerPlugin(),
        new copyWebpackPlugin([{
            from: `${__dirname}/public`,
            to: `./`
        }])
    ],
};

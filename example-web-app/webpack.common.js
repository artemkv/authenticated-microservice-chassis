const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        // Main page
        app: './src/index.js'
    },
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
        filename: './[name].[contenthash].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    optimization: {
        // Extract boilerplate code into runtime chunk
        runtimeChunk: 'single',
        // Put all third-party dependencies into the vendors chunk
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './public/index.html',
            chunks: ['runtime', 'vendors', 'app']
        }),
        new CopyPlugin({
            patterns: [
                {from: './public/favicon.ico'}
            ]
        })
    ],
    devtool: 'source-map',
    devServer: {
        historyApiFallback: true
    }
};

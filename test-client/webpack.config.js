// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

const path = require('path');

const PRODUCTION_MODE = 'production';
const DEVELOPMENT_MODE = 'development';
const NODE_ENV = process.env.NODE_ENV || DEVELOPMENT_MODE;

const Webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: './sources/scripts/index.js'
    },
    output: {
        path: path.resolve(__dirname, './build'),
        publicPath: './',
        filename: 'script.js'
    },
    mode: NODE_ENV,
    devtool: NODE_ENV === DEVELOPMENT_MODE ? 'eval' : null,
    watch: NODE_ENV === DEVELOPMENT_MODE,
    watchOptions: {
        aggregateTimeout: 100
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        css: 'vue-style-loader!css-loader!style-loader',
                        scss: 'vue-style-loader!css-loader!sass-loader',
                        sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /\/node_modules\//,
                include: [
                    path.resolve('scripts'),
                    path.resolve('node_modules/webpack-dev-server/client')
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    }
                }],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'vue-style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            }
        ],
    },
    plugins: [
        new Webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            PRODUCTION_MODE: JSON.stringify(PRODUCTION_MODE),
            DEVELOPMENT_MODE: JSON.stringify(DEVELOPMENT_MODE)
        }),
        new HtmlWebpackPlugin({
            title: 'deep-nest-rest',
            filename: 'index.html',
            template: './sources/resources/pages/index.html',
            inject: true
        }),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            {from: path.resolve(__dirname, './sources/resources/styles/style.css')}
        ])
    ],
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve('src'),
        }
    }
};
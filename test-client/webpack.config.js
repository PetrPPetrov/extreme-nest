const path = require('path');

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
    mode: 'development',
    watch: true,
    watchOptions: {
        aggregateTimeout: 100
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        css: 'vue-style-loader!css-loader!style-loader',
                        sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
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
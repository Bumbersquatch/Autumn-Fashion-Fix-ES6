const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    devtool: 'source-map',
    entry: ['./app/app.js', './app/scss/styles.scss'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: '/'
    },
    module: {
        rules: [
            { //JS
                test: /\.js$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            { //CSS
                test: /\.css$/,
                use: [ 
                    { 
                        loader: 'css-loader',
                        options: {sourceMap: isDev ? true : false}
                    }
                ]
            },
            { //SASS
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { 
                        loader: 'css-loader',
                        options: {sourceMap: isDev ? true : false}
                    }, 
                    {
                        loader: 'postcss-loader',
                        options: {
                            options: {sourceMap: isDev ? true : false},
                            plugins: function () {
                                return [
                                require('precss'),
                                require('autoprefixer')
                                ];
                            }
                        }
                    }, 
                    {
                        loader: 'sass-loader',
                        options: {sourceMap: isDev ? true : false}
                    }
                ],  
            },
            { //images & fonts
                test: /.(png|jpg|gif|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        outputPath: 'assets',
                      }
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Kinetic: 'kinetic',
            Handlebars: 'handlebars'
        }),
        new HtmlWebpackPlugin({
            template: './app/index.html'
        }),
        new CopyWebpackPlugin([
            {from:'./app/images',to:'images'} 
        ])
    ].concat(isDev ? [] : [
        new UglifyJsPlugin()
    ]),
    devServer: {
        contentBase: './app'
    }
};
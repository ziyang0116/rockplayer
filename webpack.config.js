/* eslint strict: 0 */
'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'electron-renderer',
    entry: [
        './src/renderer/index',
    ],
    output: {
        path: path.join(__dirname, 'dist/renderer'),
        publicPath: path.join(__dirname, 'src/renderer'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(ttf|eot|svg|woff(2))(\?[a-z0-9]+)?$/,
                loader: 'file',
            },
            {test: /\.css$/, use:['style-loader','css-loader']}
        ]
    }
};
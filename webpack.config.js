var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
     entry: {
        "/content/scripts/skye-widget": "./src/skye-widget.ts",
        "/content/scripts/skye-calc": "./src/skye-calc.ts",
        "/content/scripts/skye-landing": "./src/skye-landing.ts"
     },
     output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
     resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
     },
     module: {
        loaders: [
            { test: /\.css$/, loader: "style!css?url=false" },
            { test: /\.ts?$/, loader: 'ts-loader', sourceMap: false }
        ]
     },
     plugins: [
        new CopyWebpackPlugin([
            {
                from : './src/fonts/',
                to : './content/fonts'
            },
            {
                from : './src/html/',
                to : './content/html'
            },
            {
                from : './src/images/',
                to : './content/images'
            },
            {
                from : './src/js/',
                to : './content/js'
            },
            {
                from : './src/styles/',
                to : './content/styles'
            },
            {
                from : './src/images/',
                to : './content/images'
            }
        ]),
        new webpack.SourceMapDevToolPlugin({
            test: /\.js$/,
            filename: "[name].map.js"
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
            mangle: false,
            sourceMap: true
        }),
    ]
}

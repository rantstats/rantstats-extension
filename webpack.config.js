//webpack.config.js
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: false,
    entry: {
        content: "./src/content.ts",
        background: "./src/background.ts",
        options: "./src/pages/options/options.ts",
        rants: "./src/pages/rants/rants.ts"
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: "pages/[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/images',
                    to: 'images'
                },
                {
                    from: 'src/manifest.json'
                },
                {
                    from: 'src/pages/options/options.html',
                    to: 'pages/options'
                },
                {
                    from: 'src/pages/rants/rants.html',
                    to: 'pages/rants'
                }
            ]
        })
    ]
};

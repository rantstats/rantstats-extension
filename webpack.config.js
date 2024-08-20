//webpack.config.js
const webpack = require("webpack")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = (env, argv) => {
    return {
        mode: argv.mode,
        devtool: false,
        entry: {
            content: "./src/content.ts",
            background: "./src/background.ts",
            options: "./src/pages/options/options.ts",
            rants: "./src/pages/rants/rants.ts",
            about: "./src/pages/about/about.ts",
        },
        output: {
            path: path.resolve(__dirname, "./output"),
            filename: "pages/[name]/[name].js",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    loader: "ts-loader",
                },
                {
                    test: /\.txt?$/,
                    loader: "raw-loader",
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                DEBUG: argv.mode === "development",
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "src/images",
                        to: "images",
                    },
                    {
                        from: "src/manifest.json",
                    },
                    {
                        from: "src/pages/options/options.html",
                        to: "pages/options",
                    },
                    {
                        from: "src/pages/rants/rants.html",
                        to: "pages/rants",
                    },
                    {
                        from: "src/pages/about/about.html",
                        to: "pages/about",
                    },
                ],
            }),
        ],
    }
}

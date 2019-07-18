const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: ["babel-polyfill","./src/index.js"],
  output: {
    path: path.join(__dirname, "build"),
    filename: "./bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [path.resolve(__dirname, "node_modules")]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  externals:{
    "LOG_LEVEL": '"prod"'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        cache: false,
        parallel: true,
        uglifyOptions: {
          compress: true,
          ecma: 6,
          mangle: true,
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            dead_code: true,
            drop_console: true
          }
        },
        sourceMap: false
      })
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "**/*", context: "public/", ignore:"index.*" }]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: false,
      env:{
        rootPath: process.env.ROOT_PATH || ""
      }
    })
  ]
};

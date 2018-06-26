var webpack = require("webpack");
var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ["babel-polyfill","./src/index.js"],
  output: {
    path: path.join(__dirname, "build"),
    filename: "./bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [path.resolve(__dirname, "node_modules")]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  externals:{
    "LOG_LEVEL": '"prod"'
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

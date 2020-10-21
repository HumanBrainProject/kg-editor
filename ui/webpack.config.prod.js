/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: ["@babel/polyfill","./src/index.js"],
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
      new TerserPlugin({
        test: /\.js($|\?)/i,
        cache: false,
        parallel: true,
        terserOptions: {
          compress: true,
          ecma: 6,
          mangle: true,
          ie8: false,
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

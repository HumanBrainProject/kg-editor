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
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ["babel-polyfill","./src/index.js"],
  output: {
    path: __dirname,
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
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 3000,
    open: true,
    proxy: {
      "/editor/api/**": {
        target:"http://localhost:9000",
        secure:false,
        changeOrigin: true
      }
    },
    historyApiFallback: {
      disableDotRule: true
    }
  },
  externals:{
    "LOG_LEVEL": '"debug"'
  },
  plugins: [
    //new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: false,
      env:{
        rootPath: ""
      }
    })
  ]
};

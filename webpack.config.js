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
      "/api/**": {
        //target:"https://kg-dev.humanbrainproject.org/editor",
        target:"http://localhost:9000/editor",
        secure:false,
        changeOrigin: true
      },
      "/editor/api/**": {
        //target:"https://kg-dev.humanbrainproject.org",
        target:"http://localhost:9000/editor",
        secure:false,
        changeOrigin: true
      },
      "/statistics": {
        target:"https://kg-dev.humanbrainproject.org",
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

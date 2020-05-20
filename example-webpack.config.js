const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'js/example.min': './example/js/example.js',
  },
  output: {
    path: path.resolve(__dirname, './example'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'dist/'),
          path.join(__dirname, 'example/'),
        ],
        loader: 'babel-loader',
      },
    ]
  },
  plugins: [
    new UglifyJsPlugin(),
    new ProgressBarPlugin()
  ]
};

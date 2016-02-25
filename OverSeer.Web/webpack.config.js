const path = require('path');
const webpack = require('webpack');

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

//defining paths
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  entry: {
    app: PATHS.app
  },
  resolve: {
	  extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  devServer: {
      contentBase: PATHS.build,

      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      host: process.env.HOST,
      port: process.env.PORT
  },
  module: {
		loaders: [
		  {
			// Test expects a RegExp! Note the slashes!
			test: /\.css$/,
			loaders: ['style', 'css'],
			// Include accepts either a path or an array of paths.
			include: PATHS.app
		  },
		  {
			test: /\.jsx?$/,
			loaders: ['babel?cacheDirectory'],
			include: PATHS.app
		  }
		]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
 }

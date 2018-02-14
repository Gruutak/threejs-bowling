var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: './src/app.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'app.bundle.js'
	},
	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "eslint-loader",
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
			},
		],
	},
	stats: {
		colors: true
	},
	devtool: 'source-map'
};
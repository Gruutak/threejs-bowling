const path = require('path'),
	  webpack = require('webpack'),
	  CleanWebpackPlugin = require('clean-webpack-plugin'),
	  HtmlWebpackPlugin = require('html-webpack-plugin'),
	  ExtractTextPlugin = require('extract-text-webpack-plugin'),
	  CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	context: path.resolve(__dirname, "src"),
	entry: './app.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'app.bundle.js'
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			template: 'index.html',
			favicon: 'favicon.ico'
		}),
		new ExtractTextPlugin({
			filename: 'styles.css'
		}),
		new CopyWebpackPlugin([
			{ from: './models/*' },
			{ from: './textures/**/*' },
			{ from: './audio/*' }
		])
	],
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
				loader: "babel-loader",
				exclude: /node_modules/,
				options: {
					presets: ['env']
				}
			},
			{
				test: /\.html$/,
				use: ['html-loader']
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					],
					fallback: 'style-loader'
				})
			},
			{
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            }
		],
	},
	stats: {
		colors: true
	},
	devtool: 'source-map',
	devServer: {
		stats: 'errors-only',
	}
};

/**
 * @license Copyright (c) 2003-2025, Xerte / Apereo contributors.
 * Webpack build for CKEditor 5 (GPL-2.0+ via CKEditor packages — see LICENSE-NOTICE.txt next to output bundle).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { loaders } from '@ckeditor/ckeditor5-dev-utils';
import { CKEditorTranslationsPlugin } from '@ckeditor/ckeditor5-dev-translations';
import TerserWebpackPlugin from 'terser-webpack-plugin';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

export default {
	context: __dirname,
	mode: 'production',
	entry: './src/xerte-editor.js',
	output: {
		path: path.resolve( __dirname, '../js/vendor/ckeditor5' ),
		filename: 'xerte-editor.bundle.js',
		library: {
			name: 'XerteCKEditor5',
			type: 'umd',
			export: 'default'
		}
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserWebpackPlugin( {
				terserOptions: {
					format: { comments: /^!/ }
				},
				extractComments: false
			} )
		]
	},
	plugins: [
		new CKEditorTranslationsPlugin( {
			language: 'en',
			additionalLanguages: [ 'cs', 'de', 'el', 'es', 'fr', 'it', 'ja', 'nb', 'nl', 'pl', 'pt', 'ru', 'tr', 'uk' ],
			outputDirectory: 'translations',
			includeCorePackageTranslations: true
		} )
	],
	module: {
		rules: [
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'node_modules', '@ckeditor' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'node_modules', 'ckeditor5' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'src' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.svg$/,
				type: 'asset/source'
			},
			{
				...loaders.getStylesLoader( {
					minify: true
				} )
			}
		]
	},
	performance: { hints: false },
	devtool: false
};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { styleText } from 'node:util';
import serveTranslations from './servetranslations.js';
import MultipleLanguageTranslationService from './multiplelanguagetranslationservice.js';

/**
 * CKEditorTranslationsPlugin, for now, consists only of the translation mechanism (@ckeditor/ckeditor5#624, @ckeditor/ckeditor5#387,
 * @ckeditor/ckeditor5#6526).
 *
 * The main language specified in `language` option will be statically added to the bundle. Translations for all languages from
 * the `additionalLanguages` option (if set) will be saved separately in the directory specified by the `outputDirectory` option
 * (which defaults to `lang`).
 *
 * If the `allowMultipleJSOutputs` is unset (or set to `false`) and when multiple outputs are defined, then translations for all languages
 * (from both `language` and `additionalLanguages` options) will be saved separately.
 * In that situation user will be warned that he needs to load at least one translation file manually to get editor working.
 *
 * If the `allowMultipleJSOutputs` is set to `true` and when multiple JS outputs are defined, then translations for the main language
 * will be added to all JS outputs and other translations will be saved separately.
 *
 * Translation files will be emitted in the `outputDirectory` or `'lang'` directory if `outputDirectory` is not set.
 *
 * This plugin tries to clean the output translation directory before each build to make sure, that all translations are correct.
 * See https://github.com/ckeditor/ckeditor5/issues/700 for more information.
 */
export default class CKEditorTranslationsPlugin {
	/**
	 * @param {CKEditorTranslationsPluginOptions} options Plugin options.
	 */
	constructor( options ) {
		if ( !options ) {
			throw new Error( 'The `CKEditorTranslationsPlugin` plugin requires an object.' );
		}

		this.options = {
			language: options.language,
			additionalLanguages: options.additionalLanguages,
			outputDirectory: options.outputDirectory || 'translations',
			strict: !!options.strict,
			verbose: !!options.verbose,
			addMainLanguageTranslationsToAllAssets: !!options.addMainLanguageTranslationsToAllAssets,
			buildAllTranslationsToSeparateFiles: !!options.buildAllTranslationsToSeparateFiles,
			sourceFilesPattern: options.sourceFilesPattern || /[/\\]ckeditor5-[^/\\]+[/\\]src[/\\].+\.[jt]s$/,
			packageNamesPattern: options.packageNamesPattern || /[/\\]ckeditor5-[^/\\]+[/\\]/,
			corePackagePattern: options.corePackagePattern || /[/\\]ckeditor5-core/,
			corePackageSampleResourcePath: options.corePackageSampleResourcePath || '@ckeditor/ckeditor5-core/src/editor/editor',
			corePackageContextsResourcePath: options.corePackageContextsResourcePath || '@ckeditor/ckeditor5-core/lang/contexts.json',
			translationsOutputFile: options.translationsOutputFile,
			includeCorePackageTranslations: !!options.includeCorePackageTranslations,
			skipPluralFormFunction: !!options.skipPluralFormFunction,
			assetNamesFilter: options.assetNamesFilter || ( name => name.endsWith( '.js' ) )
		};
	}

	apply( compiler ) {
		if ( !this.options.language ) {
			console.warn( styleText(
				'yellow',
				'The `language` option is required by the `CKEditorTranslationsPlugin` plugin.' +
				'If you do not want to localize the CKEditor 5 code do not add this plugin to your webpack configuration.'
			) );

			return;
		}

		const {
			addMainLanguageTranslationsToAllAssets,
			buildAllTranslationsToSeparateFiles,
			language: mainLanguage
		} = this.options;

		let compileAllLanguages = false;
		let additionalLanguages = this.options.additionalLanguages || [];

		if ( typeof additionalLanguages == 'string' ) {
			if ( additionalLanguages !== 'all' ) {
				throw new Error( 'Error: The `additionalLanguages` option should be an array of language codes or `all`.' );
			}

			compileAllLanguages = true;
			additionalLanguages = []; // They will be searched in runtime.
		}

		// Currently, there is only one strategy to build translation files.
		// Though, bear in mind that there might be a need for a different build strategy in the future,
		// hence the translation service is separated from the webpack-specific environment.
		// See the TranslationService interface in the `servetranslation.js` file.
		const translationService = new MultipleLanguageTranslationService( {
			mainLanguage,
			compileAllLanguages,
			additionalLanguages,
			addMainLanguageTranslationsToAllAssets,
			buildAllTranslationsToSeparateFiles,
			translationsOutputFile: this.options.translationsOutputFile,
			skipPluralFormFunction: this.options.skipPluralFormFunction
		} );

		serveTranslations( compiler, this.options, translationService );
	}
}

/**
 * @callback AssetNamesFilter
 * @param {string} name Webpack asset name/path
 * @returns {boolean}
 */

/**
 * @typedef {object} CKEditorTranslationsPluginOptions CKEditorTranslationsPluginOptions options.
 *
 * @property {string} language The main language for internationalization - translations for that language
 * will be added to the bundle(s).
 * @property {Array.<string>|'all'} [additionalLanguages] Additional languages. Build is optimized when this option is not set.
 * When `additionalLanguages` is set to 'all' then script will be looking for all languages and according translations during
 * the compilation.
 * @property {string} [outputDirectory='translations'] The output directory for the emitted translation files,
 * should be relative to the webpack context.
 * @property {boolean} [strict] An option that make the plugin throw when the error is found during the compilation.
 * @property {boolean} [verbose] An option that make this plugin log all warnings into the console.
 * @property {boolean} [addMainLanguageTranslationsToAllAssets] An option that allows outputting translations to more than one
 * JS asset.
 * @property {string} [corePackageSampleResourcePath] A path (ES6 import) to the file that determines whether the `ckeditor5-core` package
 * exists. The package contains common translations used by many packages. To avoid duplications, they are shared by the core package.
 * @property {string} [corePackageContextsResourcePath] A path (ES6 import) to the file where all contexts are specified
 * for the `ckeditor5-core` package.
 * @property {boolean} [buildAllTranslationsToSeparateFiles] An option that makes all translations output to separate files.
 * @property {string} [sourceFilesPattern] An option that allows override the default pattern for CKEditor 5 source files.
 * @property {string} [packageNamesPattern] An option that allows override the default pattern for CKEditor 5 package names.
 * @property {string} [corePackagePattern] An option that allows override the default CKEditor 5 core package pattern.
 * @property {string|Function|RegExp} [translationsOutputFile] An option allowing outputting all translation file to the given file.
 * If a file specified by a path (string) does not exist, then it will be created. Otherwise, translations will be outputted to the file.
 * @property {boolean} [includeCorePackageTranslations=false] A flag that determines whether all translations found in the core package
 * should be added to the output bundle file. If set to true, translations from the core package will be saved even if are not
 * used in the source code (*.js files).
 * @property {boolean} [skipPluralFormFunction=false] Whether the `getPluralForm()` function should be added in the output bundle file.
 * @property {AssetNamesFilter} [assetNamesFilter] A function to filter assets probably importing CKEditor 5 modules.
 */

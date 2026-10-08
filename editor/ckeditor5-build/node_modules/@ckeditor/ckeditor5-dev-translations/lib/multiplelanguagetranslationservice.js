/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import path from 'node:path';
import fs from 'node:fs';
import findMessages from './findmessages.js';
import { EventEmitter } from 'node:events';
import PO from 'pofile';

/**
 * A service that serves translations assets based on the found PO files in the registered packages.
 */
export default class MultipleLanguageTranslationService extends EventEmitter {
	// TODO maybe fix the jsdoc types
	/**
	 * @param {object} options
	 * @param {string} options.mainLanguage The target language that will be bundled into the main webpack asset.
	 * @param {Array.<string>} [options.additionalLanguages] Additional languages which files will be emitted.
	 * When option is set to 'all', all languages found during the compilation will be added.
	 * @param {boolean} [options.compileAllLanguages] When set to `true` languages will be found at runtime.
	 * @param {boolean} [options.addMainLanguageTranslationsToAllAssets] When set to `true` the service will not complain
	 * about multiple JS assets and will output translations for the main language to all found assets.
	 * @param {boolean} [options.buildAllTranslationsToSeparateFiles] When set to `true` the service will output all translations
	 * to separate files.
	 * @param {string|Function|RegExp} [options.translationsOutputFile] An option allowing outputting all translation file
	 * to the given file. If a file specified by a path (string) does not exist, then it will be created. Otherwise, translations
	 * will be outputted to the file.
	 */
	constructor( {
		mainLanguage,
		additionalLanguages = [],
		compileAllLanguages = false,
		addMainLanguageTranslationsToAllAssets = false,
		buildAllTranslationsToSeparateFiles = false,
		translationsOutputFile,
		skipPluralFormFunction
	} ) {
		super();

		/**
		 * Main language that should be built in to the bundle.
		 *
		 * @private
		 * @type {string}
		 */
		this._mainLanguage = mainLanguage;

		/**
		 * A set of languages that will be used by translator. This set may be expanded by found languages
		 * if the `compileAllLanguages` flag is turned on.
		 *
		 * @private
		 * @type {Set.<string>}
		 */
		this._languages = new Set( [ mainLanguage, ...additionalLanguages ] );

		/**
		 * An option indicating if the languages should be found at runtime.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._compileAllLanguages = compileAllLanguages;

		/**
		 * A boolean option. When set to `true` this service won't complain about multiple JS assets
		 * and will add translation for the main language to all of them. Useful option for manual tests, etc.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._addMainLanguageTranslationsToAllAssets = addMainLanguageTranslationsToAllAssets;

		/**
		 * A boolean option. When set to `true` outputs all translations to separate files.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._buildAllTranslationsToSeparateFiles = buildAllTranslationsToSeparateFiles;

		/**
		 * A set of handled packages that speeds up the translation process.
		 *
		 * @private
		 * @type {Set.<string>}
		 */
		this._handledPackages = new Set();

		/**
		 * A map of translation dictionaries in the `language -> messageId -> single & plural forms` format.
		 *
		 * @private
		 * @type {Object.<string, Object.<String,Array.<string>>>}
		 */
		this._translationDictionaries = {};

		/**
		 * Plural form rules that will be added to generated translation assets.
		 *
		 * @private
		 * @type {Object.<string, String>}
		 */
		this._pluralFormsRules = {};

		/**
		 * A set of message ids that are found in parsed JS files. For each message id a translation
		 * (with a single and possible plural forms) should be found for the target languages.
		 *
		 * @private
		 * @type {Set.<string>}
		 */
		this._foundMessageIds = new Set();

		/**
		 * Whether the `getPluralForm` function should be added in the bundle file.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._skipPluralFormFunction = skipPluralFormFunction;

		this._translationsOutputFile = translationsOutputFile;
	}

	/**
	 * Collects found message ids. Emits a warning when there is a suspicion that the message is created incorrectly
	 * (e.g. an incorrect `t()` call).
	 *
	 * @fires warning
	 * @param {string} source Content of the source file.
	 * @param {string} fileName Source file name
	 * @returns {string}
	 */
	translateSource( source, fileName ) {
		findMessages(
			source,
			fileName,
			message => this.addIdMessage( message.id ),
			error => this.emit( 'warning', error )
		);

		return source;
	}

	/**
	 * Loads PO files from the package if the package was not registered already.
	 * If the `compileAllLanguages` flag is set to `true`, then the language set will be expanded to all found languages.
	 *
	 * @fires warning
	 * @param {string} pathToPackage A path to the package containing translations.
	 */
	loadPackage( pathToPackage ) {
		if ( this._handledPackages.has( pathToPackage ) ) {
			return;
		}

		this._handledPackages.add( pathToPackage );

		const pathToTranslationDirectory = this._getPathToTranslationDirectory( pathToPackage );

		if ( !fs.existsSync( pathToTranslationDirectory ) ) {
			return;
		}

		if ( this._compileAllLanguages ) {
			for ( const fileName of fs.readdirSync( pathToTranslationDirectory ) ) {
				if ( !fileName.endsWith( '.po' ) ) {
					this.emit(
						'error',
						`Translation directory (${ pathToTranslationDirectory }) should contain only translation files.`
					);

					continue;
				}

				const language = fileName.replace( /\.po$/, '' );
				const pathToPoFile = path.join( pathToTranslationDirectory, fileName );

				this._languages.add( language );
				this._loadPoFile( language, pathToPoFile );
			}

			return;
		}

		for ( const language of this._languages ) {
			const pathToPoFile = path.join( pathToTranslationDirectory, language + '.po' );

			this._loadPoFile( language, pathToPoFile );
		}
	}

	/**
	 * Returns an array of partial assets containing translations in the executable JS form.
	 *
	 * @fires warning
	 * @fires error
	 * @param {object} options
	 * @param {string} options.outputDirectory Output directory for the translation files relative to the output.
	 * @param {Array.<string>} options.compilationAssetNames Original asset names from the compiler (e.g. Webpack).
	 * @returns {Array.<object>} Returns new and modified assets that will be added to original ones.
	 */
	getAssets( { outputDirectory, compilationAssetNames } ) {
		let bundledLanguage = this._mainLanguage;

		if ( compilationAssetNames.length === 0 ) {
			return [];
		}

		if ( this._translationsOutputFile ) {
			return this._getAssetsWithTranslationsBundledToTheOutputFile( { outputDirectory, compilationAssetNames } );
		}

		if ( this._buildAllTranslationsToSeparateFiles ) {
			bundledLanguage = null;
			compilationAssetNames = [];
		} else if ( compilationAssetNames.length > 1 && !this._addMainLanguageTranslationsToAllAssets ) {
			this.emit( 'error', [
				'Too many JS assets has been found during the compilation. ' +
				'You should use one of the following options to specify the strategy:\n' +
				'- use `addMainLanguageTranslationsToAllAssets` to add translations for the main language to all assets,' +
				'- use `buildAllTranslationsToSeparateFiles` to add translation files via `<script>` tags in HTML file,' +
				'- use `translationsOutputFile` to append translation to the existing file or create a new asset.' +
				'For more details visit https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-translations.'
			].join( '\n' ) );

			compilationAssetNames = [];
			bundledLanguage = null;
		}

		const assetLanguages = Array.from( this._languages )
			.filter( lang => lang !== bundledLanguage );

		return [
			// Assets where translations for the main language will be added.
			...compilationAssetNames.map( assetName => ( {
				outputBody: this._getTranslationAssets( outputDirectory, [ this._mainLanguage ] )[ 0 ].outputBody,
				outputPath: assetName,
				shouldConcat: true
			} ) ),

			// Translation assets outputted to separate translation files.
			...this._getTranslationAssets( outputDirectory, assetLanguages )
		];
	}

	/**
	 * Adds the specified `id` to the collection which will be translated to the specified language.
	 *
	 * @param {string} id
	 */
	addIdMessage( id ) {
		this._foundMessageIds.add( id );
	}

	/**
	 * @param {object} options
	 * @param {string} options.outputDirectory Output directory for the translation files relative to the output.
	 * @param {Array.<string>} options.compilationAssetNames Original asset names from the compiler (e.g. Webpack).
	 * @returns {Array.<object>} Returns an array with one asset that
	 */
	_getAssetsWithTranslationsBundledToTheOutputFile( { outputDirectory, compilationAssetNames } ) {
		const assetName = match( this._translationsOutputFile, compilationAssetNames );

		if ( !assetName && typeof this._translationsOutputFile !== 'string' ) {
			throw new Error( 'No file was matching the `translationsOutputFile` option.' );
		}

		const translationsBundle = this._getTranslationAssets( outputDirectory, Array.from( this._languages ) )
			.map( asset => asset.outputBody )
			.join( '' );

		return [ {
			outputBody: translationsBundle,
			outputPath: assetName || this._translationsOutputFile,
			// Concat with an existing asset if it exists.
			shouldConcat: compilationAssetNames.some( name => name === assetName )
		} ];
	}

	/**
	 * Returns assets for the given directory and languages.
	 *
	 * @private
	 * @param {string} outputDirectory The output directory for assets.
	 * @param {Array.<string>} languages Languages for assets.
	 */
	_getTranslationAssets( outputDirectory, languages ) {
		// Sort the array of message ids to provide deterministic results.
		const sortedMessageIds = Array.from( this._foundMessageIds ).sort( ( a, b ) => a.localeCompare( b ) );

		return languages.map( language => {
			const outputPath = path.join( outputDirectory, `${ language }.js` );

			if ( !this._translationDictionaries[ language ] ) {
				this.emit( 'error', `No translation has been found for the ${ language } language.` );

				return { outputBody: '', outputPath };
			}

			const translations = this._getTranslations( language, sortedMessageIds );

			// Examples of plural forms:
			// pluralForms="nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2)"
			// pluralForms="nplurals=3; plural=n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2"

			/** @type {string} */
			const pluralFormsRule = this._pluralFormsRules[ language ];

			let pluralFormFunction;

			// Do not add the `getPluralForm()` function if an integrator disabled it.
			if ( !this._skipPluralFormFunction ) {
				if ( !pluralFormsRule ) {
					// This could be improved in the future by using a 3-rd party library for plural forms.
					this.emit( 'warning', `The plural form function for the '${ language }' language has not been set.` );
				} else {
					const pluralFormFunctionBodyMatch = pluralFormsRule.match( /(?:plural=)(.+)/ );

					// Add support for ES5 - this function will not be transpiled.
					pluralFormFunction = `function(n){return ${ pluralFormFunctionBodyMatch[ 1 ] };}`;
				}
			}

			// Stringify translations and remove unnecessary `""` around property names.
			const stringifiedTranslations = JSON.stringify( translations )
				.replace( /"([\w_]+)":/g, '$1:' );

			const outputBody = (
				'(function(d){' +
				`	const l = d['${ language }'] = d['${ language }'] || {};` +
				'	l.dictionary=Object.assign(' +
				'		l.dictionary||{},' +
				`		${ stringifiedTranslations }` +
				'	);' +
				( pluralFormFunction ? `l.getPluralForm=${ pluralFormFunction };` : '' ) +
				'})(window.CKEDITOR_TRANSLATIONS||(window.CKEDITOR_TRANSLATIONS={}));'
			);

			return { outputBody, outputPath };
		} );
	}

	/**
	 * Walks through the set of found message ids and collects corresponding strings in the target language dictionary.
	 * Skips messages that lacks their translations.
	 *
	 * @private
	 * @param {string} language The target language
	 * @param {Array.<string>} sortedMessageIds An array of sorted message ids.
	 * @returns {Object.<String,String|string[]>}
	 */
	_getTranslations( language, sortedMessageIds ) {
		const langDictionary = this._translationDictionaries[ language ];
		const translatedStrings = {};

		for ( const messageId of sortedMessageIds ) {
			const translatedMessage = langDictionary[ messageId ];

			if ( !translatedMessage || translatedMessage.length === 0 ) {
				this.emit( 'warning', `A translation is missing for '${ messageId }' in the '${ language }' language.` );

				continue;
			}

			// Register first form as a default form if only one form was provided.
			translatedStrings[ messageId ] = translatedMessage.length > 1 ?
				translatedMessage :
				translatedMessage[ 0 ];
		}

		return translatedStrings;
	}

	/**
	 * Loads translations from the PO file if that file exists.
	 *
	 * @private
	 * @param {string} language PO file's language.
	 * @param {string} pathToPoFile Path to the target PO file.
	 */
	_loadPoFile( language, pathToPoFile ) {
		if ( !fs.existsSync( pathToPoFile ) ) {
			return;
		}

		const parsedTranslationFile = PO.parse( fs.readFileSync( pathToPoFile, 'utf-8' ) );

		this._pluralFormsRules[ language ] = this._pluralFormsRules[ language ] || parsedTranslationFile.headers[ 'Plural-Forms' ];

		if ( !this._translationDictionaries[ language ] ) {
			this._translationDictionaries[ language ] = {};
		}

		const dictionary = this._translationDictionaries[ language ];

		for ( const item of parsedTranslationFile.items ) {
			dictionary[ item.msgid ] = item.msgstr;
		}
	}

	/**
	 * Returns a path to the translation directory depending on the path to the package.
	 *
	 * @protected
	 * @param {string|null} relativePathToPackage
	 * @returns {string}
	 */
	_getPathToTranslationDirectory( relativePathToPackage ) {
		// If the `relativePathToPackage` is not specified, translations for a single package are processed.
		if ( relativePathToPackage ) {
			return path.join( relativePathToPackage, 'lang', 'translations' );
		}

		return path.join( 'lang', 'translations' );
	}
}

/**
 * @param {string|Function|RegExp} predicate
 * @param {Array.<string>} options
 * @returns {string|undefined}
 */
function match( predicate, options ) {
	if ( typeof predicate === 'function' ) {
		return options.find( predicate );
	}

	if ( typeof predicate === 'string' ) {
		return options.find( option => predicate === option );
	}

	if ( predicate instanceof RegExp ) {
		return options.find( option => predicate.test( option ) );
	}

	throw new Error(
		'The CKEditorTranslationsPlugin matching function got an unsupported type of a predicate.' +
		`Got '${ predicate }' (${ typeof predicate } ) where supported values are only 'string', 'regexp' and 'function'.`
	);
}

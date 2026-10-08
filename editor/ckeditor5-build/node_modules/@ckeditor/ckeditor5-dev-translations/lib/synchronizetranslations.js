/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import upath from 'upath';
import { logger } from '@ckeditor/ckeditor5-dev-utils';
import getPackageContexts from './utils/getpackagecontexts.js';
import { CONTEXT_FILE_PATH } from './utils/constants.js';
import getSourceMessages from './utils/getsourcemessages.js';
import synchronizeTranslationsBasedOnContext from './utils/synchronizetranslationsbasedoncontext.js';

/**
 * Synchronizes translations in provided packages by performing the following steps:
 * * Collect all i18n messages from all provided packages by finding `t()` calls in source files.
 * * Detect if translation context is valid, i.e. whether there is no missing, unused or duplicated context.
 * * If there are no validation errors, update all translation files ("*.po" files) to be in sync with the context file:
 *   * unused translation entries are removed,
 *   * missing translation entries are added with empty string as the message translation,
 *   * missing translation files are created for languages that do not have own "*.po" file yet.
 *
 * @param {SynchronizeTranslationsOptions} options
 */
export default function synchronizeTranslations( options ) {
	const {
		sourceFiles,
		packagePaths,
		corePackagePath,
		ignoreUnusedCorePackageContexts,
		validateOnly,
		skipLicenseHeader
	} = normalizeOptions( options );

	const errors = [];
	const log = logger();

	log.info( '📍 Loading translations contexts...' );
	const packageContexts = getPackageContexts( { packagePaths, corePackagePath } );

	log.info( '📍 Loading messages from source files...' );
	const sourceMessages = getSourceMessages( { packagePaths, sourceFiles, onErrorCallback: error => errors.push( error ) } );

	log.info( '📍 Validating translations contexts against the source messages...' );
	errors.push(
		...assertNoMissingContext( { packageContexts, sourceMessages, corePackagePath } ),
		...assertAllContextUsed( { packageContexts, sourceMessages, corePackagePath, ignoreUnusedCorePackageContexts } ),
		...assertNoRepeatedContext( { packageContexts } )
	);

	if ( errors.length ) {
		log.error( '🔥 The following errors have been found:' );

		for ( const error of errors ) {
			log.error( `   - ${ error }` );
		}

		process.exit( 1 );
	}

	if ( validateOnly ) {
		log.info( '✨ No errors found.' );

		return;
	}

	log.info( '📍 Synchronizing translations files...' );
	synchronizeTranslationsBasedOnContext( { packageContexts, sourceMessages, skipLicenseHeader } );

	log.info( '✨ Done.' );
}

/**
 * @param {object} options
 * @param {Array.<TranslationsContext>} options.packageContexts An array of language contexts.
 * @param {Array.<TranslatableEntry>} options.sourceMessages An array of i18n source messages.
 * @param {string} options.corePackagePath A path to the `@ckeditor/ckeditor5-core` package.
 * @returns {Array.<string>}
 */
function assertNoMissingContext( { packageContexts, sourceMessages, corePackagePath } ) {
	const contextMessageIdsGroupedByPackage = packageContexts.reduce( ( result, context ) => {
		result[ context.packagePath ] = Object.keys( context.contextContent );

		return result;
	}, {} );

	return sourceMessages
		.filter( message => {
			const contextMessageIds = [
				...contextMessageIdsGroupedByPackage[ message.packagePath ],
				...contextMessageIdsGroupedByPackage[ corePackagePath ]
			];

			return !contextMessageIds.includes( message.id );
		} )
		.map( message => `Missing context "${ message.id }" in "${ message.filePath }".` );
}

/**
 * @param {object} options
 * @param {Array.<TranslationsContext>} options.packageContexts An array of language contexts.
 * @param {Array.<TranslatableEntry>} options.sourceMessages An array of i18n source messages.
 * @param {string} options.corePackagePath A path to the `@ckeditor/ckeditor5-core` package.
 * @param {boolean} options.ignoreUnusedCorePackageContexts Whether to skip unused context errors related to the `@ckeditor/ckeditor5-core`
 * package.
 * @returns {Array.<string>}
 */
function assertAllContextUsed( { packageContexts, sourceMessages, corePackagePath, ignoreUnusedCorePackageContexts } ) {
	const sourceMessageIds = sourceMessages.map( message => message.id );

	const sourceMessageIdsGroupedByPackage = sourceMessages.reduce( ( result, message ) => {
		result[ message.packagePath ] = result[ message.packagePath ] || [];
		result[ message.packagePath ].push( message.id );

		return result;
	}, {} );

	return packageContexts
		.flatMap( context => {
			const { packagePath, contextContent } = context;
			const messageIds = Object.keys( contextContent );

			return messageIds.map( messageId => ( { messageId, packagePath } ) );
		} )
		.filter( ( { messageId, packagePath } ) => {
			if ( packagePath === corePackagePath ) {
				return !sourceMessageIds.includes( messageId );
			}

			if ( !sourceMessageIdsGroupedByPackage[ packagePath ] ) {
				return true;
			}

			return !sourceMessageIdsGroupedByPackage[ packagePath ].includes( messageId );
		} )
		.filter( ( { packagePath } ) => {
			if ( ignoreUnusedCorePackageContexts && packagePath === corePackagePath ) {
				return false;
			}

			return true;
		} )
		.map( ( { messageId, packagePath } ) => `Unused context "${ messageId }" in "${ upath.join( packagePath, CONTEXT_FILE_PATH ) }".` );
}

/**
 * @param {object} options
 * @param {Array.<TranslationsContext>} options.packageContexts An array of language contexts.
 * @returns {Array.<string>}
 */
function assertNoRepeatedContext( { packageContexts } ) {
	const contextMessageIds = packageContexts
		.flatMap( context => {
			const { contextFilePath, contextContent } = context;
			const messageIds = Object.keys( contextContent );

			return messageIds.map( messageId => ( { messageId, contextFilePath } ) );
		} )
		.reduce( ( result, { messageId, contextFilePath } ) => {
			result[ messageId ] = result[ messageId ] || [];
			result[ messageId ].push( contextFilePath );

			return result;
		}, {} );

	return Object.entries( contextMessageIds )
		.filter( ( [ , contextFilePaths ] ) => contextFilePaths.length > 1 )
		.map( ( [ messageId, contextFilePaths ] ) => {
			return `Duplicated context "${ messageId }" in "${ contextFilePaths.join( '", "' ) }".`;
		} );
}

/**
 * @param {SynchronizeTranslationsOptions} options
 */
function normalizeOptions( options ) {
	const {
		sourceFiles,
		packagePaths,
		corePackagePath,
		ignoreUnusedCorePackageContexts = false,
		validateOnly = false,
		skipLicenseHeader = false
	} = options;

	const cwd = options.cwd || process.cwd();
	const toAbsolute = path => upath.resolve( cwd, path );

	return {
		sourceFiles: sourceFiles.map( toAbsolute ),
		packagePaths: packagePaths.map( toAbsolute ),
		corePackagePath: toAbsolute( corePackagePath ),
		ignoreUnusedCorePackageContexts,
		validateOnly,
		skipLicenseHeader
	};
}

/**
 * @typedef {object} SynchronizeTranslationsOptions
 *
 * @property {Array.<string>} sourceFiles An array of source files that contain messages to translate.
 * Path can be relative or absolute. Relative path is resolved using `options.cwd` (or `process.cwd()` if not set).
 * @property {Array.<string>} packagePaths An array of paths to packages, which will be used to find message contexts.
 * Path can be relative or absolute. Relative path is resolved using `options.cwd` (or `process.cwd()` if not set).
 * @property {string} corePackagePath A path to the `@ckeditor/ckeditor5-core` package.
 * Path can be relative or absolute. Relative path is resolved using `options.cwd` (or `process.cwd()` if not set).
 * @property {string} [cwd=process.cwd()] Current working directory used to resolve paths to packages and source files.
 * @property {boolean} [ignoreUnusedCorePackageContexts=false] Whether to skip unused context errors related to the
 * `@ckeditor/ckeditor5-core` package.
 * @property {boolean} [validateOnly=false] If set, only validates the translations contexts against the source messages without
 * synchronizing the translations.
 * @property {boolean} [skipLicenseHeader=false] Whether to skip adding the license header to newly created translation files.
 */

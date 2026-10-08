/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import fs from 'node:fs';
import upath from 'upath';
import PO from 'pofile';
import { glob } from 'glob';
import { TRANSLATION_FILES_PATH } from './constants.js';
import cleanTranslationFileContent from './cleantranslationfilecontent.js';

/**
 * @param {object} options
 * @param {Array.<TranslationsContext>} options.packageContexts An array of language contexts.
 * @param {Array.<TranslationMoveEntry>} options.config Configuration that defines the messages to move.
 */
export default function moveTranslationsBetweenPackages( { packageContexts, config } ) {
	// For each message to move:
	for ( const { source, destination, messageId } of config ) {
		// (1) Skip the message if its source and destination package is the same.
		if ( source === destination ) {
			continue;
		}

		// (2) Move translation context from source package to destination package.
		const sourcePackageContext = packageContexts.find( context => context.packagePath === source );
		const destinationPackageContext = packageContexts.find( context => context.packagePath === destination );

		destinationPackageContext.contextContent[ messageId ] = sourcePackageContext.contextContent[ messageId ];
		delete sourcePackageContext.contextContent[ messageId ];

		// (3) Prepare the list of paths to translation files ("*.po" files) in source and destination packages.
		// The source package defines the list of files for both packages.
		const translationFilesPattern = upath.join( source, TRANSLATION_FILES_PATH, '*.po' );
		const translationFilePaths = glob.sync( translationFilesPattern )
			.map( filePath => upath.basename( filePath ) )
			.map( fileName => ( {
				sourceTranslationFilePath: upath.join( source, TRANSLATION_FILES_PATH, fileName ),
				destinationTranslationFilePath: upath.join( destination, TRANSLATION_FILES_PATH, fileName )
			} ) );

		// Then, for each translation file:
		for ( const { sourceTranslationFilePath, destinationTranslationFilePath } of translationFilePaths ) {
			// (3.1) Read the source translation file.
			const sourceTranslationFile = fs.readFileSync( sourceTranslationFilePath, 'utf-8' );
			const sourceTranslations = PO.parse( sourceTranslationFile );

			// (3.2) Read the destination translation file.
			// If the destination file does not exist, use the source file as a base and remove all translations.
			const destinationTranslationFile = fs.existsSync( destinationTranslationFilePath ) ?
				fs.readFileSync( destinationTranslationFilePath, 'utf-8' ) :
				null;
			const destinationTranslations = PO.parse( destinationTranslationFile || sourceTranslationFile );

			if ( !destinationTranslationFile ) {
				destinationTranslations.items = [];
			}

			// (3.3) Move the translation from source file to destination file.
			const sourceMessage = sourceTranslations.items.find( item => item.msgid === messageId );
			sourceTranslations.items = sourceTranslations.items.filter( item => item.msgid !== messageId );

			destinationTranslations.items = destinationTranslations.items.filter( item => item.msgid !== messageId );
			destinationTranslations.items.push( sourceMessage );

			fs.mkdirSync( upath.dirname( sourceTranslationFilePath ), { recursive: true } );
			fs.mkdirSync( upath.dirname( destinationTranslationFilePath ), { recursive: true } );
			fs.writeFileSync( sourceTranslationFilePath, cleanTranslationFileContent( sourceTranslations ).toString(), 'utf-8' );
			fs.writeFileSync( destinationTranslationFilePath, cleanTranslationFileContent( destinationTranslations ).toString(), 'utf-8' );
		}

		fs.mkdirSync( upath.dirname( sourcePackageContext.contextFilePath ), { recursive: true } );
		fs.mkdirSync( upath.dirname( destinationPackageContext.contextFilePath ), { recursive: true } );

		fs.writeFileSync(
			sourcePackageContext.contextFilePath,
			JSON.stringify( sourcePackageContext.contextContent, null, '\t' ),
			'utf-8'
		);

		fs.writeFileSync(
			destinationPackageContext.contextFilePath,
			JSON.stringify( destinationPackageContext.contextContent, null, '\t' ),
			'utf-8'
		);
	}
}

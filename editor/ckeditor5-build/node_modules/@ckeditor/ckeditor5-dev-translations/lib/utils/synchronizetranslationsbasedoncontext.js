/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import upath from 'upath';
import fs from 'node:fs';
import PO from 'pofile';
import { glob } from 'glob';
import createMissingPackageTranslations from './createmissingpackagetranslations.js';
import { TRANSLATION_FILES_PATH } from './constants.js';
import cleanTranslationFileContent from './cleantranslationfilecontent.js';
import getHeaders from './getheaders.js';
import getLanguages from './getlanguages.js';
import addTranslation from './addtranslation.js';

/**
 * @param {object} options
 * @param {Array.<TranslationsContext>} options.packageContexts An array of language contexts.
 * @param {Array.<TranslatableEntry>} options.sourceMessages An array of i18n source messages.
 * @param {boolean} options.skipLicenseHeader Whether to skip adding the license header to newly created translation files.
 */
export default function synchronizeTranslationsBasedOnContext( { packageContexts, sourceMessages, skipLicenseHeader } ) {
	const languages = getLanguages();

	// For each package:
	for ( const { packagePath, contextContent } of packageContexts ) {
		// (1) Skip packages that do not contain language context.
		const hasContext = Object.keys( contextContent ).length > 0;

		if ( !hasContext ) {
			continue;
		}

		// (2) Create missing translation files for languages that do not have own "*.po" file yet.
		createMissingPackageTranslations( { packagePath, skipLicenseHeader } );

		// (3) Find all source messages that are defined in the language context.
		const sourceMessagesForPackage = Object.keys( contextContent )
			.map( messageId => sourceMessages.find( message => message.id === messageId ) )
			.filter( Boolean );

		// (4) Find all translation files ("*.po" files).
		const translationFilePaths = glob.sync( upath.join( packagePath, TRANSLATION_FILES_PATH, '*.po' ) );

		// (5) Prepare English translations needed to check whether their wording have been changed in the source messages.
		const englishTranslationFilePath = translationFilePaths.find( filePath => filePath.endsWith( 'en.po' ) );
		const { translations: englishTranslations } = parseTranslationFile( englishTranslationFilePath );

		const changedEnglishTranslations = getChangedEnglishTranslations( englishTranslations, sourceMessagesForPackage );

		// Then, for each translation file in a package:
		for ( const translationFilePath of translationFilePaths ) {
			const { translations, translationFile } = parseTranslationFile( translationFilePath );

			// (5.1) Update file headers.
			const { languageCode, localeCode } = languages.find( language => language.localeCode === translations.headers.Language );

			translations.headers = getHeaders( languageCode, localeCode );

			const numberOfPluralForms = parseInt( PO.parsePluralForms( translations.headers[ 'Plural-Forms' ] ).nplurals );

			// (5.2) Remove unused translations.
			translations.items = translations.items.filter( item => contextContent[ item.msgid ] );

			// (5.3) Remove translations that have changed the English wording. They will be treated as new messages to translate.
			translations.items = translations.items.filter( item => !changedEnglishTranslations.includes( item.msgid ) );

			// (5.4) Add missing translations.
			translations.items.push(
				...sourceMessagesForPackage
					.filter( message => !translations.items.find( item => item.msgid === message.id ) )
					.map( message => {
						const item = new PO.Item( { nplurals: numberOfPluralForms } );

						item.msgctxt = contextContent[ message.id ];
						item.msgid = message.id;

						if ( message.plural ) {
							item.msgid_plural = message.plural;
						}

						item.msgstr = addTranslation( { languageCode, numberOfPluralForms, message } );

						return item;
					} )
			);

			// (5.5) Align the number of plural forms to plural forms defined by a language.
			translations.items = translations.items.map( item => {
				if ( item.msgid_plural ) {
					item.msgstr = [ ...Array( numberOfPluralForms ) ]
						.map( ( value, index ) => item.msgstr[ index ] || '' );
				}

				return item;
			} );

			const translationFileUpdated = cleanTranslationFileContent( translations ).toString();

			// (5.6) Save translation file only if it has been updated.
			if ( translationFile === translationFileUpdated ) {
				continue;
			}

			fs.writeFileSync( translationFilePath, translationFileUpdated, 'utf-8' );
		}
	}
}

function parseTranslationFile( filePath ) {
	const file = fs.readFileSync( filePath, 'utf-8' );

	return {
		translationFile: file,
		translations: PO.parse( file )
	};
}

function getChangedEnglishTranslations( englishTranslations, sourceMessagesForPackage ) {
	return sourceMessagesForPackage
		.filter( message => {
			const englishTranslation = englishTranslations.items.find( item => item.msgid === message.id );

			if ( !englishTranslation ) {
				return false;
			}

			const [ singularForm, pluralForm ] = englishTranslation.msgstr;

			const isSingularFormChanged = singularForm !== message.string;
			const isPluralFormChanged = message.plural ? pluralForm !== message.plural : false;

			return isSingularFormChanged || isPluralFormChanged;
		} )
		.map( message => message.id );
}

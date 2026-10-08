/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Removes unused headers from the translation file.
 *
 * @param {import('pofile')} translationFileContent Content of the translation file.
 * @returns {import('pofile')}
 */
export default function cleanTranslationFileContent( translationFileContent ) {
	translationFileContent.headers = {
		Language: translationFileContent.headers.Language,
		'Plural-Forms': translationFileContent.headers[ 'Plural-Forms' ],
		'Content-Type': 'text/plain; charset=UTF-8'
	};

	return translationFileContent;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @param {object} options
 * @param {string} options.languageCode
 * @param {number} options.numberOfPluralForms
 * @param {TranslatableEntry} options.message
 * @returns {Array.<string>}
 */
export default function addTranslation( { languageCode, numberOfPluralForms, message } ) {
	// English is the source (base) language, so set the translation value to the text collected from source code.
	if ( languageCode === 'en' ) {
		const msgstr = [ message.string ];

		if ( message.plural ) {
			msgstr.push( message.plural );
		}

		return msgstr;
	}

	// For other languages, pre-fill the translation value with an empty string which means that it requires translation.
	const msgstr = [ '' ];

	if ( message.plural ) {
		msgstr.push( ...Array( numberOfPluralForms - 1 ).fill( '' ) );
	}

	return msgstr;
}

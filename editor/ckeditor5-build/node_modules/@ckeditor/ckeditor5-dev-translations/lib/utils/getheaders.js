/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getNPlurals, getFormula } from 'plural-forms';

/**
 * @param {string} languageCode
 * @param {string} localeCode
 * @returns {object}
 */
export default function getHeaders( languageCode, localeCode ) {
	return {
		Language: localeCode,
		'Plural-Forms': [
			`nplurals=${ getNPlurals( languageCode ) };`,
			`plural=${ getFormula( languageCode ) };`
		].join( ' ' ),
		'Content-Type': 'text/plain; charset=UTF-8'
	};
}

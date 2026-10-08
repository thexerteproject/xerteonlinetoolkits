/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import upath from 'upath';

/**
 * @param {string} languageCode
 * @param {string} localeCode
 * @returns {object}
 */
export default function isFileInDirectory( filePath, directoryPath ) {
	const directoryPathNormalized = upath.normalizeTrim( directoryPath ) + '/';

	return filePath.startsWith( directoryPathNormalized );
}

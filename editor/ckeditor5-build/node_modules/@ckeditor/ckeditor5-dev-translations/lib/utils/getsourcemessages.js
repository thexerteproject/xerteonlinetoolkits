/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import fs from 'node:fs';
import findMessages from '../findmessages.js';
import isFileInDirectory from './isfileindirectory.js';

/**
 * @param {object} options
 * @param {Array.<string>} options.packagePaths An array of paths to packages that contain source files with messages to translate.
 * @param {Array.<string>} options.sourceFiles An array of source files that contain messages to translate.
 * @param {Function} options.onErrorCallback Called when there is an error with parsing the source files.
 * @returns {Array.<TranslatableEntry>}
 */
export default function getSourceMessages( { packagePaths, sourceFiles, onErrorCallback } ) {
	return sourceFiles
		.filter( filePath => packagePaths.some( packagePath => isFileInDirectory( filePath, packagePath ) ) )
		.flatMap( filePath => {
			const fileContent = fs.readFileSync( filePath, 'utf-8' );
			const packagePath = packagePaths.find( packagePath => isFileInDirectory( filePath, packagePath ) );
			const sourceMessages = [];

			const onMessageCallback = message => {
				sourceMessages.push( { filePath, packagePath, ...message } );
			};

			findMessages( fileContent, filePath, onMessageCallback, onErrorCallback );

			return sourceMessages;
		} );
}

/**
 * @typedef {object} TranslatableEntry
 *
 * @property {string} id
 * @property {string} string
 * @property {string} filePath
 * @property {string} packagePath
 * @property {string} context
 * @property {string} [plural]
 */

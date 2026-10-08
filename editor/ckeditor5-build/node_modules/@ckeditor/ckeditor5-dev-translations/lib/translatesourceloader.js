/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Very simple loader that runs the translateSource function only on the source.
 * translateSource is provided by the CKEditorTranslationsPlugin.
 *
 * @param {string} source Content of the resource file
 * @param {object} map A source map consumed by the `source-map` package.
 */
export default function translateSourceLoader( source, map ) {
	const output = this.query.translateSource( source, this.resourcePath );

	this.callback( null, output, map );
}

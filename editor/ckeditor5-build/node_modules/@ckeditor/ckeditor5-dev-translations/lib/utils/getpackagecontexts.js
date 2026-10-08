/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getPackageContext from './getpackagecontext.js';

/**
 * @param {object} options
 * @param {Array.<string>} options.packagePaths An array of paths to packages, which will be used to find message contexts.
 * @param {string} options.corePackagePath A relative to `process.cwd()` path to the `@ckeditor/ckeditor5-core` package.
 * @returns {Array.<TranslationsContext>}
 */
export default function getPackageContexts( { packagePaths, corePackagePath } ) {
	// Add path to the core package if not included in the package paths.
	// The core package contains common contexts shared between other packages.
	if ( !packagePaths.includes( corePackagePath ) ) {
		packagePaths.push( corePackagePath );
	}

	return packagePaths.map( packagePath => getPackageContext( { packagePath } ) );
}

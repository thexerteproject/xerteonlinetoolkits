/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { FontFamilyOption } from '../fontconfig.js';
/**
 * @module font/fontfamily/utils
 */
/**
 * Normalizes the {@link module:font/fontconfig~FontFamilyConfig#options configuration options}
 * to the {@link module:font/fontconfig~FontFamilyOption} format.
 *
 * @param configuredOptions An array of options taken from the configuration.
 * @internal
 */
export declare function normalizeOptions(configuredOptions: Array<string | FontFamilyOption>): Array<FontFamilyOption>;
/**
 * Normalizes the CSS `font-family` property value to an array of unquoted and trimmed font faces.
 *
 * @internal
 */
export declare function normalizeFontFamilies(fontDefinition: string): Array<string>;

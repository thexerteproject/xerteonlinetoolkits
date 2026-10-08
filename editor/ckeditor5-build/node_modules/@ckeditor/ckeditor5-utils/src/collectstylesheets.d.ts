/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/collectstylesheets
 */
/**
 * A helper function for getting concatenated CSS rules from external stylesheets.
 *
 * @param stylesheets An array of stylesheet paths delivered by the user through the plugin configuration.
 */
export declare function collectStylesheets(stylesheets?: Array<string>): Promise<string>;

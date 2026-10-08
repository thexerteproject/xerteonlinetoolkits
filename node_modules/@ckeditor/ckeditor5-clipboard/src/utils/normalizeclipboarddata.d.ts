/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/utils/normalizeclipboarddata
 */
/**
 * Removes some popular browser quirks out of the clipboard data (HTML).
 * Removes all HTML comments. These are considered an internal thing and it makes little sense if they leak into the editor data.
 *
 * @param data The HTML data to normalize.
 * @returns Normalized HTML.
 * @internal
 */
export declare function normalizeClipboardData(data: string): string;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Gets all the style types supported by given list type.
 *
 * @internal
 */
export declare function getAllSupportedStyleTypes(): Array<string>;
/**
 * Checks whether the given list-style-type is supported by numbered or bulleted list.
 *
 * @internal
 */
export declare function getListTypeFromListStyleType(listStyleType: string): 'bulleted' | 'numbered' | null;
/**
 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
 *
 * @internal
 */
export declare function getListStyleTypeFromTypeAttribute(value: string): string | null;
/**
 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
 *
 * @internal
 */
export declare function getTypeAttributeFromListStyleType(value: string): string | null;
/**
 * Normalizes list style by converting aliases to their canonical form.
 *
 * @internal
 * @param listStyle The list style value to normalize.
 * @returns The canonical form of the list style.
 *
 * @example
 * normalizeListStyle( 'lower-alpha' ); // Returns 'lower-latin'
 * normalizeListStyle( 'upper-alpha' ); // Returns 'upper-latin'
 * normalizeListStyle( 'disc' ); // Returns 'disc'
 */
export declare function normalizeListStyle(listStyle: string): string;

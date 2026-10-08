/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/utils
 */
/**
 * Normalizes CSS length value to 'px'.
 *
 * @internal
 */
export declare function convertCssLengthToPx(value: string): string;
/**
 * Returns true for value with 'px' unit.
 *
 * @internal
 */
export declare function isPx(value?: string): value is string;
/**
 * Returns a rounded 'px' value.
 *
 * @internal
 */
export declare function toPx(value: number): string;

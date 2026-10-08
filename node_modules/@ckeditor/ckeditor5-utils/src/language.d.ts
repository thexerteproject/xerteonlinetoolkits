/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/language
 */
/**
 * String representing a language direction.
 */
export type LanguageDirection = 'ltr' | 'rtl';
/**
 * Helps determine whether a language text direction is LTR or RTL.
 *
 * @param languageCode The ISO 639-1 or ISO 639-2 language code.
 */
export declare function getLanguageDirection(languageCode: string): LanguageDirection;

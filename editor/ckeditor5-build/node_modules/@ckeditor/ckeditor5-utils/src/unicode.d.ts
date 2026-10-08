/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Set of utils to handle unicode characters.
 *
 * @module utils/unicode
 */
/**
 * Checks whether given `character` is a combining mark.
 *
 * @param character Character to check.
 */
export declare function isCombiningMark(character: string): boolean;
/**
 * Checks whether given `character` is a high half of surrogate pair.
 *
 * Using UTF-16 terminology, a surrogate pair denotes UTF-16 character using two UTF-8 characters. The surrogate pair
 * consist of high surrogate pair character followed by low surrogate pair character.
 *
 * @param character Character to check.
 */
export declare function isHighSurrogateHalf(character: string): boolean;
/**
 * Checks whether given `character` is a low half of surrogate pair.
 *
 * Using UTF-16 terminology, a surrogate pair denotes UTF-16 character using two UTF-8 characters. The surrogate pair
 * consist of high surrogate pair character followed by low surrogate pair character.
 *
 * @param character Character to check.
 */
export declare function isLowSurrogateHalf(character: string): boolean;
/**
 * Checks whether given offset in a string is inside a surrogate pair (between two surrogate halves).
 *
 * @param string String to check.
 * @param offset Offset to check.
 */
export declare function isInsideSurrogatePair(string: string, offset: number): boolean;
/**
 * Checks whether given offset in a string is between base character and combining mark or between two combining marks.
 *
 * @param string String to check.
 * @param offset Offset to check.
 */
export declare function isInsideCombinedSymbol(string: string, offset: number): boolean;
/**
 * Checks whether given offset in a string is inside multi-character emoji sequence.
 *
 * @param string String to check.
 * @param offset Offset to check.
 */
export declare function isInsideEmojiSequence(string: string, offset: number): boolean;

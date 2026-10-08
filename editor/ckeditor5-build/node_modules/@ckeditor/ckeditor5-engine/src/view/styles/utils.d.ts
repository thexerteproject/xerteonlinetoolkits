/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/styles/utils
 */
import type { BoxStyleSides, StylePropertyDescriptor, StyleValue } from '../stylesmap.js';
/**
 * Checks if string contains [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS value.
 *
 * ```ts
 * isColorStyleValue( '#f00' );						// true
 * isColorStyleValue( '#AA00BB33' );				// true
 * isColorStyleValue( 'rgb(0, 0, 250)' );			// true
 * isColorStyleValue( 'hsla(240, 100%, 50%, .7)' );	// true
 * isColorStyleValue( 'deepskyblue' );				// true
 * ```
 *
 * **Note**: It does not support CSS Level 4 whitespace syntax, system colors and radius values for HSL colors.
 */
export declare function isColorStyleValue(string: string): boolean;
/**
 * Checks if string contains [line style](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style) CSS value.
 */
export declare function isLineStyleValue(string: string): boolean;
/**
 * Checks if string contains [length](https://developer.mozilla.org/en-US/docs/Web/CSS/length) CSS value.
 */
export declare function isLengthStyleValue(string: string): boolean;
/**
 * Checks if string contains [percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage) CSS value.
 */
export declare function isPercentageStyleValue(string: string): boolean;
/**
 * Checks if string contains [background repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat) CSS value.
 */
export declare function isRepeatStyleValue(string: string): boolean;
/**
 * Checks if string contains [background position](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position) CSS value.
 */
export declare function isPositionStyleValue(string: string): boolean;
/**
 * Checks if string contains [background attachment](https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment) CSS value.
 */
export declare function isAttachmentStyleValue(string: string): boolean;
/**
 * Checks if string contains [URL](https://developer.mozilla.org/en-US/docs/Web/CSS/url) CSS value.
 */
export declare function isURLStyleValue(string: string): boolean;
/**
 * Parses box sides as individual values.
 */
export declare function getBoxSidesStyleValues(value?: string): BoxStyleSides;
/**
 * Default reducer for CSS properties that concerns edges of a box
 * [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) notations:
 *
 * ```ts
 * stylesProcessor.setReducer( 'padding', getBoxSidesStyleValueReducer( 'padding' ) );
 * ```
 */
export declare function getBoxSidesStyleValueReducer(styleShorthand: string): (value: StyleValue) => Array<StylePropertyDescriptor>;
/**
 * Returns a [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) notation
 * of a CSS property value.
 *
 * ```ts
 * getBoxSidesStyleShorthandValue( { top: '1px', right: '1px', bottom: '2px', left: '1px' } );
 * // will return '1px 1px 2px'
 * ```
 */
export declare function getBoxSidesStyleShorthandValue({ top, right, bottom, left }: BoxStyleSides): string;
/**
 * Creates a normalizer for a [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) 1-to-4 value.
 *
 * ```ts
 * stylesProcessor.setNormalizer( 'margin', getPositionStyleShorthandNormalizer( 'margin' ) );
 * ```
 */
export declare function getPositionStyleShorthandNormalizer(shorthand: string): (value: string) => {
    path: string;
    value: BoxStyleSides;
};
/**
 * Parses parts of a 1-to-4 value notation - handles some CSS values with spaces (like RGB()).
 *
 * ```ts
 * getShorthandStylesValues( 'red blue RGB(0, 0, 0)');
 * // will return [ 'red', 'blue', 'RGB(0, 0, 0)' ]
 * ```
 */
export declare function getShorthandStylesValues(string: string): Array<string>;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/getborderwidths
 */
/**
 * Returns an object containing CSS border widths of a specified HTML element.
 *
 * @param element An element which has CSS borders.
 * @returns An object containing `top`, `left`, `right` and `bottom` properties
 * with numerical values of the `border-[top,left,right,bottom]-width` CSS styles.
 */
export declare function getBorderWidths(element: HTMLElement): BorderWidths;
/**
 * An object describing widths of `HTMLElement` borders.
*/
export interface BorderWidths {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

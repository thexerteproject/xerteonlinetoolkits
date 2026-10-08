/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/getrangefrommouseevent
 */
/**
 * Returns a DOM range from a given point specified by a mouse event.
 *
 * @param domEvent The mouse event.
 * @returns The DOM range.
 */
export declare function getRangeFromMouseEvent(domEvent: MouseEvent & {
    rangeParent?: HTMLElement;
    rangeOffset?: number;
}): Range | null;

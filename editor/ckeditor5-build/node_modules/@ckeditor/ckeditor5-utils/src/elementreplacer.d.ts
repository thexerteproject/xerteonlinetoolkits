/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/elementreplacer
 */
/**
 * Utility class allowing to hide existing HTML elements or replace them with given ones in a way that doesn't remove
 * the original elements from the DOM.
 */
export declare class ElementReplacer {
    /**
     * The elements replaced by {@link #replace} and their replacements.
     */
    private _replacedElements;
    constructor();
    /**
     * Hides the `element` and, if specified, inserts the the given element next to it.
     *
     * The effect of this method can be reverted by {@link #restore}.
     *
     * @param element The element to replace.
     * @param newElement The replacement element. If not passed, then the `element` will just be hidden.
     */
    replace(element: HTMLElement, newElement?: HTMLElement): void;
    /**
     * Restores what {@link #replace} did.
     */
    restore(): void;
}

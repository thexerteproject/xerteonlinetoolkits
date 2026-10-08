/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/minimappositiontrackerview
 */
import { View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
/**
 * The position tracker visualizing the visible subset of the content. Displayed over the minimap.
 *
 * @internal
 */
export declare class MinimapPositionTrackerView extends View {
    /**
     * The CSS `height` of the tracker visualizing the subset of the content visible to the user.
     *
     * @readonly
     */
    height: number;
    /**
     * The CSS `top` of the tracker, used to move it vertically over the minimap.
     *
     * @readonly
     */
    top: number;
    /**
     * The scroll progress (in %) displayed over the tracker when being dragged by the user.
     *
     * @readonly
     */
    scrollProgress: number;
    /**
     * Indicates whether the tracker is being dragged by the user (e.g. using the mouse).
     *
     * @internal
     * @readonly
     */
    _isDragging: boolean;
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Sets the new height of the tracker to visualize the subset of the content visible to the user.
     */
    setHeight(newHeight: number): void;
    /**
     * Sets the top offset of the tracker to move it around vertically.
     */
    setTopOffset(newOffset: number): void;
    /**
     * Sets the scroll progress (in %) to inform the user using a label when the tracker is being dragged.
     */
    setScrollProgress(newProgress: number): void;
}

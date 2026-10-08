/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/minimapview
 */
import { View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
/**
 * Options for the minimap view.
 *
 * @internal
 */
export type MinimapViewOptions = {
    domRootClone: HTMLElement;
    pageStyles: Array<string | {
        href: string;
    }>;
    scaleRatio: number;
    useSimplePreview?: boolean;
    extraClasses?: string;
};
/**
 * The main view of the minimap. It renders the original content but scaled down with a tracker element
 * visualizing the subset of the content visible to the user and allowing interactions (scrolling, dragging).
 *
 * @internal
 */
export declare class MinimapView extends View {
    /**
     * An instance of the tracker view displayed over the minimap.
     */
    private readonly _positionTrackerView;
    /**
     * The scale ratio of the minimap relative to the original editing DOM root with the content.
     */
    private readonly _scaleRatio;
    /**
     * An instance of the iframe view that hosts the minimap.
     */
    private readonly _minimapIframeView;
    /**
     * Creates an instance of the minimap view.
     */
    constructor({ locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone }: {
        locale: Locale;
    } & MinimapViewOptions);
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Returns the DOM {@link module:utils/dom/rect~Rect} height of the minimap.
     */
    get height(): number;
    /**
     * Returns the number of available space (pixels) the position tracker (visible subset of the content) can use to scroll vertically.
     */
    get scrollHeight(): number;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Sets the new height of the minimap (in px) to respond to the changes in the original editing DOM root.
     *
     * **Note**:The provided value should be the `offsetHeight` of the original editing DOM root.
     */
    setContentHeight(newHeight: number): void;
    /**
     * Sets the minimap scroll progress.
     *
     * The minimap scroll progress is linked to the original editing DOM root and its scrollable container (ancestor).
     * Changing the progress will alter the vertical position of the minimap (and its position tracker) and give the user an accurate
     * overview of the visible document.
     *
     * **Note**: The value should be between 0 and 1. 0 when the DOM root has not been scrolled, 1 when the
     * scrolling has reached the end.
     */
    setScrollProgress(newScrollProgress: number): void;
    /**
     * Sets the new height of the tracker (in px) to visualize the subset of the content visible to the user.
     */
    setPositionTrackerHeight(trackerHeight: number): void;
    /**
     * @param data DOM event data
     */
    private _handleMinimapClick;
    /**
     * @param data DOM event data
     */
    private _handleMinimapMouseWheel;
}
/**
 * Fired when the minimap view is clicked.
 *
 * @eventName ~MinimapView#click
 * @param percentage The number between 0 and 1 representing a place in the minimap (its height) that was clicked.
 */
export type MinimapClickEvent = {
    name: 'click';
    args: [percentage: number];
};
/**
 * Fired when the position tracker is dragged or the minimap is scrolled via mouse wheel.
 *
 * @eventName ~MinimapView#drag
 * @param movementY The vertical movement of the minimap as a result of dragging or scrolling.
 */
export type MinimapDragEvent = {
    name: 'drag';
    args: [movementY: number];
};

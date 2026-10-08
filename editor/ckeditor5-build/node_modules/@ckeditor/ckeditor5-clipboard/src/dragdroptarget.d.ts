/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/dragdroptarget
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { type ModelRange, type ModelLiveRange, type ViewElement, type ViewRange } from '@ckeditor/ckeditor5-engine';
/**
 * Part of the Drag and Drop handling. Responsible for finding and displaying the drop target.
 *
 * @internal
 */
export declare class DragDropTarget extends Plugin {
    /**
     * A delayed callback removing the drop marker.
     *
     * @internal
     */
    readonly removeDropMarkerDelayed: import("@ckeditor/ckeditor5-utils").DelayedFunc<() => void>;
    /**
     * A throttled callback updating the drop marker.
     */
    private readonly _updateDropMarkerThrottled;
    /**
     * A throttled callback reconverting the drop parker.
     */
    private readonly _reconvertMarkerThrottled;
    /**
     * The horizontal drop target line view.
     */
    private _dropTargetLineView;
    /**
     * DOM Emitter.
     */
    private _domEmitter;
    /**
     * Map of document scrollable elements.
     */
    private _scrollables;
    /**
     * @inheritDoc
     */
    static get pluginName(): "DragDropTarget";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Finds the drop target range and updates the drop marker.
     *
     * @return The updated drop target range or null if no valid range was found.
     * @internal
     */
    updateDropMarker(targetViewElement: ViewElement, targetViewRanges: Array<ViewRange> | null, clientX: number, clientY: number, blockMode: boolean, draggedRange: ModelLiveRange | null): ModelRange | null;
    /**
     * Finds the final drop target range.
     *
     * @internal
     */
    getFinalDropRange(targetViewElement: ViewElement, targetViewRanges: Array<ViewRange> | null, clientX: number, clientY: number, blockMode: boolean, draggedRange: ModelLiveRange | null): ModelRange | null;
    /**
     * Removes the drop target marker.
     *
     * @internal
     */
    removeDropMarker(): void;
    /**
     * Creates downcast conversion for the drop target marker.
     */
    private _setupDropMarker;
    /**
     * Updates the drop target marker to the provided range.
     *
     * @param targetRange The range to set the marker to.
     */
    private _updateDropMarker;
    /**
     * Creates the UI element for vertical (in-line) drop target.
     */
    private _createDropTargetPosition;
    /**
     * Updates the horizontal drop target line.
     */
    private _updateDropTargetLine;
    /**
     * Finds the closest scrollable element rect for the given view element.
     */
    private _getScrollableRect;
}

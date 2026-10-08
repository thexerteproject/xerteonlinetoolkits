/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/dragdrop
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget } from '@ckeditor/ckeditor5-widget';
import { ClipboardPipeline } from './clipboardpipeline.js';
import { DragDropTarget } from './dragdroptarget.js';
import { DragDropBlockToolbar } from './dragdropblocktoolbar.js';
import '../theme/clipboard.css';
/**
 * The drag and drop feature. It works on top of the {@link module:clipboard/clipboardpipeline~ClipboardPipeline}.
 *
 * Read more about the clipboard integration in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
 *
 * @internal
 */
export declare class DragDrop extends Plugin {
    /**
     * The live range over the original content that is being dragged.
     */
    private _draggedRange;
    /**
     * The UID of current dragging that is used to verify if the drop started in the same editor as the drag start.
     *
     * **Note**: This is a workaround for broken 'dragend' events (they are not fired if the source text node got removed).
     */
    private _draggingUid;
    /**
     * The reference to the model element that currently has a `draggable` attribute set (it is set while dragging).
     */
    private _draggableElement;
    /**
     * A delayed callback removing draggable attributes.
     */
    private _clearDraggableAttributesDelayed;
    /**
     * Whether the dragged content can be dropped only in block context.
     */
    private _blockMode;
    /**
     * DOM Emitter.
     */
    private _domEmitter;
    /**
     * The DOM element used to generate dragged preview image.
     */
    private _previewContainer?;
    /**
     * @inheritDoc
     */
    static get pluginName(): "DragDrop";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ClipboardPipeline, typeof Widget, typeof DragDropTarget, typeof DragDropBlockToolbar];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Drag and drop events handling.
     */
    private _setupDragging;
    /**
     * Integration with the `clipboardInput` event.
     */
    private _setupClipboardInputIntegration;
    /**
     * Integration with the `contentInsertion` event of the clipboard pipeline.
     */
    private _setupContentInsertionIntegration;
    /**
     * Adds listeners that add the `draggable` attribute to the elements while the mouse button is down so the dragging could start.
     */
    private _setupDraggableAttributeHandling;
    /**
     * Removes the `draggable` attribute from the element that was used for dragging.
     */
    private _clearDraggableAttributes;
    /**
     * Deletes the dragged content from its original range and clears the dragging state.
     *
     * @param moved Whether the move succeeded.
     */
    private _finalizeDragging;
    /**
     * Sets the dragged source range based on event target and document selection.
     */
    private _prepareDraggedRange;
    /**
     * Updates the dragged preview image.
     */
    private _updatePreview;
}

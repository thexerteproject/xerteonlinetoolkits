/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/dragdropblocktoolbar
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * Integration of a block Drag and Drop support with the block toolbar.
 *
 * @internal
 */
export declare class DragDropBlockToolbar extends Plugin {
    /**
     * Whether current dragging is started by block toolbar button dragging.
     */
    private _isBlockDragging;
    /**
     * DOM Emitter.
     */
    private _domEmitter;
    /**
     * @inheritDoc
     */
    static get pluginName(): "DragDropBlockToolbar";
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
     * The `dragstart` event handler.
     */
    private _handleBlockDragStart;
    /**
     * The `dragover` and `drop` event handler.
     */
    private _handleBlockDragging;
    /**
     * The `dragend` event handler.
     */
    private _handleBlockDragEnd;
}

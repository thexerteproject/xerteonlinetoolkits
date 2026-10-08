/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/minimap
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/minimap.css';
/**
 * The content minimap feature.
 */
export declare class Minimap extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "Minimap";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * The reference to the view of the minimap.
     */
    private _minimapView;
    /**
     * The DOM element closest to the editable element of the editor as returned
     * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
     */
    private _scrollableRootAncestor;
    /**
     * The DOM element closest to the editable element of the editor as returned
     * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
     */
    private _editingRootElement?;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Initializes the minimap view element and starts the layout synchronization
     * on the editing view `render` event.
     */
    private _onUiReady;
    /**
     * Initializes the minimap view and attaches listeners that make it responsive to the environment (document)
     * but also allow the minimap to control the document (scroll position).
     */
    private _initializeMinimapView;
    /**
     * @private
     */
    private _syncMinimapToEditingRootScrollPosition;
}

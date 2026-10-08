/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module source-editing/sourceediting
 */
import { Plugin, PendingActions, type Editor } from 'ckeditor5/src/core.js';
import '../theme/sourceediting.css';
/**
 * The source editing feature.
 *
 * It provides the possibility to view and edit the source of the document.
 *
 * For a detailed overview, check the {@glink features/source-editing/source-editing source editing feature documentation} and the
 * {@glink api/source-editing package page}.
 */
export declare class SourceEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SourceEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof PendingActions];
    /**
     * Flag indicating whether the document source mode is active.
     *
     * @observable
     */
    isSourceEditingMode: boolean;
    /**
     * The element replacer instance used to replace the editing roots with the wrapper elements containing the document source.
     */
    private _elementReplacer;
    /**
     * Maps all root names to wrapper elements containing the document source.
     */
    private _replacedRoots;
    /**
     * Maps all root names to their document data.
     */
    private _dataFromRoots;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Updates the source data in all hidden editing roots.
     */
    updateEditorData(): void;
    private _checkCompatibility;
    /**
     * Creates source editing wrappers that replace each editing root. Each wrapper contains the document source from the corresponding
     * root.
     *
     * The wrapper element contains a textarea and it solves the problem, that the textarea element cannot auto expand its height based on
     * the content it contains. The solution is to make the textarea more like a plain div element, which expands in height as much as it
     * needs to, in order to display the whole document source without scrolling. The wrapper element is a parent for the textarea and for
     * the pseudo-element `::after`, that replicates the look, content, and position of the textarea. The pseudo-element replica is hidden,
     * but it is styled to be an identical visual copy of the textarea with the same content. Then, the wrapper is a grid container and both
     * of its children (the textarea and the `::after` pseudo-element) are positioned within a CSS grid to occupy the same grid cell. The
     * content in the pseudo-element `::after` is set in CSS and it stretches the grid to the appropriate size based on the textarea value.
     * Since both children occupy the same grid cell, both have always the same height.
     */
    private _showSourceEditing;
    /**
     * Restores all hidden editing roots and sets the source data in them.
     */
    private _hideSourceEditing;
    /**
     * Hides the document outline if it is configured.
     */
    private _hideDocumentOutline;
    /**
     * Shows the document outline if it was hidden when entering the source editing.
     */
    private _showDocumentOutline;
    /**
     * Hides the annotations when entering the source editing mode and shows back them after leaving it.
     */
    private _refreshAnnotationsVisibility;
    /**
     * Focuses the textarea containing document source from the first editing root.
     */
    private _focusSourceEditing;
    /**
     * Disables all commands.
     */
    private _disableCommands;
    /**
     * Clears forced disable for all commands, that was previously set through {@link #_disableCommands}.
     */
    private _enableCommands;
    /**
     * Adds or removes the `readonly` attribute from the textarea from all roots, if document source mode is active.
     *
     * @param isReadOnly Indicates whether all textarea elements should be read-only.
     */
    private _handleReadOnlyMode;
    /**
     * Checks, if the plugin is allowed to handle the source editing mode by itself. Currently, the source editing mode is supported only
     * for the {@link module:editor-classic/classiceditor~ClassicEditor classic editor}.
     */
    private _isAllowedToHandleSourceEditingMode;
    /**
     * If any {@link module:ui/dialog/dialogview~DialogView editor dialog} is currently visible, hide it.
     */
    private _hideVisibleDialog;
    private _createButton;
}

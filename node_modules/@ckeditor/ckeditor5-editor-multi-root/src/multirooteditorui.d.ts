/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module editor-multi-root/multirooteditorui
 */
import { type Editor } from 'ckeditor5/src/core.js';
import { EditorUI, type InlineEditableUIView } from 'ckeditor5/src/ui.js';
import { type MultiRootEditorUIView } from './multirooteditoruiview.js';
/**
 * The multi-root editor UI class.
 */
export declare class MultiRootEditorUI extends EditorUI {
    /**
     * The main (top–most) view of the editor UI.
     */
    readonly view: MultiRootEditorUIView;
    /**
     * The editable element that was focused the last time when any of the editables had focus.
     */
    private _lastFocusedEditableElement;
    /**
     * Creates an instance of the multi-root editor UI class.
     *
     * @param editor The editor instance.
     * @param view The view of the UI.
     */
    constructor(editor: Editor, view: MultiRootEditorUIView);
    /**
     * Initializes the UI.
     */
    init(): void;
    /**
     * Adds the editable to the editor UI.
     *
     * After the editable is added to the editor UI it can be considered "active".
     *
     * The editable is attached to the editor editing pipeline, which means that it will be updated as the editor model updates and
     * changing its content will be reflected in the editor model. Keystrokes, focus handling and placeholder are initialized.
     *
     * @param editable The editable instance to add.
     * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
     * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
     */
    addEditable(editable: InlineEditableUIView, placeholder?: string): void;
    /**
     * Removes the editable instance from the editor UI.
     *
     * Removed editable can be considered "deactivated".
     *
     * The editable is detached from the editing pipeline, so model changes are no longer reflected in it. All handling added in
     * {@link #addEditable} is removed.
     *
     * @param editable Editable to remove from the editor UI.
     */
    removeEditable(editable: InlineEditableUIView): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Initializes the editor main toolbar and its panel.
     */
    private _initToolbar;
    /**
     * Enables the placeholder text on a given editable.
     *
     * @param editable Editable on which the placeholder should be set.
     * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
     * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
     */
    private _initPlaceholder;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module editor-inline/inlineeditorui
 */
import { type Editor } from 'ckeditor5/src/core.js';
import { EditorUI } from 'ckeditor5/src/ui.js';
import { type InlineEditorUIView } from './inlineeditoruiview.js';
/**
 * The inline editor UI class.
 *
 * @extends module:ui/editorui/editorui~EditorUI
 */
export declare class InlineEditorUI extends EditorUI {
    /**
     * The main (top–most) view of the editor UI.
     */
    readonly view: InlineEditorUIView;
    /**
     * A normalized `config.toolbar` object.
     */
    private readonly _toolbarConfig;
    /**
     * Creates an instance of the inline editor UI class.
     *
     * @param editor The editor instance.
     * @param view The view of the UI.
     */
    constructor(editor: Editor, view: InlineEditorUIView);
    /**
     * @inheritDoc
     */
    get element(): HTMLElement | null;
    /**
     * Initializes the UI.
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Initializes the inline editor toolbar and its panel.
     */
    private _initToolbar;
    /**
     * Enable the placeholder text on the editing root.
     */
    private _initPlaceholder;
}

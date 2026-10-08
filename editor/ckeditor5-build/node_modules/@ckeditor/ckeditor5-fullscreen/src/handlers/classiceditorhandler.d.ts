/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { FullscreenAbstractEditorHandler } from './abstracteditorhandler.js';
/**
 * The classic editor fullscreen mode handler.
 */
export declare class FullscreenClassicEditorHandler extends FullscreenAbstractEditorHandler {
    /**
     * An editor instance.
     */
    protected readonly _editor: ClassicEditor;
    /**
     * @inheritDoc
     */
    constructor(editor: ClassicEditor);
    /**
     * A function that moves the editor UI elements to the fullscreen mode.
     */
    defaultOnEnter(): HTMLElement;
}

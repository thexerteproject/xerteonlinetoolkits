/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module fullscreen/fullscreencommand
 */
import { Command } from 'ckeditor5/src/core.js';
import { FullscreenAbstractEditorHandler } from './handlers/abstracteditorhandler.js';
import { FullscreenClassicEditorHandler } from './handlers/classiceditorhandler.js';
import { FullscreenDecoupledEditorHandler } from './handlers/decouplededitorhandler.js';
/**
 * A command toggling the fullscreen mode.
 */
export class FullscreenCommand extends Command {
    /**
     * Specialized class handling the fullscreen mode toggling for a specific editor type.
     *
     * If you want to add support for a new editor type (for now, only Classic and Decoupled editors are handled),
     * create a custom handler that extends `FullscreenAbstractEditorHandler` and replace `fullscreenHandler` with it after
     * editor initialization:
     *
     * ```ts
     * // See the details of how to implement a custom handler in the `FullscreenAbstractEditorHandler` class API docs.
     * class CustomEditorHandler extends FullscreenAbstractEditorHandler {}
     *
     * CustomEditorClass.create( document.querySelector( '#editor' ), {} )
     * 	.then( ( editor ) => {
     * 		editor.commands.get( 'toggleFullscreen' ).fullscreenHandler = new CustomEditorHandler( editor );
     * 	} );
     * ```
     */
    fullscreenHandler;
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        this.affectsData = false;
        this.isEnabled = true;
        this.value = false;
        // Choose the appropriate handler based on the editor type.
        // Currently only `ClassicEditor` and `DecoupledEditor` are supported. For other editor types, you should create a custom handler
        // that extends `FullscreenAbstractEditorHandler` and replace `fullscreenHandler` with it.
        if (isClassicEditor(editor)) {
            this.fullscreenHandler = new FullscreenClassicEditorHandler(editor);
        }
        else if (isDecoupledEditor(editor)) {
            this.fullscreenHandler = new FullscreenDecoupledEditorHandler(editor);
        }
        else {
            this.fullscreenHandler = new FullscreenAbstractEditorHandler(editor);
        }
    }
    /**
     * Toggles the fullscreen mode.
     */
    execute() {
        if (this.value) {
            this._disableFullscreenMode();
        }
        else {
            this._enableFullscreenMode();
        }
    }
    /**
     * Enables the fullscreen mode.
     */
    _enableFullscreenMode() {
        this.fullscreenHandler.enable();
        this.value = true;
    }
    /**
     * Disables the fullscreen mode.
     */
    _disableFullscreenMode() {
        this.fullscreenHandler.disable();
        this.value = false;
    }
}
/**
 * Classic editor typeguard.
 */
function isClassicEditor(editor) {
    return editor.constructor.editorName === 'ClassicEditor';
}
/**
 * Decoupled editor typeguard.
 */
function isDecoupledEditor(editor) {
    return editor.constructor.editorName === 'DecoupledEditor';
}

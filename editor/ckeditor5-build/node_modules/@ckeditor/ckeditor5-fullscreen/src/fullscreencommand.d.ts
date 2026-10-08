/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module fullscreen/fullscreencommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { FullscreenAbstractEditorHandler } from './handlers/abstracteditorhandler.js';
/**
 * A command toggling the fullscreen mode.
 */
export declare class FullscreenCommand extends Command {
    /**
     * Indicates whether the fullscreen mode is enabled.
     *
     * @observable
     * @readonly
     */
    value: boolean;
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
    fullscreenHandler: FullscreenAbstractEditorHandler;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * Toggles the fullscreen mode.
     */
    execute(): void;
    /**
     * Enables the fullscreen mode.
     */
    private _enableFullscreenMode;
    /**
     * Disables the fullscreen mode.
     */
    private _disableFullscreenMode;
}

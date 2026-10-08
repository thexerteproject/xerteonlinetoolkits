/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module editor-balloon/ballooneditor
 */
import { Editor, type EditorConfig } from 'ckeditor5/src/core.js';
import { BalloonEditorUI } from './ballooneditorui.js';
declare const BalloonEditor_base: import("ckeditor5/src/utils.js").Mixed<typeof Editor, import("ckeditor5/src/core.js").ElementApi>;
/**
 * The balloon editor implementation (Medium-like editor).
 * It uses an inline editable and a toolbar based on the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}.
 * See the {@glink examples/builds/balloon-editor demo}.
 *
 * In order to create a balloon editor instance, use the static
 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method.
 */
export declare class BalloonEditor extends /* #__PURE__ */ BalloonEditor_base {
    /**
     * @inheritDoc
     */
    static get editorName(): 'BalloonEditor';
    /**
     * @inheritDoc
     */
    readonly ui: BalloonEditorUI;
    /**
     * Creates an instance of the balloon editor.
     *
     * **Note:** do not use the constructor to create editor instances. Use the static
     * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method instead.
     *
     * @param sourceElementOrData The DOM element that will be the source for the created editor
     * (on which the editor will be initialized) or initial data for the editor. For more information see
     * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}.
     * @param config The editor configuration.
     */
    protected constructor(sourceElementOrData: HTMLElement | string, config?: EditorConfig);
    /**
     * Destroys the editor instance, releasing all resources used by it.
     *
     * Updates the original editor element with the data if the
     * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
     * configuration option is set to `true`.
     */
    destroy(): Promise<unknown>;
    /**
     * Creates a new balloon editor instance.
     *
     * There are three general ways how the editor can be initialized.
     *
     * # Using an existing DOM element (and loading data from it)
     *
     * You can initialize the editor using an existing DOM element:
     *
     * ```ts
     * BalloonEditor
     * 	.create( document.querySelector( '#editor' ) )
     * 	.then( editor => {
     * 		console.log( 'Editor was initialized', editor );
     * 	} )
     * 	.catch( err => {
     * 		console.error( err.stack );
     * 	} );
     * ```
     *
     * The element's content will be used as the editor data and the element will become the editable element.
     *
     * # Creating a detached editor
     *
     * Alternatively, you can initialize the editor by passing the initial data directly as a string.
     * In this case, the editor will render an element that must be inserted into the DOM for the editor to work properly:
     *
     * ```ts
     * BalloonEditor
     * 	.create( '<p>Hello world!</p>' )
     * 	.then( editor => {
     * 		console.log( 'Editor was initialized', editor );
     *
     * 		// Initial data was provided so the editor UI element needs to be added manually to the DOM.
     * 		document.body.appendChild( editor.ui.element );
     * 	} )
     * 	.catch( err => {
     * 		console.error( err.stack );
     * 	} );
     * ```
     *
     * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
     * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
     *
     * # Using an existing DOM element (and data provided in `config.initialData`)
     *
     * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
     *
     * ```ts
     * BalloonEditor
     * 	.create( document.querySelector( '#editor' ), {
     * 		initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
     * 	} )
     * 	.then( editor => {
     * 		console.log( 'Editor was initialized', editor );
     * 	} )
     * 	.catch( err => {
     * 		console.error( err.stack );
     * 	} );
     * ```
     *
     * This method can be used to initialize the editor on an existing element with the specified content in case if your integration
     * makes it difficult to set the content of the source element.
     *
     * Note that an error will be thrown if you pass the initial data both as the first parameter and also in the configuration.
     *
     * # Configuring the editor
     *
     * See the {@link module:core/editor/editorconfig~EditorConfig editor configuration documentation} to learn more about
     * customizing plugins, toolbar and more.
     *
     * # Using the editor from source
     *
     * If you want to use the balloon editor,
     * you need to define the list of
     * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
     * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}.
     *
     * @param sourceElementOrData The DOM element that will be the source for the created editor
     * or the editor's initial data.
     *
     * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization.
     * The editor data will be set back to the original element once the editor is destroyed only if the
     * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy}
     * option is set to `true`.
     *
     * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
     * It is available under the {@link module:editor-balloon/ballooneditorui~BalloonEditorUI#element `editor.ui.element`} property.
     *
     * @param config The editor configuration.
     * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
     */
    static create(sourceElementOrData: HTMLElement | string, config?: EditorConfig): Promise<BalloonEditor>;
}
export {};

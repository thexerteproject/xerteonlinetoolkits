/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/document
 */
import { Differ } from './differ.js';
import { ModelDocumentSelection } from './documentselection.js';
import { History } from './history.js';
import { ModelRootElement } from './rootelement.js';
import type { Model } from './model.js';
import { type Batch } from './batch.js';
import { type ModelRange } from './range.js';
import { type ModelWriter } from './writer.js';
import { Collection } from '@ckeditor/ckeditor5-utils';
declare const ModelDocument_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Data model's document. It contains the model's structure, its selection and the history of changes.
 *
 * Read more about working with the model in
 * {@glink framework/architecture/editing-engine#model introduction to the the editing engine's architecture}.
 *
 * Usually, the document contains just one {@link module:engine/model/document~ModelDocument#roots root element}, so
 * you can retrieve it by just calling {@link module:engine/model/document~ModelDocument#getRoot} without specifying its name:
 *
 * ```ts
 * model.document.getRoot(); // -> returns the main root
 * ```
 *
 * However, the document may contain multiple roots – e.g. when the editor has multiple editable areas
 * (e.g. a title and a body of a message).
 */
export declare class ModelDocument extends /* #__PURE__ */ ModelDocument_base {
    /**
     * The {@link module:engine/model/model~Model model} that the document is a part of.
     */
    readonly model: Model;
    /**
     * The document's history.
     */
    readonly history: History;
    /**
     * The selection in this document.
     */
    readonly selection: ModelDocumentSelection;
    /**
     * A list of roots that are owned and managed by this document. Use {@link #createRoot}, {@link #getRoot} and
     * {@link #getRootNames} to manipulate it.
     */
    readonly roots: Collection<ModelRootElement>;
    /**
     * The model differ object. Its role is to buffer changes done on the model document and then calculate a diff of those changes.
     */
    readonly differ: Differ;
    /**
     * Defines whether the document is in a read-only mode.
     *
     * The user should not be able to change the data of a document that is read-only.
     *
     * @readonly
     */
    isReadOnly: boolean;
    /**
     * Post-fixer callbacks registered to the model document.
     */
    private readonly _postFixers;
    /**
     * A flag that indicates whether the selection has changed since last change block.
     */
    private _hasSelectionChangedFromTheLastChangeBlock;
    /**
     * Creates an empty document instance with no {@link #roots} (other than
     * the {@link #graveyard graveyard root}).
     */
    constructor(model: Model);
    /**
     * The document version. Every applied operation increases the version number. It is used to
     * ensure that operations are applied on a proper document version.
     *
     * This property is equal to {@link module:engine/model/history~History#version `model.Document#history#version`}.
     *
     * If the {@link module:engine/model/operation/operation~Operation#baseVersion base version} does not match the document version,
     * a {@link module:utils/ckeditorerror~CKEditorError model-document-applyoperation-wrong-version} error is thrown.
     */
    get version(): number;
    set version(version: number);
    /**
     * The graveyard tree root. A document always has a graveyard root that stores removed nodes.
     */
    get graveyard(): ModelRootElement;
    /**
     * Creates a new root.
     *
     * **Note:** do not use this method after the editor has been initialized! If you want to dynamically add a root, use
     * {@link module:engine/model/writer~ModelWriter#addRoot `model.Writer#addRoot`} instead.
     *
     * @param elementName The element name. Defaults to `'$root'` which also has some basic schema defined
     * (e.g. `$block` elements are allowed inside the `$root`). Make sure to define a proper schema if you use a different name.
     * @param rootName A unique root name.
     * @returns The created root.
     */
    createRoot(elementName?: string, rootName?: string): ModelRootElement;
    /**
     * Removes all event listeners set by the document instance.
     */
    destroy(): void;
    /**
     * Returns a root by its name.
     *
     * Detached roots are returned by this method. This is to be able to operate on the detached root (for example, to be able to create
     * a position inside such a root for undo feature purposes).
     *
     * @param name The root name of the root to return.
     * @returns The root registered under a given name or `null` when there is no root with the given name.
     */
    getRoot(name?: string): ModelRootElement | null;
    /**
     * Returns an array with names of all roots added to the document (except the {@link #graveyard graveyard root}).
     *
     * Detached roots **are not** returned by this method by default. This is to make sure that all features or algorithms that operate
     * on the document data know which roots are still a part of the document and should be processed.
     *
     * @param includeDetached Specified whether detached roots should be returned as well.
     */
    getRootNames(includeDetached?: boolean): Array<string>;
    /**
     * Returns an array with all roots added to the document (except the {@link #graveyard graveyard root}).
     *
     * Detached roots **are not** returned by this method by default. This is to make sure that all features or algorithms that operate
     * on the document data know which roots are still a part of the document and should be processed.
     *
     * @param includeDetached Specified whether detached roots should be returned as well.
     */
    getRoots(includeDetached?: boolean): Array<ModelRootElement>;
    /**
     * Used to register a post-fixer callback. A post-fixer mechanism guarantees that the features
     * will operate on a correct model state.
     *
     * An execution of a feature may lead to an incorrect document tree state. The callbacks are used to fix the document tree after
     * it has changed. Post-fixers are fired just after all changes from the outermost change block were applied but
     * before the {@link module:engine/model/document~ModelDocument#event:change change event} is fired. If a post-fixer callback made
     * a change, it should return `true`. When this happens, all post-fixers are fired again to check if something else should
     * not be fixed in the new document tree state.
     *
     * As a parameter, a post-fixer callback receives a {@link module:engine/model/writer~ModelWriter writer} instance connected with the
     * executed changes block. Thanks to that, all changes done by the callback will be added to the same
     * {@link module:engine/model/batch~Batch batch} (and undo step) as the original changes. This makes post-fixer changes transparent
     * for the user.
     *
     * An example of a post-fixer is a callback that checks if all the data were removed from the editor. If so, the
     * callback should add an empty paragraph so that the editor is never empty:
     *
     * ```ts
     * document.registerPostFixer( writer => {
     * 	const changes = document.differ.getChanges();
     *
     * 	// Check if the changes lead to an empty root in the editor.
     * 	for ( const entry of changes ) {
     * 		if ( entry.type == 'remove' && entry.position.root.isEmpty ) {
     * 			writer.insertElement( 'paragraph', entry.position.root, 0 );
     *
     * 			// It is fine to return early, even if multiple roots would need to be fixed.
     * 			// All post-fixers will be fired again, so if there are more empty roots, those will be fixed, too.
     * 			return true;
     * 		}
     * 	}
     *
     * 	return false;
     * } );
     * ```
     */
    registerPostFixer(postFixer: ModelPostFixer): void;
    /**
     * A custom `toJSON()` method to solve child-parent circular dependencies.
     *
     * @returns A clone of this object with the document property changed to a string.
     */
    toJSON(): unknown;
    /**
     * Check if there were any changes done on document, and if so, call post-fixers,
     * fire `change` event for features and conversion and then reset the differ.
     * Fire `change:data` event when at least one operation or buffered marker changes the data.
     *
     * @internal
     * @fires change
     * @fires change:data
     * @param writer The writer on which post-fixers will be called.
     */
    _handleChangeBlock(writer: ModelWriter): void;
    /**
     * Returns whether there is a buffered change or if the selection has changed from the last
     * {@link module:engine/model/model~Model#enqueueChange `enqueueChange()` block}
     * or {@link module:engine/model/model~Model#change `change()` block}.
     *
     * @returns Returns `true` if document has changed from the last `change()` or `enqueueChange()` block.
     */
    protected _hasDocumentChangedFromTheLastChangeBlock(): boolean;
    /**
     * Returns the default root for this document which is either the first root that was added to the document using
     * {@link #createRoot} or the {@link #graveyard graveyard root} if no other roots were created.
     *
     * @returns The default root for this document.
     */
    protected _getDefaultRoot(): ModelRootElement;
    /**
     * Returns the default range for this selection. The default range is a collapsed range that starts and ends
     * at the beginning of this selection's document {@link #_getDefaultRoot default root}.
     *
     * @internal
     */
    _getDefaultRange(): ModelRange;
    /**
     * Checks whether a given {@link module:engine/model/range~ModelRange range} is a valid range for
     * the {@link #selection document's selection}.
     *
     * @internal
     * @param range A range to check.
     * @returns `true` if `range` is valid, `false` otherwise.
     */
    _validateSelectionRange(range: ModelRange): boolean;
    /**
     * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
     *
     * @param writer The writer on which post-fixer callbacks will be called.
     */
    private _callPostFixers;
}
/**
 * Fired after each {@link module:engine/model/model~Model#enqueueChange `enqueueChange()` block} or the outermost
 * {@link module:engine/model/model~Model#change `change()` block} was executed and the document was changed
 * during that block's execution.
 *
 * The changes which this event will cover include:
 *
 * * document structure changes,
 * * selection changes,
 * * marker changes.
 *
 * If you want to be notified about all these changes, then simply listen to this event like this:
 *
 * ```ts
 * model.document.on( 'change', () => {
 * 	console.log( 'The document has changed!' );
 * } );
 * ```
 *
 * If, however, you only want to be notified about the data changes, then use `change:data` event,
 * which is fired for document structure changes and marker changes (which affects the data).
 *
 * ```ts
 * model.document.on( 'change:data', () => {
 * 	console.log( 'The data has changed!' );
 * } );
 * ```
 *
 * @eventName ~ModelDocument#change
 * @eventName ~ModelDocument#change:data
 * @param batch The batch that was used in the executed changes block.
 */
export type ModelDocumentChangeEvent = {
    name: 'change' | 'change:data';
    args: [batch: Batch];
};
/**
 * Callback passed as an argument to the {@link module:engine/model/document~ModelDocument#registerPostFixer} method.
 */
export type ModelPostFixer = (writer: ModelWriter) => boolean;
export {};

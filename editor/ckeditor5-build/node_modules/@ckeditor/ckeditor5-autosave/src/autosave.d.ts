/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module autosave/autosave
 */
import { Plugin, PendingActions, type Editor } from 'ckeditor5/src/core.js';
/**
 * The {@link module:autosave/autosave~Autosave} plugin allows you to automatically save the data (e.g. send it to the server)
 * when needed (when the user changed the content).
 *
 * It listens to the {@link module:engine/model/document~ModelDocument#event:change:data `editor.model.document#change:data`}
 * and `window#beforeunload` events and calls the
 * {@link module:autosave/autosave~AutosaveAdapter#save `config.autosave.save()`} function.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		plugins: [ ArticlePluginSet, Autosave ],
 * 		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
 * 		image: {
 * 			toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ],
 * 		},
 * 		autosave: {
 * 			save( editor: Editor ) {
 * 				// The saveData() function must return a promise
 * 				// which should be resolved when the data is successfully saved.
 * 				return saveData( editor.getData() );
 * 			}
 * 		}
 * 	} );
 * ```
 *
 * Read more about this feature in the {@glink features/autosave Autosave} feature guide.
 */
export declare class Autosave extends Plugin {
    /**
     * The adapter is an object with a `save()` method. That method will be called whenever
     * the data changes. It might be called some time after the change,
     * since the event is throttled for performance reasons.
     */
    adapter?: AutosaveAdapter;
    /**
     * The state of this plugin.
     *
     * The plugin can be in the following states:
     *
     * * synchronized &ndash; When all changes are saved.
     * * waiting &ndash; When the plugin is waiting for other changes before calling `adapter#save()` and `config.autosave.save()`.
     * * saving &ndash; When the provided save method is called and the plugin waits for the response.
     * * error &ndash When the provided save method will throw an error. This state immediately changes to the `saving` state and
     * the save method will be called again in the short period of time.
     *
     * @observable
     * @readonly
     */
    state: 'synchronized' | 'waiting' | 'saving' | 'error';
    /**
     * Debounced save method. The `save()` method is called the specified `waitingTime` after `debouncedSave()` is called,
     * unless a new action happens in the meantime.
     */
    private _debouncedSave;
    /**
     * The last saved document version.
     */
    private _lastDocumentVersion;
    /**
     * Promise used for asynchronous save calls.
     *
     * Created to handle the autosave call to an external data source. It resolves when that call is finished. It is re-used if
     * save is called before the promise has been resolved. It is set to `null` if there is no call in progress.
     */
    private _savePromise;
    /**
     * DOM emitter.
     */
    private _domEmitter;
    /**
     * The configuration of this plugins.
     */
    private _config;
    /**
     * Editor's pending actions manager.
     */
    private _pendingActions;
    /**
     * Informs whether there should be another autosave callback performed, immediately after current autosave callback finishes.
     *
     * This is set to `true` when there is a save request while autosave callback is already being processed
     * and the model has changed since the last save.
     */
    private _makeImmediateSave;
    /**
     * An action that will be added to the pending action manager for actions happening in that plugin.
     */
    private _action;
    /**
     * @inheritDoc
     */
    static get pluginName(): "Autosave";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof PendingActions];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Immediately calls autosave callback. All previously queued (debounced) callbacks are cleared. If there is already an autosave
     * callback in progress, then the requested save will be performed immediately after the current callback finishes.
     *
     * @returns A promise that will be resolved when the autosave callback is finished.
     */
    save(): Promise<void>;
    /**
     * Invokes the remaining `_save()` method call.
     */
    private _flush;
    /**
     * If the adapter is set and a new document version exists,
     * the `_save()` method creates a pending action and calls the `adapter.save()` method.
     * It waits for the result and then removes the created pending action.
     *
     * @returns A promise that will be resolved when the autosave callback is finished.
     */
    private _save;
    /**
     * Creates a pending action if it is not set already.
     */
    private _setPendingAction;
    /**
     * Saves callbacks.
     */
    private get _saveCallbacks();
}
/**
 * An interface that requires the `save()` method.
 *
 * Used by {@link module:autosave/autosave~Autosave#adapter}.
 */
export interface AutosaveAdapter {
    /**
     * The method that will be called when the data changes. It should return a promise (e.g. in case of saving content to the database),
     * so the autosave plugin will wait for that action before removing it from pending actions.
     */
    save(editor: Editor): Promise<unknown>;
}
/**
 * The configuration of the {@link module:autosave/autosave~Autosave autosave feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		autosave: {
 * 			save( editor: Editor ) {
 * 				// The saveData() function must return a promise
 * 				// which should be resolved when the data is successfully saved.
 * 				return saveData( editor.getData() );
 * 			}
 * 		}
 * 	} );
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * See also the demo of the {@glink features/autosave autosave feature}.
 */
export interface AutosaveConfig {
    /**
     * The callback to be executed when the data needs to be saved.
     *
     * This function must return a promise which should be resolved when the data is successfully saved.
     *
     * ```ts
     * ClassicEditor
     * 	.create( editorElement, {
     * 		autosave: {
     * 			save( editor: Editor ) {
     * 				return saveData( editor.getData() );
     * 			}
     * 		}
     * 	} );
     * 	.then( ... )
     * 	.catch( ... );
     * ```
     */
    save?: (editor: Editor) => Promise<unknown>;
    /**
     * The minimum amount of time that needs to pass after the last action to call the provided callback.
     * By default it is 1000 ms.
     *
     * ```ts
     * ClassicEditor
     * 	.create( editorElement, {
     * 		autosave: {
     * 			save( editor: Editor ) {
     * 				return saveData( editor.getData() );
     * 			},
     * 			waitingTime: 2000
     * 		}
     * 	} );
     * 	.then( ... )
     * 	.catch( ... );
     * ```
     */
    waitingTime?: number;
}

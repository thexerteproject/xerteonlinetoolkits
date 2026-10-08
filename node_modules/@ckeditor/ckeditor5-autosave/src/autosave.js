/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module autosave/autosave
 */
import { Plugin, PendingActions } from 'ckeditor5/src/core.js';
import { DomEmitterMixin } from 'ckeditor5/src/utils.js';
import { debounce } from 'es-toolkit/compat';
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
export class Autosave extends Plugin {
    /**
     * The adapter is an object with a `save()` method. That method will be called whenever
     * the data changes. It might be called some time after the change,
     * since the event is throttled for performance reasons.
     */
    adapter;
    /**
     * Debounced save method. The `save()` method is called the specified `waitingTime` after `debouncedSave()` is called,
     * unless a new action happens in the meantime.
     */
    _debouncedSave;
    /**
     * The last saved document version.
     */
    _lastDocumentVersion;
    /**
     * Promise used for asynchronous save calls.
     *
     * Created to handle the autosave call to an external data source. It resolves when that call is finished. It is re-used if
     * save is called before the promise has been resolved. It is set to `null` if there is no call in progress.
     */
    _savePromise;
    /**
     * DOM emitter.
     */
    _domEmitter;
    /**
     * The configuration of this plugins.
     */
    _config;
    /**
     * Editor's pending actions manager.
     */
    _pendingActions;
    /**
     * Informs whether there should be another autosave callback performed, immediately after current autosave callback finishes.
     *
     * This is set to `true` when there is a save request while autosave callback is already being processed
     * and the model has changed since the last save.
     */
    _makeImmediateSave;
    /**
     * An action that will be added to the pending action manager for actions happening in that plugin.
     */
    _action = null;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Autosave';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return [PendingActions];
    }
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        const config = editor.config.get('autosave') || {};
        // A minimum amount of time that needs to pass after the last action.
        // After that time the provided save callbacks are being called.
        const waitingTime = config.waitingTime || 1000;
        this.set('state', 'synchronized');
        this._debouncedSave = debounce(this._save.bind(this), waitingTime);
        this._lastDocumentVersion = editor.model.document.version;
        this._savePromise = null;
        this._domEmitter = new (DomEmitterMixin())();
        this._config = config;
        this._pendingActions = editor.plugins.get(PendingActions);
        this._makeImmediateSave = false;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const doc = editor.model.document;
        // Add the listener only after the editor is initialized to prevent firing save callback on data init.
        this.listenTo(editor, 'ready', () => {
            this.listenTo(doc, 'change:data', (evt, batch) => {
                if (!this._saveCallbacks.length) {
                    return;
                }
                if (!batch.isLocal) {
                    return;
                }
                if (this.state === 'synchronized') {
                    this.state = 'waiting';
                    // Set pending action already when we are waiting for the autosave callback.
                    this._setPendingAction();
                }
                if (this.state === 'waiting') {
                    this._debouncedSave();
                }
                // If the plugin is in `saving` state, it will change its state later basing on the `document.version`.
                // If the `document.version` will be higher than stored `#_lastDocumentVersion`, then it means, that some `change:data`
                // event has fired in the meantime.
            });
        });
        // Flush on the editor's destroy listener with the highest priority to ensure that
        // `editor.getData()` will be called before plugins are destroyed.
        this.listenTo(editor, 'destroy', () => this._flush(), { priority: 'highest' });
        // It's not possible to easy test it because karma uses `beforeunload` event
        // to warn before full page reload and this event cannot be dispatched manually.
        /* istanbul ignore next -- @preserve */
        this._domEmitter.listenTo(window, 'beforeunload', (evtInfo, domEvt) => {
            if (this._pendingActions.hasAny) {
                domEvt.returnValue = this._pendingActions.first.message;
            }
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        // There's no need for canceling or flushing the throttled save, as
        // it's done on the editor's destroy event with the highest priority.
        this._domEmitter.stopListening();
        super.destroy();
    }
    /**
     * Immediately calls autosave callback. All previously queued (debounced) callbacks are cleared. If there is already an autosave
     * callback in progress, then the requested save will be performed immediately after the current callback finishes.
     *
     * @returns A promise that will be resolved when the autosave callback is finished.
     */
    save() {
        this._debouncedSave.cancel();
        return this._save();
    }
    /**
     * Invokes the remaining `_save()` method call.
     */
    _flush() {
        this._debouncedSave.flush();
    }
    /**
     * If the adapter is set and a new document version exists,
     * the `_save()` method creates a pending action and calls the `adapter.save()` method.
     * It waits for the result and then removes the created pending action.
     *
     * @returns A promise that will be resolved when the autosave callback is finished.
     */
    _save() {
        if (this._savePromise) {
            this._makeImmediateSave = this.editor.model.document.version > this._lastDocumentVersion;
            return this._savePromise;
        }
        // Make sure there is a pending action (in case if `_save()` was called through manual `save()` call).
        this._setPendingAction();
        this.state = 'saving';
        this._lastDocumentVersion = this.editor.model.document.version;
        // Wait one promise cycle to be sure that save callbacks are not called inside a conversion or when the editor's state changes.
        this._savePromise = Promise.resolve()
            // Make autosave callback.
            .then(() => Promise.all(this._saveCallbacks.map(cb => cb(this.editor))))
            // When the autosave callback is finished, always clear `this._savePromise`, no matter if it was successful or not.
            .finally(() => {
            this._savePromise = null;
        })
            // If the save was successful, we have three scenarios:
            //
            // 1. If a save was requested when an autosave callback was already processed, we need to immediately call
            // another autosave callback. In this case, `this._savePromise` will not be resolved until the next callback is done.
            // 2. Otherwise, if changes happened to the model, make a delayed autosave callback (like the change just happened).
            // 3. If no changes happened to the model, return to the `synchronized` state.
            .then(() => {
            if (this._makeImmediateSave) {
                this._makeImmediateSave = false;
                // Start another autosave callback. Return a promise that will be resolved after the new autosave callback.
                // This way promises returned by `_save()` will not be resolved until all changes are saved.
                //
                // If `save()` was called when another (most often automatic) autosave callback was already processed,
                // the promise returned by `save()` call will be resolved only after new changes have been saved.
                //
                // Note that it would not work correctly if `this._savePromise` is not cleared.
                return this._save();
            }
            else {
                if (this.editor.model.document.version > this._lastDocumentVersion) {
                    this.state = 'waiting';
                    this._debouncedSave();
                }
                else {
                    this.state = 'synchronized';
                    this._pendingActions.remove(this._action);
                    this._action = null;
                }
            }
        })
            // In case of an error, retry the autosave callback after a delay (and also throw the original error).
            .catch(err => {
            // Change state to `error` so that listeners handling autosave error can be called.
            this.state = 'error';
            // Then, immediately change to the `saving` state as described above.
            // Being in the `saving` state ensures that the autosave callback won't be delayed further by the `change:data` listener.
            this.state = 'saving';
            this._debouncedSave();
            throw err;
        });
        return this._savePromise;
    }
    /**
     * Creates a pending action if it is not set already.
     */
    _setPendingAction() {
        const t = this.editor.t;
        if (!this._action) {
            this._action = this._pendingActions.add(t('Saving changes'));
        }
    }
    /**
     * Saves callbacks.
     */
    get _saveCallbacks() {
        const saveCallbacks = [];
        if (this.adapter && this.adapter.save) {
            saveCallbacks.push(this.adapter.save);
        }
        if (this._config.save) {
            saveCallbacks.push(this._config.save);
        }
        return saveCallbacks;
    }
}

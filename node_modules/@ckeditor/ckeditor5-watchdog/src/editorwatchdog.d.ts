/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Watchdog, type WatchdogConfig } from './watchdog.js';
import type { CKEditorError } from '@ckeditor/ckeditor5-utils';
import type { Editor, EditorConfig, Context } from '@ckeditor/ckeditor5-core';
/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export declare class EditorWatchdog<TEditor extends Editor = Editor> extends Watchdog {
    /**
     * The current editor instance.
     */
    private _editor;
    /**
     * A promise associated with the life cycle of the editor (creation or destruction processes).
     *
     * It is used to prevent the initialization of the editor if the previous instance has not been destroyed yet,
     * and conversely, to prevent the destruction of the editor if it has not been initialized.
     */
    private _lifecyclePromise;
    /**
     * Throttled save method. The `save()` method is called the specified `saveInterval` after `throttledSave()` is called,
     * unless a new action happens in the meantime.
     */
    private _throttledSave;
    /**
     * The latest saved editor data represented as a root name -> root data object.
     */
    private _data?;
    /**
     * The last document version.
     */
    private _lastDocumentVersion?;
    /**
     * The editor source element or data.
     */
    private _elementOrData?;
    /**
     * Specifies whether the editor was initialized using document data (`true`) or HTML elements (`false`).
     */
    private _initUsingData;
    /**
     * The latest record of the editor editable elements. Used to restart the editor.
     */
    private _editables;
    /**
     * The editor configuration.
     */
    private _config?;
    /**
     * The creation method.
     *
     * @see #setCreator
     */
    protected _creator: EditorWatchdogCreatorFunction<TEditor>;
    /**
     * The destruction method.
     *
     * @see #setDestructor
     */
    protected _destructor: (editor: Editor) => Promise<unknown>;
    private _excludedProps?;
    /**
     * @param Editor The editor class.
     * @param watchdogConfig The watchdog plugin configuration.
     */
    constructor(Editor: {
        create(...args: any): Promise<TEditor>;
    } | null, watchdogConfig?: WatchdogConfig);
    /**
     * The current editor instance.
     */
    get editor(): TEditor | null;
    /**
     * @internal
     */
    get _item(): TEditor | null;
    /**
     * Sets the function that is responsible for the editor creation.
     * It expects a function that should return a promise.
     *
     * ```ts
     * watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
     * ```
     */
    setCreator(creator: EditorWatchdogCreatorFunction<TEditor>): void;
    /**
     * Sets the function that is responsible for the editor destruction.
     * Overrides the default destruction function, which destroys only the editor instance.
     * It expects a function that should return a promise or `undefined`.
     *
     * ```ts
     * watchdog.setDestructor( editor => {
     * 	// Do something before the editor is destroyed.
     *
     * 	return editor
     * 		.destroy()
     * 		.then( () => {
     * 			// Do something after the editor is destroyed.
     * 		} );
     * } );
     * ```
     */
    setDestructor(destructor: (editor: Editor) => Promise<unknown>): void;
    /**
     * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
     * the state to `initializing`.
     *
     * @fires restart
     */
    protected _restart(): Promise<unknown>;
    /**
     * Creates the editor instance and keeps it running, using the defined creator and destructor.
     *
     * @param elementOrData The editor source element or the editor data.
     * @param config The editor configuration.
     * @param context A context for the editor.
     */
    create(elementOrData?: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>, config?: EditorConfig, context?: Context): Promise<unknown>;
    /**
     * Destroys the watchdog and the current editor instance. It fires the callback
     * registered in {@link #setDestructor `setDestructor()`} and uses it to destroy the editor instance.
     * It also sets the state to `destroyed`.
     */
    destroy(): Promise<unknown>;
    private _destroy;
    /**
     * Saves the editor data, so it can be restored after the crash even if the data cannot be fetched at
     * the moment of the crash.
     */
    private _save;
    /**
     * @internal
     */
    _setExcludedProperties(props: Set<unknown>): void;
    /**
     * Gets all data that is required to reinitialize editor instance.
     */
    private _getData;
    /**
     * For each attached model root, returns its HTML editable element (if available).
     */
    private _getEditables;
    /**
     * Traverses the error context and the current editor to find out whether these structures are connected
     * to each other via properties.
     *
     * @internal
     */
    _isErrorComingFromThisItem(error: CKEditorError): boolean;
    /**
     * Clones the editor configuration.
     */
    private _cloneEditorConfiguration;
}
/**
 * @internal
 */
export type EditorData = {
    roots: Record<string, {
        content: string;
        attributes: string;
        isLoaded: boolean;
    }>;
    markers: Record<string, {
        rangeJSON: {
            start: any;
            end: any;
        };
        usingOperation: boolean;
        affectsData: boolean;
    }>;
    commentThreads: string;
    suggestions: string;
};
/**
 * Fired after the watchdog restarts the error in case of a crash.
 *
 * @eventName ~EditorWatchdog#restart
 */
export type EditorWatchdogRestartEvent = {
    name: 'restart';
    args: [];
    return: undefined;
};
export type EditorWatchdogCreatorFunction<TEditor = Editor> = (elementOrData: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>, config: EditorConfig) => Promise<TEditor>;

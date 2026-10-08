/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module watchdog/contextwatchdog
 */
import { Watchdog, type WatchdogConfig, type WatchdogState } from './watchdog.js';
import { EditorWatchdog, type EditorWatchdogCreatorFunction } from './editorwatchdog.js';
import type { ArrayOrItem, CKEditorError } from '@ckeditor/ckeditor5-utils';
import type { Context, Editor, EditorConfig, ContextConfig } from '@ckeditor/ckeditor5-core';
/**
 * A watchdog for the {@link module:core/context~Context} class.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export declare class ContextWatchdog<TContext extends Context = Context> extends Watchdog {
    /**
     * A map of internal watchdogs for added items.
     */
    protected _watchdogs: Map<string, EditorWatchdog<Editor>>;
    /**
     * The watchdog configuration.
     */
    private readonly _watchdogConfig;
    /**
     * The current context instance.
     */
    private _context;
    /**
     * Context properties (nodes/references) that are gathered during the initial context creation
     * and are used to distinguish the origin of an error.
     */
    private _contextProps;
    /**
     * An action queue, which is used to handle async functions queuing.
     */
    private _actionQueues;
    /**
     * The configuration for the {@link module:core/context~Context}.
     */
    private _contextConfig?;
    /**
     * The creation method.
     *
     * @see #setCreator
     */
    protected _creator: (config: ContextConfig) => Promise<TContext>;
    /**
     * The destruction method.
     *
     * @see #setDestructor
     */
    protected _destructor: (context: Context) => Promise<unknown>;
    /**
     * The watched item.
     */
    _item: unknown;
    /**
     * The context watchdog class constructor.
     *
     * ```ts
     * const watchdog = new ContextWatchdog( Context );
     *
     * await watchdog.create( contextConfiguration );
     *
     * await watchdog.add( item );
     * ```
     *
     * See the {@glink features/watchdog Watchdog feature guide} to learn more how to use this feature.
     *
     * @param Context The {@link module:core/context~Context} class.
     * @param watchdogConfig The watchdog configuration.
     */
    constructor(Context: {
        create(...args: any): Promise<TContext>;
    }, watchdogConfig?: WatchdogConfig);
    /**
     * Sets the function that is responsible for the context creation.
     * It expects a function that should return a promise (or `undefined`).
     *
     * ```ts
     * watchdog.setCreator( config => Context.create( config ) );
     * ```
     */
    setCreator(creator: (config: ContextConfig) => Promise<TContext>): void;
    /**
     * Sets the function that is responsible for the context destruction.
     * Overrides the default destruction function, which destroys only the context instance.
     * It expects a function that should return a promise (or `undefined`).
     *
     * ```ts
     * watchdog.setDestructor( context => {
     * 	// Do something before the context is destroyed.
     *
     * 	return context
     * 		.destroy()
     * 		.then( () => {
     * 			// Do something after the context is destroyed.
     * 		} );
     * } );
     * ```
     */
    setDestructor(destructor: (context: Context) => Promise<unknown>): void;
    /**
     * The context instance. Keep in mind that this property might be changed when the context watchdog restarts,
     * so do not keep this instance internally. Always operate on the `ContextWatchdog#context` property.
     */
    get context(): Context | null;
    /**
     * Initializes the context watchdog. Once it is created, the watchdog takes care about
     * recreating the context and the provided items, and starts the error handling mechanism.
     *
     * ```ts
     * await watchdog.create( {
     * 	plugins: []
     * } );
     * ```
     *
     * @param contextConfig The context configuration. See {@link module:core/context~Context}.
     */
    create(contextConfig?: ContextConfig): Promise<unknown>;
    /**
     * Returns an item instance with the given `itemId`.
     *
     * ```ts
     * const editor1 = watchdog.getItem( 'editor1' );
     * ```
     *
     * @param itemId The item ID.
     * @returns The item instance or `undefined` if an item with a given ID has not been found.
     */
    getItem(itemId: string): unknown;
    /**
     * Gets the state of the given item. See {@link #state} for a list of available states.
     *
     * ```ts
     * const editor1State = watchdog.getItemState( 'editor1' );
     * ```
     *
     * @param itemId Item ID.
     * @returns The state of the item.
     */
    getItemState(itemId: string): WatchdogState;
    /**
     * Adds items to the watchdog. Once created, instances of these items will be available using the {@link #getItem} method.
     *
     * Items can be passed together as an array of objects:
     *
     * ```ts
     * await watchdog.add( [ {
     * 	id: 'editor1',
     * 	type: 'editor',
     * 	sourceElementOrData: document.querySelector( '#editor' ),
     * 	config: {
     * 		plugins: [ Essentials, Paragraph, Bold, Italic ],
     * 		toolbar: [ 'bold', 'italic', 'alignment' ]
     * 	},
     * 	creator: ( element, config ) => ClassicEditor.create( element, config )
     * } ] );
     * ```
     *
     * Or one by one as objects:
     *
     * ```ts
     * await watchdog.add( {
     * 	id: 'editor1',
     * 	type: 'editor',
     * 	sourceElementOrData: document.querySelector( '#editor' ),
     * 	config: {
     * 		plugins: [ Essentials, Paragraph, Bold, Italic ],
     * 		toolbar: [ 'bold', 'italic', 'alignment' ]
     * 	},
     * 	creator: ( element, config ) => ClassicEditor.create( element, config )
     * ] );
     * ```
     *
     * Then an instance can be retrieved using the {@link #getItem} method:
     *
     * ```ts
     * const editor1 = watchdog.getItem( 'editor1' );
     * ```
     *
     * Note that this method can be called multiple times, but for performance reasons it is better
     * to pass all items together.
     *
     * @param itemConfigurationOrItemConfigurations An item configuration object or an array of item configurations.
     */
    add(itemConfigurationOrItemConfigurations: ArrayOrItem<ContextWatchdogItemConfiguration>): Promise<unknown>;
    /**
     * Removes and destroys item(s) with given ID(s).
     *
     * ```ts
     * await watchdog.remove( 'editor1' );
     * ```
     *
     * Or
     *
     * ```ts
     * await watchdog.remove( [ 'editor1', 'editor2' ] );
     * ```
     *
     * @param itemIdOrItemIds Item ID or an array of item IDs.
     */
    remove(itemIdOrItemIds: ArrayOrItem<string>): Promise<unknown>;
    /**
     * Destroys the context watchdog and all added items.
     * Once the context watchdog is destroyed, new items cannot be added.
     *
     * ```ts
     * await watchdog.destroy();
     * ```
     */
    destroy(): Promise<unknown>;
    /**
     * Restarts the context watchdog.
     */
    protected _restart(): Promise<unknown>;
    /**
     * Initializes the context watchdog.
     */
    private _create;
    /**
     * Destroys the context instance and all added items.
     */
    private _destroy;
    /**
     * Returns the watchdog for a given item ID.
     *
     * @param itemId Item ID.
     */
    protected _getWatchdog(itemId: string): Watchdog;
    /**
     * Checks whether an error comes from the context instance and not from the item instances.
     *
     * @internal
     */
    _isErrorComingFromThisItem(error: CKEditorError): boolean;
}
/**
 * Fired after the watchdog restarts the context and the added items because of a crash.
 *
 * ```ts
 * watchdog.on( 'restart', () => {
 * 	console.log( 'The context has been restarted.' );
 * } );
 * ```
 *
 * @eventName ~ContextWatchdog#restart
 */
export type ContextWatchdogRestartEvent = {
    name: 'restart';
    args: [];
    return: undefined;
};
/**
 * Fired when a new error occurred in one of the added items.
 *
 * ```ts
 * watchdog.on( 'itemError', ( evt, { error, itemId } ) => {
 * 	console.log( `An error occurred in an item with the '${ itemId }' ID.` );
 * } );
 * ```
 *
 * @eventName ~ContextWatchdog#itemError
 */
export type ContextWatchdogItemErrorEvent = {
    name: 'itemError';
    args: [ContextWatchdogItemErrorEventData];
    return: undefined;
};
/**
 * The `itemError` event data.
 */
export type ContextWatchdogItemErrorEventData = {
    itemId: string;
    error: Error;
};
/**
 * Fired after an item has been restarted.
 *
 * ```ts
 * 	watchdog.on( 'itemRestart', ( evt, { itemId } ) => {
 *		console.log( 'An item with with the '${ itemId }' ID has been restarted.' );
 * 	} );
 * ```
 *
 * @eventName ~ContextWatchdog#itemRestart
 */
export type ContextWatchdogItemRestartEvent = {
    name: 'itemRestart';
    args: [ContextWatchdogItemRestartEventData];
    return: undefined;
};
/**
 * The `itemRestart` event data.
 */
export type ContextWatchdogItemRestartEventData = {
    itemId: string;
};
/**
 * The watchdog item configuration interface.
 */
export interface ContextWatchdogItemConfiguration {
    /**
     * id A unique item identificator.
     */
    id: string;
    /**
     * The type of the item to create. At the moment, only `'editor'` is supported.
     */
    type: 'editor';
    /**
     * A function that initializes the item (the editor). The function takes editor initialization arguments
     * and should return a promise. For example: `( el, config ) => ClassicEditor.create( el, config )`.
     */
    creator: EditorWatchdogCreatorFunction;
    /**
     * A function that destroys the item instance (the editor). The function
     * takes an item and should return a promise. For example: `editor => editor.destroy()`
     */
    destructor?: (editor: Editor) => Promise<unknown>;
    /**
     * The source element or data that will be passed
     * as the first argument to the `Editor.create()` method.
     */
    sourceElementOrData: string | HTMLElement;
    /**
     * An editor configuration.
     */
    config: EditorConfig;
}

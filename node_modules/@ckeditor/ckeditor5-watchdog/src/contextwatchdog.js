/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module watchdog/contextwatchdog
 */
import { Watchdog } from './watchdog.js';
import { EditorWatchdog } from './editorwatchdog.js';
import { areConnectedThroughProperties } from './utils/areconnectedthroughproperties.js';
import { getSubNodes } from './utils/getsubnodes.js';
const mainQueueId = Symbol('MainQueueId');
/**
 * A watchdog for the {@link module:core/context~Context} class.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export class ContextWatchdog extends Watchdog {
    /**
     * A map of internal watchdogs for added items.
     */
    _watchdogs = new Map();
    /**
     * The watchdog configuration.
     */
    _watchdogConfig;
    /**
     * The current context instance.
     */
    _context = null;
    /**
     * Context properties (nodes/references) that are gathered during the initial context creation
     * and are used to distinguish the origin of an error.
     */
    _contextProps = new Set();
    /**
     * An action queue, which is used to handle async functions queuing.
     */
    _actionQueues = new ActionQueues();
    /**
     * The configuration for the {@link module:core/context~Context}.
     */
    _contextConfig;
    /**
     * The watched item.
     */
    _item;
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
    constructor(Context, watchdogConfig = {}) {
        super(watchdogConfig);
        this._watchdogConfig = watchdogConfig;
        // Default creator and destructor.
        this._creator = contextConfig => Context.create(contextConfig);
        this._destructor = context => context.destroy();
        this._actionQueues.onEmpty(() => {
            if (this.state === 'initializing') {
                this.state = 'ready';
                this._fire('stateChange');
            }
        });
    }
    /**
     * Sets the function that is responsible for the context creation.
     * It expects a function that should return a promise (or `undefined`).
     *
     * ```ts
     * watchdog.setCreator( config => Context.create( config ) );
     * ```
     */
    setCreator(creator) {
        this._creator = creator;
    }
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
    setDestructor(destructor) {
        this._destructor = destructor;
    }
    /**
     * The context instance. Keep in mind that this property might be changed when the context watchdog restarts,
     * so do not keep this instance internally. Always operate on the `ContextWatchdog#context` property.
     */
    get context() {
        return this._context;
    }
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
    create(contextConfig = {}) {
        return this._actionQueues.enqueue(mainQueueId, () => {
            this._contextConfig = contextConfig;
            return this._create();
        });
    }
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
    getItem(itemId) {
        const watchdog = this._getWatchdog(itemId);
        return watchdog._item;
    }
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
    getItemState(itemId) {
        const watchdog = this._getWatchdog(itemId);
        return watchdog.state;
    }
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
    add(itemConfigurationOrItemConfigurations) {
        const itemConfigurations = toArray(itemConfigurationOrItemConfigurations);
        return Promise.all(itemConfigurations.map(item => {
            return this._actionQueues.enqueue(item.id, () => {
                if (this.state === 'destroyed') {
                    throw new Error('Cannot add items to destroyed watchdog.');
                }
                if (!this._context) {
                    throw new Error('Context was not created yet. You should call the `ContextWatchdog#create()` method first.');
                }
                let watchdog;
                if (this._watchdogs.has(item.id)) {
                    throw new Error(`Item with the given id is already added: '${item.id}'.`);
                }
                if (item.type === 'editor') {
                    watchdog = new EditorWatchdog(null, this._watchdogConfig);
                    watchdog.setCreator(item.creator);
                    watchdog._setExcludedProperties(this._contextProps);
                    if (item.destructor) {
                        watchdog.setDestructor(item.destructor);
                    }
                    this._watchdogs.set(item.id, watchdog);
                    // Enqueue the internal watchdog errors within the main queue.
                    // And propagate the internal `error` events as `itemError` event.
                    watchdog.on('error', (evt, { error, causesRestart }) => {
                        this._fire('itemError', { itemId: item.id, error });
                        // Do not enqueue the item restart action if the item will not restart.
                        if (!causesRestart) {
                            return;
                        }
                        this._actionQueues.enqueue(item.id, () => new Promise(res => {
                            const rethrowRestartEventOnce = () => {
                                watchdog.off('restart', rethrowRestartEventOnce);
                                this._fire('itemRestart', { itemId: item.id });
                                res();
                            };
                            watchdog.on('restart', rethrowRestartEventOnce);
                        }));
                    });
                    return watchdog.create(item.sourceElementOrData, item.config, this._context);
                }
                else {
                    throw new Error(`Not supported item type: '${item.type}'.`);
                }
            });
        }));
    }
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
    remove(itemIdOrItemIds) {
        const itemIds = toArray(itemIdOrItemIds);
        return Promise.all(itemIds.map(itemId => {
            return this._actionQueues.enqueue(itemId, () => {
                const watchdog = this._getWatchdog(itemId);
                this._watchdogs.delete(itemId);
                return watchdog.destroy();
            });
        }));
    }
    /**
     * Destroys the context watchdog and all added items.
     * Once the context watchdog is destroyed, new items cannot be added.
     *
     * ```ts
     * await watchdog.destroy();
     * ```
     */
    destroy() {
        return this._actionQueues.enqueue(mainQueueId, () => {
            this.state = 'destroyed';
            this._fire('stateChange');
            super.destroy();
            return this._destroy();
        });
    }
    /**
     * Restarts the context watchdog.
     */
    _restart() {
        return this._actionQueues.enqueue(mainQueueId, () => {
            this.state = 'initializing';
            this._fire('stateChange');
            return this._destroy()
                .catch(err => {
                console.error('An error happened during destroying the context or items.', err);
            })
                .then(() => this._create())
                .then(() => this._fire('restart'));
        });
    }
    /**
     * Initializes the context watchdog.
     */
    _create() {
        return Promise.resolve()
            .then(() => {
            this._startErrorHandling();
            return this._creator(this._contextConfig);
        })
            .then(context => {
            this._context = context;
            this._contextProps = getSubNodes(this._context);
            return Promise.all(Array.from(this._watchdogs.values())
                .map(watchdog => {
                watchdog._setExcludedProperties(this._contextProps);
                return watchdog.create(undefined, undefined, this._context);
            }));
        });
    }
    /**
     * Destroys the context instance and all added items.
     */
    _destroy() {
        return Promise.resolve()
            .then(() => {
            this._stopErrorHandling();
            const context = this._context;
            this._context = null;
            this._contextProps = new Set();
            return Promise.all(Array.from(this._watchdogs.values())
                .map(watchdog => watchdog.destroy()))
                // Context destructor destroys each editor.
                .then(() => this._destructor(context));
        });
    }
    /**
     * Returns the watchdog for a given item ID.
     *
     * @param itemId Item ID.
     */
    _getWatchdog(itemId) {
        const watchdog = this._watchdogs.get(itemId);
        if (!watchdog) {
            throw new Error(`Item with the given id was not registered: ${itemId}.`);
        }
        return watchdog;
    }
    /**
     * Checks whether an error comes from the context instance and not from the item instances.
     *
     * @internal
     */
    _isErrorComingFromThisItem(error) {
        for (const watchdog of this._watchdogs.values()) {
            if (watchdog._isErrorComingFromThisItem(error)) {
                return false;
            }
        }
        return areConnectedThroughProperties(this._context, error.context);
    }
}
/**
 * Manager of action queues that allows queuing async functions.
 */
class ActionQueues {
    _onEmptyCallbacks = [];
    _queues = new Map();
    _activeActions = 0;
    /**
     * Used to register callbacks that will be run when the queue becomes empty.
     *
     * @param onEmptyCallback A callback that will be run whenever the queue becomes empty.
     */
    onEmpty(onEmptyCallback) {
        this._onEmptyCallbacks.push(onEmptyCallback);
    }
    /**
     * It adds asynchronous actions (functions) to the proper queue and runs them one by one.
     *
     * @param queueId The action queue ID.
     * @param action A function that should be enqueued.
     */
    enqueue(queueId, action) {
        const isMainAction = queueId === mainQueueId;
        this._activeActions++;
        if (!this._queues.get(queueId)) {
            this._queues.set(queueId, Promise.resolve());
        }
        // List all sources of actions that the current action needs to await for.
        // For the main action wait for all other actions.
        // For the item action wait only for the item queue and the main queue.
        const awaitedActions = isMainAction ?
            Promise.all(this._queues.values()) :
            Promise.all([this._queues.get(mainQueueId), this._queues.get(queueId)]);
        const queueWithAction = awaitedActions.then(action);
        // Catch all errors in the main queue to stack promises even if an error occurred in the past.
        const nonErrorQueue = queueWithAction.catch(() => { });
        this._queues.set(queueId, nonErrorQueue);
        return queueWithAction.finally(() => {
            this._activeActions--;
            if (this._queues.get(queueId) === nonErrorQueue && this._activeActions === 0) {
                this._onEmptyCallbacks.forEach(cb => cb());
            }
        });
    }
}
/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @param elementOrArray The value to transform to an array.
 * @returns An array created from data.
 */
function toArray(elementOrArray) {
    return Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
}

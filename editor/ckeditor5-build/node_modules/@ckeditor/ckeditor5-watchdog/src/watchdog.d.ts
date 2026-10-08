/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module watchdog/watchdog
 */
import type { CKEditorError } from '@ckeditor/ckeditor5-utils';
import type { EditorWatchdogRestartEvent } from './editorwatchdog.js';
import type { ContextWatchdogItemErrorEvent, ContextWatchdogItemRestartEvent } from './contextwatchdog.js';
/**
 * An abstract watchdog class that handles most of the error handling process and the state of the underlying component.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and how to use it.
 *
 * @internal
 */
export declare abstract class Watchdog {
    /**
     * An array of crashes saved as an object with the following properties:
     *
     * * `message`: `String`,
     * * `stack`: `String`,
     * * `date`: `Number`,
     * * `filename`: `String | undefined`,
     * * `lineno`: `Number | undefined`,
     * * `colno`: `Number | undefined`,
     */
    readonly crashes: Array<{
        message: string;
        stack?: string;
        date: number;
        filename?: string;
        lineno?: number;
        colno?: number;
    }>;
    /**
     * Specifies the state of the item watched by the watchdog. The state can be one of the following values:
     *
     * * `initializing` &ndash; Before the first initialization, and after crashes, before the item is ready.
     * * `ready` &ndash; A state when the user can interact with the item.
     * * `crashed` &ndash; A state when an error occurs. It quickly changes to `initializing` or `crashedPermanently`
     * depending on how many and how frequent errors have been caught recently.
     * * `crashedPermanently` &ndash; A state when the watchdog stops reacting to errors and keeps the item it is watching crashed,
     * * `destroyed` &ndash; A state when the item is manually destroyed by the user after calling `watchdog.destroy()`.
     */
    state: WatchdogState;
    /**
     * @see module:watchdog/watchdog~WatchdogConfig
     */
    private _crashNumberLimit;
    /**
     * Returns the result of the `Date.now()` call. It can be overridden in tests to mock time as some popular
     * approaches like `sinon.useFakeTimers()` do not work well with error handling.
     */
    private _now;
    /**
     * @see module:watchdog/watchdog~WatchdogConfig
     */
    private _minimumNonErrorTimePeriod;
    /**
     * Checks if the event error comes from the underlying item and restarts the item.
     */
    private _boundErrorHandler;
    /**
     * The method responsible for restarting the watched item.
     */
    protected abstract _restart(): Promise<unknown>;
    /**
     * Traverses the error context and the watched item to find out whether the error should
     * be handled by the given item.
     *
     * @internal
     */
    abstract _isErrorComingFromThisItem(error: CKEditorError): boolean;
    /**
     * The watched item.
     *
     * @internal
     */
    abstract get _item(): unknown;
    /**
     * A dictionary of event emitter listeners.
     */
    private _listeners;
    /**
     * @param {module:watchdog/watchdog~WatchdogConfig} config The watchdog plugin configuration.
     */
    constructor(config: WatchdogConfig);
    /**
     * Destroys the watchdog and releases the resources.
     */
    destroy(): void;
    /**
     * Starts listening to a specific event name by registering a callback that will be executed
     * whenever an event with a given name fires.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     *
     * @param eventName The event name.
     * @param callback A callback which will be added to event listeners.
     */
    on<K extends keyof WatchdogEventMap>(eventName: K, callback: WatchdogEventCallback<K>): void;
    /**
     * Stops listening to the specified event name by removing the callback from event listeners.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     *
     * @param eventName The event name.
     * @param callback A callback which will be removed from event listeners.
     */
    off(eventName: keyof WatchdogEventMap, callback: unknown): void;
    /**
     * Fires an event with a given event name and arguments.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     */
    protected _fire<K extends keyof WatchdogEventMap>(eventName: K, ...args: WatchdogEventArgs<K>): void;
    /**
     * Starts error handling by attaching global error handlers.
     */
    protected _startErrorHandling(): void;
    /**
     * Stops error handling by detaching global error handlers.
     */
    protected _stopErrorHandling(): void;
    /**
     * Checks if an error comes from the watched item and restarts it.
     * It reacts to {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` errors} only.
     *
     * @fires error
     * @param error Error.
     * @param evt An error event.
     */
    private _handleError;
    /**
     * Checks whether an error should be handled by the watchdog.
     *
     * @param error An error that was caught by the error handling process.
     */
    private _shouldReactToError;
    /**
     * Checks if the watchdog should restart the underlying item.
     */
    private _shouldRestart;
}
/**
 * Fired when a new {@link module:utils/ckeditorerror~CKEditorError `CKEditorError`} error connected to the watchdog instance occurs
 * and the watchdog will react to it.
 *
 * ```ts
 * watchdog.on( 'error', ( evt, { error, causesRestart } ) => {
 * 	console.log( 'An error occurred.' );
 * } );
 * ```
 *
 * @eventName ~Watchdog#error
 */
export type WatchdogErrorEvent = {
    name: 'error';
    args: [WatchdogErrorEventData];
};
/**
 * The `error` event data.
 */
export type WatchdogErrorEventData = {
    error: Error;
    causesRestart: boolean;
};
/**
 * Fired when the watchdog state changed.
 *
 * @eventName ~Watchdog#stateChange
 */
export type WatchdogStateChangeEvent = {
    name: 'stateChange';
    args: [];
};
/**
 * The map of watchdog events.
 */
export interface WatchdogEventMap {
    stateChange: WatchdogStateChangeEvent;
    error: WatchdogErrorEvent;
    restart: EditorWatchdogRestartEvent;
    itemError: ContextWatchdogItemErrorEvent;
    itemRestart: ContextWatchdogItemRestartEvent;
}
/**
 * Utility type that gets the arguments type for the given event.
 */
export type WatchdogEventArgs<K extends keyof WatchdogEventMap> = WatchdogEventMap[K]['args'];
/**
 * Utility type that gets the callback type for the given event.
 */
export type WatchdogEventCallback<K extends keyof WatchdogEventMap> = (evt: null, ...args: WatchdogEventArgs<K>) => void;
/**
 * The watchdog plugin configuration.
 */
export interface WatchdogConfig {
    /**
     * A threshold specifying the number of watched item crashes
     * when the watchdog stops restarting the item in case of errors.
     * After this limit is reached and the time between the last errors is shorter than `minimumNonErrorTimePeriod`,
     * the watchdog changes its state to `crashedPermanently` and it stops restarting the item. This prevents an infinite restart loop.
     *
     * @default 3
     */
    crashNumberLimit?: number;
    /**
     * An average number of milliseconds between the last watched item errors
     * (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached,
     * the watchdog changes its state to `crashedPermanently` and it stops restarting the item. This prevents an infinite restart loop.
     *
     * @default 5000
     */
    minimumNonErrorTimePeriod?: number;
    /**
     * A minimum number of milliseconds between saving the editor data internally (defaults to 5000).
     * Note that for large documents this might impact the editor performance.
     *
     * @default 5000
     */
    saveInterval?: number;
}
/**
 * Specifies the state of the item watched by the watchdog.
 */
export type WatchdogState = 'initializing' | 'ready' | 'crashed' | 'crashedPermanently' | 'destroyed';

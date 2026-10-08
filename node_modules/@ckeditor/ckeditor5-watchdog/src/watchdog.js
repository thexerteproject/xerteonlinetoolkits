/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * An abstract watchdog class that handles most of the error handling process and the state of the underlying component.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and how to use it.
 *
 * @internal
 */
export class Watchdog {
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
    crashes = [];
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
    state = 'initializing';
    /**
     * @see module:watchdog/watchdog~WatchdogConfig
     */
    _crashNumberLimit;
    /**
     * Returns the result of the `Date.now()` call. It can be overridden in tests to mock time as some popular
     * approaches like `sinon.useFakeTimers()` do not work well with error handling.
     */
    _now = Date.now;
    /**
     * @see module:watchdog/watchdog~WatchdogConfig
     */
    _minimumNonErrorTimePeriod;
    /**
     * Checks if the event error comes from the underlying item and restarts the item.
     */
    _boundErrorHandler;
    /**
     * A dictionary of event emitter listeners.
     */
    _listeners;
    /**
     * @param {module:watchdog/watchdog~WatchdogConfig} config The watchdog plugin configuration.
     */
    constructor(config) {
        this.crashes = [];
        this._crashNumberLimit = typeof config.crashNumberLimit === 'number' ? config.crashNumberLimit : 3;
        this._minimumNonErrorTimePeriod = typeof config.minimumNonErrorTimePeriod === 'number' ? config.minimumNonErrorTimePeriod : 5000;
        this._boundErrorHandler = evt => {
            // `evt.error` is exposed by EventError while `evt.reason` is available in PromiseRejectionEvent.
            const error = 'error' in evt ? evt.error : evt.reason;
            // Note that `evt.reason` might be everything that is in the promise rejection.
            // Similarly everything that is thrown lands in `evt.error`.
            if (error instanceof Error) {
                this._handleError(error, evt);
            }
        };
        this._listeners = {};
        if (!this._restart) {
            throw new Error('The Watchdog class was split into the abstract `Watchdog` class and the `EditorWatchdog` class. ' +
                'Please, use `EditorWatchdog` if you have used the `Watchdog` class previously.');
        }
    }
    /**
     * Destroys the watchdog and releases the resources.
     */
    destroy() {
        this._stopErrorHandling();
        this._listeners = {};
    }
    /**
     * Starts listening to a specific event name by registering a callback that will be executed
     * whenever an event with a given name fires.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     *
     * @param eventName The event name.
     * @param callback A callback which will be added to event listeners.
     */
    on(eventName, callback) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }
        this._listeners[eventName].push(callback);
    }
    /**
     * Stops listening to the specified event name by removing the callback from event listeners.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     *
     * @param eventName The event name.
     * @param callback A callback which will be removed from event listeners.
     */
    off(eventName, callback) {
        this._listeners[eventName] = this._listeners[eventName]
            .filter(cb => cb !== callback);
    }
    /**
     * Fires an event with a given event name and arguments.
     *
     * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
     */
    _fire(eventName, ...args) {
        const callbacks = this._listeners[eventName] || [];
        for (const callback of callbacks) {
            callback.apply(this, [null, ...args]);
        }
    }
    /**
     * Starts error handling by attaching global error handlers.
     */
    _startErrorHandling() {
        window.addEventListener('error', this._boundErrorHandler);
        window.addEventListener('unhandledrejection', this._boundErrorHandler);
    }
    /**
     * Stops error handling by detaching global error handlers.
     */
    _stopErrorHandling() {
        window.removeEventListener('error', this._boundErrorHandler);
        window.removeEventListener('unhandledrejection', this._boundErrorHandler);
    }
    /**
     * Checks if an error comes from the watched item and restarts it.
     * It reacts to {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` errors} only.
     *
     * @fires error
     * @param error Error.
     * @param evt An error event.
     */
    _handleError(error, evt) {
        // @if CK_DEBUG // const err = error as CKEditorError;
        // @if CK_DEBUG // if ( err.is && err.is( 'CKEditorError' ) && err.context === undefined ) {
        // @if CK_DEBUG // console.warn( 'The error is missing its context and Watchdog cannot restart the proper item.' );
        // @if CK_DEBUG // }
        if (this._shouldReactToError(error)) {
            this.crashes.push({
                message: error.message,
                stack: error.stack,
                // `evt.filename`, `evt.lineno` and `evt.colno` are available only in ErrorEvent events
                filename: evt instanceof ErrorEvent ? evt.filename : undefined,
                lineno: evt instanceof ErrorEvent ? evt.lineno : undefined,
                colno: evt instanceof ErrorEvent ? evt.colno : undefined,
                date: this._now()
            });
            const causesRestart = this._shouldRestart();
            this.state = 'crashed';
            this._fire('stateChange');
            this._fire('error', { error, causesRestart });
            if (causesRestart) {
                this._restart();
            }
            else {
                this.state = 'crashedPermanently';
                this._fire('stateChange');
            }
        }
    }
    /**
     * Checks whether an error should be handled by the watchdog.
     *
     * @param error An error that was caught by the error handling process.
     */
    _shouldReactToError(error) {
        return (error.is &&
            error.is('CKEditorError') &&
            error.context !== undefined &&
            // In some cases the watched item should not be restarted - e.g. during the item initialization.
            // That's why the `null` was introduced as a correct error context which does cause restarting.
            error.context !== null &&
            // Do not react to errors if the watchdog is in states other than `ready`.
            this.state === 'ready' &&
            this._isErrorComingFromThisItem(error));
    }
    /**
     * Checks if the watchdog should restart the underlying item.
     */
    _shouldRestart() {
        if (this.crashes.length <= this._crashNumberLimit) {
            return true;
        }
        const lastErrorTime = this.crashes[this.crashes.length - 1].date;
        const firstMeaningfulErrorTime = this.crashes[this.crashes.length - 1 - this._crashNumberLimit].date;
        const averageNonErrorTimePeriod = (lastErrorTime - firstMeaningfulErrorTime) / this._crashNumberLimit;
        return averageNonErrorTimePeriod > this._minimumNonErrorTimePeriod;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * The event object passed to event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export declare class EventInfo<TName extends string = string, TReturn = unknown> {
    /**
     * The object that fired the event.
     */
    readonly source: object;
    /**
     * The event name.
     */
    readonly name: TName;
    /**
     * Path this event has followed. See {@link module:utils/emittermixin~Emitter#delegate}.
     */
    path: Array<object>;
    /**
     * Stops the event emitter to call further callbacks for this event interaction.
     */
    readonly stop: {
        (): void;
        called?: boolean;
    };
    /**
     * Removes the current callback from future interactions of this event.
     */
    readonly off: {
        (): void;
        called?: boolean;
    };
    /**
     * The value which will be returned by {@link module:utils/emittermixin~Emitter#fire}.
     *
     * It's `undefined` by default and can be changed by an event listener:
     *
     * ```ts
     * dataController.fire( 'getSelectedContent', ( evt ) => {
     * 	// This listener will make `dataController.fire( 'getSelectedContent' )`
     * 	// always return an empty DocumentFragment.
     * 	evt.return = new DocumentFragment();
     *
     * 	// Make sure no other listeners are executed.
     * 	evt.stop();
     * } );
     * ```
     */
    return: TReturn | undefined;
    /**
     * @param source The emitter.
     * @param name The event name.
     */
    constructor(source: object, name: TName);
}

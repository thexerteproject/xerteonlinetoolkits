/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/eventinfo
 */
import { spy } from './spy.js';
/**
 * The event object passed to event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export class EventInfo {
    /**
     * The object that fired the event.
     */
    source;
    /**
     * The event name.
     */
    name;
    /**
     * Path this event has followed. See {@link module:utils/emittermixin~Emitter#delegate}.
     */
    path;
    /**
     * Stops the event emitter to call further callbacks for this event interaction.
     */
    stop;
    /**
     * Removes the current callback from future interactions of this event.
     */
    off;
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
    return;
    /**
     * @param source The emitter.
     * @param name The event name.
     */
    constructor(source, name) {
        this.source = source;
        this.name = name;
        this.path = [];
        // The following methods are defined in the constructor because they must be re-created per instance.
        this.stop = spy();
        this.off = spy();
    }
}

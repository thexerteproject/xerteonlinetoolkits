/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/emittermixin
 */
import { type Emitter, type CallbackOptions, type BaseEvent, type GetCallback } from '../emittermixin.js';
import { type EventInfo } from '../eventinfo.js';
import type { Constructor, Mixed } from '../mix.js';
/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~Emitter}.
 *
 * This function creates a class that inherits from the provided `base` and implements `Emitter` interface.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 * ```ts
 * import { DomEmitterMixin } from '../utils/dom/emittermixin.js';
 *
 * class BaseClass { ... }
 *
 * class SomeView extends DomEmitterMixin( BaseClass ) {}
 *
 * const view = new SomeView();
 * view.listenTo( domElement, ( evt, domEvt ) => {
 * 	console.log( evt, domEvt );
 * } );
 * ```
 *
 * @label EXTENDS
 */
export declare function DomEmitterMixin<Base extends Constructor<Emitter>>(base: Base): Mixed<Base, DomEmitter>;
/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~Emitter}.
 *
 * This function creates a class that implements `Emitter` interface.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 * ```ts
 * import { DomEmitterMixin } from '../utils/dom/emittermixin.js';
 *
 * class SomeView extends DomEmitterMixin() {}
 *
 * const view = new SomeView();
 * view.listenTo( domElement, ( evt, domEvt ) => {
 * 	console.log( evt, domEvt );
 * } );
 * ```
 *
 * @label NO_ARGUMENTS
 */
export declare function DomEmitterMixin(): {
    new (): DomEmitter;
    prototype: DomEmitter;
};
export interface DomEventMap extends HTMLElementEventMap, WindowEventMap {
}
/**
 * Interface representing classes which mix in {@link module:utils/dom/emittermixin~DomEmitterMixin}.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/dom/emittermixin~DomEmitterMixin} mixin.
 *
 * ```ts
 * class MyClass extends DomEmitterMixin( OtherBaseClass ) {
 * 	// This class now implements the `Emitter` interface.
 * }
 * ```
 */
export interface DomEmitter extends Emitter {
    /**
     * Registers a callback function to be executed when an event is fired in a specific Emitter or DOM Node.
     * It is backwards compatible with {@link module:utils/emittermixin~Emitter#listenTo}.
     *
     * @label HTML_EMITTER
     * @param emitter The object that fires the event.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     * @param options.useCapture Indicates that events of this type will be dispatched to the registered
     * listener before being dispatched to any EventTarget beneath it in the DOM tree.
     * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
     * and prevents blocking browser's main thread by this event handler.
     */
    listenTo<K extends keyof DomEventMap>(emitter: Node | Window | EventTarget, event: K, callback: (this: this, ev: EventInfo, event: DomEventMap[K]) => void, options?: CallbackOptions & {
        readonly useCapture?: boolean;
        readonly usePassive?: boolean;
    }): void;
    /**
     * Registers a callback function to be executed when an event is fired in a specific (emitter) object.
     *
     * Events can be grouped in namespaces using `:`.
     * When namespaced event is fired, it additionally fires all callbacks for that namespace.
     *
     * ```ts
     * // myEmitter.on( ... ) is a shorthand for myEmitter.listenTo( myEmitter, ... ).
     * myEmitter.on( 'myGroup', genericCallback );
     * myEmitter.on( 'myGroup:myEvent', specificCallback );
     *
     * // genericCallback is fired.
     * myEmitter.fire( 'myGroup' );
     * // both genericCallback and specificCallback are fired.
     * myEmitter.fire( 'myGroup:myEvent' );
     * // genericCallback is fired even though there are no callbacks for "foo".
     * myEmitter.fire( 'myGroup:foo' );
     * ```
     *
     * An event callback can {@link module:utils/eventinfo~EventInfo#stop stop the event} and
     * set the {@link module:utils/eventinfo~EventInfo#return return value} of the {@link #fire} method.
     *
     * @label DOM_EMITTER
     * @typeParam TEvent The type describing the event. See {@link module:utils/emittermixin~BaseEvent}.
     * @param emitter The object that fires the event.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    listenTo<TEvent extends BaseEvent>(emitter: Emitter, event: TEvent['name'], callback: GetCallback<TEvent>, options?: CallbackOptions): void;
    /**
     * Stops listening for events. It can be used at different levels:
     * It is backwards compatible with {@link module:utils/emittermixin~Emitter#listenTo}.
     *
     * * To stop listening to a specific callback.
     * * To stop listening to a specific event.
     * * To stop listening to all events fired by a specific object.
     * * To stop listening to all events fired by all objects.
     *
     * @label DOM_STOP
     * @param emitter The object to stop listening to.
     * If omitted, stops it for all objects.
     * @param event (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
     * for all events from `emitter`.
     * @param callback (Requires the `event`) The function to be removed from the call list for the given
     * `event`.
     */
    stopListening(emitter?: Emitter | Node | Window | EventTarget, event?: string, callback?: Function): void;
}

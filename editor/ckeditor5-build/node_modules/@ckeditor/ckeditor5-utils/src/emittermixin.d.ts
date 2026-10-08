/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/emittermixin
 */
import { EventInfo } from './eventinfo.js';
import { type PriorityString } from './priorities.js';
import type { Constructor, Mixed } from './mix.js';
import './version.js';
/**
 * Mixin that injects the {@link ~Emitter events API} into its host.
 *
 * This function creates a class that inherits from the provided `base` and implements `Emitter` interface.
 *
 * ```ts
 * class BaseClass { ... }
 *
 * class MyClass extends EmitterMixin( BaseClass ) {
 * 	// This class derives from `BaseClass` and implements the `Emitter` interface.
 * }
 * ```
 *
 * Read more about the concept of emitters in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide.
 * * {@glink framework/deep-dive/event-system Event system} deep-dive guide.
 *
 * @label EXTENDS
 */
export declare function EmitterMixin<Base extends Constructor>(base: Base): Mixed<Base, Emitter>;
/**
 * Mixin that injects the {@link ~Emitter events API} into its host.
 *
 * This function creates a class that implements `Emitter` interface.
 *
 * ```ts
 * class MyClass extends EmitterMixin() {
 * 	// This class implements the `Emitter` interface.
 * }
 * ```
 *
 * Read more about the concept of emitters in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide.
 * * {@glink framework/deep-dive/event-system Event system} deep dive guide.
 *
 * @label NO_ARGUMENTS
 */
export declare function EmitterMixin(): {
    new (): Emitter;
    prototype: Emitter;
};
/**
 * Emitter/listener interface.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/emittermixin~Emitter} mixin.
 *
 * ```ts
 * class MyClass extends EmitterMixin() {
 * 	// This class now implements the `Emitter` interface.
 * }
 * ```
 *
 * Read more about the usage of this interface in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide.
 * * {@glink framework/deep-dive/event-system Event system} deep-dive guide.
 */
export interface Emitter {
    /**
     * Registers a callback function to be executed when an event is fired.
     *
     * Shorthand for {@link #listenTo `this.listenTo( this, event, callback, options )`} (it makes the emitter
     * listen on itself).
     *
     * @typeParam TEvent The type descibing the event. See {@link module:utils/emittermixin~BaseEvent}.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    on<TEvent extends BaseEvent>(event: TEvent['name'], callback: GetCallback<TEvent>, options?: GetCallbackOptions<TEvent>): void;
    /**
     * Registers a callback function to be executed on the next time the event is fired only. This is similar to
     * calling {@link #on} followed by {@link #off} in the callback.
     *
     * @typeParam TEvent The type descibing the event. See {@link module:utils/emittermixin~BaseEvent}.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    once<TEvent extends BaseEvent>(event: TEvent['name'], callback: GetCallback<TEvent>, options?: GetCallbackOptions<TEvent>): void;
    /**
     * Stops executing the callback on the given event.
     * Shorthand for {@link #stopListening `this.stopListening( this, event, callback )`}.
     *
     * @param event The name of the event.
     * @param callback The function to stop being called.
     */
    off(event: string, callback: Function): void;
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
     * @label BASE_EMITTER
     * @typeParam TEvent The type describing the event. See {@link module:utils/emittermixin~BaseEvent}.
     * @param emitter The object that fires the event.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    listenTo<TEvent extends BaseEvent>(emitter: Emitter, event: TEvent['name'], callback: GetCallback<TEvent>, options?: GetCallbackOptions<TEvent>): void;
    /**
     * Stops listening for events. It can be used at different levels:
     *
     * * To stop listening to a specific callback.
     * * To stop listening to a specific event.
     * * To stop listening to all events fired by a specific object.
     * * To stop listening to all events fired by all objects.
     *
     * @label BASE_STOP
     * @param emitter The object to stop listening to. If omitted, stops it for all objects.
     * @param event (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
     * for all events from `emitter`.
     * @param callback (Requires the `event`) The function to be removed from the call list for the given
     * `event`.
     */
    stopListening(emitter?: Emitter, event?: string, callback?: Function): void;
    /**
     * Fires an event, executing all callbacks registered for it.
     *
     * The first parameter passed to callbacks is an {@link module:utils/eventinfo~EventInfo} object,
     * followed by the optional `args` provided in the `fire()` method call.
     *
     * @typeParam TEvent The type describing the event. See {@link module:utils/emittermixin~BaseEvent}.
     * @param eventOrInfo The name of the event or `EventInfo` object if event is delegated.
     * @param args Additional arguments to be passed to the callbacks.
     * @returns By default the method returns `undefined`. However, the return value can be changed by listeners
     * through modification of the {@link module:utils/eventinfo~EventInfo#return `evt.return`}'s property (the event info
     * is the first param of every callback).
     */
    fire<TEvent extends BaseEvent>(eventOrInfo: GetNameOrEventInfo<TEvent>, ...args: TEvent['args']): GetEventInfo<TEvent>['return'];
    /**
     * Delegates selected events to another {@link module:utils/emittermixin~Emitter}. For instance:
     *
     * ```ts
     * emitterA.delegate( 'eventX' ).to( emitterB );
     * emitterA.delegate( 'eventX', 'eventY' ).to( emitterC );
     * ```
     *
     * then `eventX` is delegated (fired by) `emitterB` and `emitterC` along with `data`:
     *
     * ```ts
     * emitterA.fire( 'eventX', data );
     * ```
     *
     * and `eventY` is delegated (fired by) `emitterC` along with `data`:
     *
     * ```ts
     * emitterA.fire( 'eventY', data );
     * ```
     *
     * @param events Event names that will be delegated to another emitter.
     */
    delegate(...events: Array<string>): EmitterMixinDelegateChain;
    /**
     * Stops delegating events. It can be used at different levels:
     *
     * * To stop delegating all events.
     * * To stop delegating a specific event to all emitters.
     * * To stop delegating a specific event to a specific emitter.
     *
     * @param event The name of the event to stop delegating. If omitted, stops it all delegations.
     * @param emitter (requires `event`) The object to stop delegating a particular event to.
     * If omitted, stops delegation of `event` to all emitters.
     */
    stopDelegating(event?: string, emitter?: Emitter): void;
}
/**
 * Default type describing any event.
 *
 * Every custom event has to be compatible with `BaseEvent`.
 *
 * ```ts
 * type MyEvent = {
 * 	// In `fire<MyEvent>( name )`, `on<MyEvent>( name )`, `once<MyEvent>( name )` and `listenTo<MyEvent>( name )` calls
 * 	// the `name` argument will be type-checked to ensure it's `'myEvent'` or have `'myEvent:'` prefix.
 * 	// Required.
 * 	name: 'myEvent' | `myEvent:${ string }`;
 *
 * 	// In `fire<MyEvent>( name, a, b )` call, `a` and `b` parameters will be type-checked against `number` and `string`.
 * 	// In `on<MyEvent>`, `once<MyEvent>` and `listenTo<MyEvent>` calls, the parameters of provided callback function
 * 	// will be automatically inferred as `EventInfo`, `number` and `string`.
 * 	// Required.
 * 	args: [ number, string ];
 *
 * 	// `fire<MyEvent>` will have return type `boolean | undefined`.
 * 	// Optional, unknown by default.
 * 	return: boolean;
 *
 * 	// `fire<MyEvent>( eventInfo )` will type-check that `eventInfo` is `MyEventInfo`, not a base `EventInfo` or string.
 * 	// In `on<MyEvent>`, `once<MyEvent>` and `listenTo<MyEvent>` calls, the first callback parameter will be of this type.
 * 	// Optional.
 * 	eventInfo: MyEventInfo;
 *
 * 	// In `on<MyEvent>`, `once<MyEvent>` and `listenTo<MyEvent>` calls, the `options` parameter will be of type
 * 	// `{ myOption?: boolean; priority?: PriorityString }
 * 	// Optional.
 * 	callbackOptions: { myOption?: boolean };
 * };
 * ```
 */
export type BaseEvent = {
    name: string;
    args: Array<any>;
};
/**
 * Utility type that gets the `EventInfo` subclass for the given event.
 */
export type GetEventInfo<TEvent extends BaseEvent> = TEvent extends {
    eventInfo: EventInfo;
} ? TEvent['eventInfo'] : EventInfo<TEvent['name'], (TEvent extends {
    return: infer TReturn;
} ? TReturn : unknown)>;
/**
 * Utility type that gets the `EventInfo` subclass or event name type for the given event.
 */
export type GetNameOrEventInfo<TEvent extends BaseEvent> = TEvent extends {
    eventInfo: EventInfo;
} ? TEvent['eventInfo'] : TEvent['name'] | EventInfo<TEvent['name'], (TEvent extends {
    return: infer TReturn;
} ? TReturn : unknown)>;
/**
 * Utility type that gets the callback type for the given event.
 */
export type GetCallback<TEvent extends BaseEvent> = (this: Emitter, ev: GetEventInfo<TEvent>, ...args: TEvent['args']) => void;
/**
 * Utility type that gets the callback options for the given event.
 */
export type GetCallbackOptions<TEvent extends BaseEvent> = TEvent extends {
    callbackOptions: infer TOptions;
} ? TOptions & CallbackOptions : CallbackOptions;
/**
 * Additional options for registering a callback.
 */
export interface CallbackOptions {
    /**
     * The priority of this event callback. The higher
     * the priority value the sooner the callback will be fired. Events having the same priority are called in the
     * order they were added.
     *
     * @defaultValue `'normal'`
     */
    readonly priority?: PriorityString;
}
/**
 * Checks if `listeningEmitter` listens to an emitter with given `listenedToEmitterId` and if so, returns that emitter.
 * If not, returns `null`.
 *
 * @internal
 * @param listeningEmitter An emitter that listens.
 * @param listenedToEmitterId Unique emitter id of emitter listened to.
 */
export declare function _getEmitterListenedTo(listeningEmitter: Emitter, listenedToEmitterId: string): Emitter | null;
/**
 * Sets emitter's unique id.
 *
 * **Note:** `_emitterId` can be set only once.
 *
 * @internal
 * @param emitter An emitter for which id will be set.
 * @param id Unique id to set. If not passed, random unique id will be set.
 */
export declare function _setEmitterId(emitter: Emitter, id?: string): void;
/**
 * Returns emitter's unique id.
 *
 * @internal
 * @param emitter An emitter which id will be returned.
 */
export declare function _getEmitterId(emitter: Emitter): string | undefined;
/**
 * The return value of {@link ~Emitter#delegate}.
 */
export interface EmitterMixinDelegateChain {
    /**
     * Selects destination for {@link module:utils/emittermixin~Emitter#delegate} events.
     *
     * @param emitter An `EmitterMixin` instance which is the destination for delegated events.
     * @param nameOrFunction A custom event name or function which converts the original name string.
     */
    to(emitter: Emitter, nameOrFunction?: string | ((name: string) => string)): void;
}

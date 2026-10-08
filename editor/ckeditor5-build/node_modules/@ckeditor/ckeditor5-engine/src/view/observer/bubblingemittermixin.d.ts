/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/bubblingemittermixin
 */
import { type ArrayOrItem, type Emitter, type BaseEvent, type CallbackOptions, type Constructor, type Mixed } from '@ckeditor/ckeditor5-utils';
import { BubblingEventInfo } from './bubblingeventinfo.js';
import { type ViewNode } from '../node.js';
/**
 * Bubbling emitter mixin for the view document as described in the {@link ~BubblingEmitter} interface.
 *
 * This function creates a class that inherits from the provided `base` and implements `Emitter` interface.
 * The base class must implement {@link module:utils/emittermixin~Emitter} interface.
 *
 * ```ts
 * class BaseClass extends EmitterMixin() {
 * 	// ...
 * }
 *
 * class MyClass extends BubblingEmitterMixin( BaseClass ) {
 * 	// This class derives from `BaseClass` and implements the `BubblingEmitter` interface.
 * }
 * ```
 */
export declare function BubblingEmitterMixin<Base extends Constructor<Emitter>>(base: Base): Mixed<Base, BubblingEmitter>;
/**
 * Bubbling emitter for the view document.
 *
 * Bubbling emitter is triggering events in the context of specified {@link module:engine/view/element~ViewElement view element} name,
 * predefined `'$text'`, `'$root'`, `'$document'` and `'$capture'` contexts, and context matchers provided as a function.
 *
 * Before bubbling starts, listeners for `'$capture'` context are triggered. Then the bubbling starts from the deeper selection
 * position (by firing event on the `'$text'` context) and propagates the view document tree up to the `'$root'` and finally
 * the listeners at `'$document'` context are fired (this is the default context).
 *
 * Examples:
 *
 * ```ts
 * // Listeners registered in the context of the view element names:
 * this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 * 	// ...
 * }, { context: 'blockquote' } );
 *
 * this.listenTo( viewDocument, 'enter', ( evt, data ) => {
 * 	// ...
 * }, { context: 'li' } );
 *
 * // Listeners registered in the context of the '$text' and '$root' nodes.
 * this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 * 	// ...
 * }, { context: '$text', priority: 'high' } );
 *
 * this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 * 	// ...
 * }, { context: '$root' } );
 *
 * // Listeners registered in the context of custom callback function.
 * this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 * 	// ...
 * }, { context: isWidget } );
 *
 * this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
 * 	// ...
 * }, { context: isWidget, priority: 'high' } );
 * ```
 *
 * Example flow for selection in text:
 *
 * ```xml
 * <blockquote><p>Foo[]bar</p></blockquote>
 * ```
 *
 * Fired events on contexts:
 * 1. `'$capture'`
 * 2. `'$text'`
 * 3. `'p'`
 * 4. `'blockquote'`
 * 5. `'$root'`
 * 6. `'$document'`
 *
 * Example flow for selection on element (i.e., Widget):
 *
 * ```xml
 * <blockquote><p>Foo[<widget/>]bar</p></blockquote>
 * ```
 *
 * Fired events on contexts:
 * 1. `'$capture'`
 * 2. *widget* (custom matcher)
 * 3. `'p'`
 * 4. `'blockquote'`
 * 5. `'$root'`
 * 6. `'$document'`
 *
 * There could be multiple listeners registered for the same context and at different priority levels:
 *
 * ```html
 * <p>Foo[]bar</p>
 * ```
 *
 * 1. `'$capture'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 2. `'$text'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 3. `'p'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 4. `'$root'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 * 5. `'$document'` at priorities:
 *    1. `'highest'`
 *    2. `'high'`
 *    3. `'normal'`
 *    4. `'low'`
 *    5. `'lowest'`
 */
export type BubblingEmitter = Emitter;
/**
 * A context matcher function.
 *
 * Should return true for nodes that that match the custom context.
 */
export type BubblingEventContextFunction = (node: ViewNode) => boolean;
/**
 * Helper type that allows describing bubbling event. Extends `TEvent` so that:
 *
 * * the event is called with {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo}`
 * instead of {@link module:utils/eventinfo~EventInfo}, and
 * * {@link ~BubblingCallbackOptions} can be specified as additional options.
 *
 * @typeParam TEvent The event description to extend.
 */
export type BubblingEvent<TEvent extends BaseEvent> = TEvent & {
    eventInfo: BubblingEventInfo<TEvent['name'], (TEvent extends {
        return: infer TReturn;
    } ? TReturn : unknown)>;
    callbackOptions: BubblingCallbackOptions;
};
/**
 * Additional options for registering a callback.
 */
export interface BubblingCallbackOptions extends CallbackOptions {
    /**
     * Specifies the context in which the event should be triggered to call the callback.
     *
     * @see ~BubblingEmitter
     */
    context?: ArrayOrItem<string | BubblingEventContextFunction>;
}

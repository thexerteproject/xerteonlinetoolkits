/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/domeventobserver
 */
import { Observer } from './observer.js';
import type { EventInfo } from '@ckeditor/ckeditor5-utils';
/**
 * Base class for DOM event observers. This class handles
 * {@link module:engine/view/observer/observer~Observer#observe adding} listeners to DOM elements,
 * {@link module:engine/view/observer/observer~Observer#disable disabling} and
 * {@link module:engine/view/observer/observer~Observer#enable re-enabling} events.
 * Child class needs to define
 * {@link module:engine/view/observer/domeventobserver~DomEventObserver#domEventType DOM event type} and
 * {@link module:engine/view/observer/domeventobserver~DomEventObserver#onDomEvent callback}.
 *
 * For instance:
 *
 * ```ts
 * class ClickObserver extends DomEventObserver<'click'> {
 * 	// It can also be defined as a normal property in the constructor.
 * 	get domEventType(): 'click' {
 * 		return 'click';
 * 	}
 *
 * 	onDomEvent( domEvent: MouseEvent ): void {
 * 		this.fire( 'click', domEvent );
 * 	}
 * }
 * ```
 *
 * @typeParam EventType DOM Event type name or an union of those.
 * @typeParam AdditionalData Additional data passed along with the event.
 */
export declare abstract class DomEventObserver<EventType extends keyof HTMLElementEventMap, AdditionalData extends object = object> extends Observer {
    /**
     * Type of the DOM event the observer should listen to. Array of types can be defined
     * if the observer should listen to multiple DOM events.
     */
    abstract get domEventType(): EventType | ReadonlyArray<EventType>;
    /**
     * If set to `true` DOM events will be listened on the capturing phase.
     * Default value is `false`.
     */
    useCapture: boolean;
    /**
     * If set to `true`, indicates that the function specified by listener will never call `preventDefault()`.
     * Default value is `false`.
     */
    usePassive: boolean;
    /**
     * Callback which should be called when the DOM event occurred. Note that the callback will not be called if
     * observer {@link #isEnabled is not enabled}.
     *
     * @see #domEventType
     */
    abstract onDomEvent(event: HTMLElementEventMap[EventType]): void;
    /**
     * @inheritDoc
     */
    observe(domElement: HTMLElement): void;
    /**
     * @inheritDoc
     */
    stopObserving(domElement: HTMLElement): void;
    /**
     * Calls `Document#fire()` if observer {@link #isEnabled is enabled}.
     *
     * @see module:utils/emittermixin~Emitter#fire
     * @param eventType The event type (name).
     * @param domEvent The DOM event.
     * @param additionalData The additional data which should extend the
     * {@link module:engine/view/observer/domeventdata~ViewDocumentDomEventData event data} object.
     */
    fire(eventType: string | EventInfo, domEvent: Event, additionalData?: AdditionalData): void;
}

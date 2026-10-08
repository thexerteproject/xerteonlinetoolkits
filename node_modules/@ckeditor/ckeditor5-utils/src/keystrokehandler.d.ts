/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Emitter } from './emittermixin.js';
import { type KeystrokeInfo } from './keyboard.js';
import type { PriorityString } from './priorities.js';
/**
 * Keystroke handler allows registering callbacks for given keystrokes.
 *
 * The most frequent use of this class is through the {@link module:core/editor/editor~Editor#keystrokes `editor.keystrokes`}
 * property. It allows listening to keystrokes executed in the editing view:
 *
 * ```ts
 * editor.keystrokes.set( 'Ctrl+A', ( keyEvtData, cancel ) => {
 * 	console.log( 'Ctrl+A has been pressed' );
 * 	cancel();
 * } );
 * ```
 *
 * However, this utility class can be used in various part of the UI. For instance, a certain {@link module:ui/view~View}
 * can use it like this:
 *
 * ```ts
 * class MyView extends View {
 * 	constructor() {
 * 		this.keystrokes = new KeystrokeHandler();
 *
 * 		this.keystrokes.set( 'tab', handleTabKey );
 * 	}
 *
 * 	render() {
 * 		super.render();
 *
 * 		this.keystrokes.listenTo( this.element );
 * 	}
 * }
 * ```
 *
 * That keystroke handler will listen to `keydown` events fired in this view's main element.
 *
 */
export declare class KeystrokeHandler {
    /**
     * Listener used to listen to events for easier keystroke handler destruction.
     */
    private readonly _listener;
    /**
     * Creates an instance of the keystroke handler.
     */
    constructor();
    /**
     * Starts listening for `keydown` events from a given emitter.
     */
    listenTo(emitter: Emitter | HTMLElement | Window): void;
    /**
     * Registers a handler for the specified keystroke.
     *
     * @param keystroke Keystroke defined in a format accepted by
     * the {@link module:utils/keyboard~parseKeystroke} function.
     * @param callback A function called with the
     * {@link module:engine/view/observer/keyobserver~ViewDocumentKeyEventData key event data} object and
     * a helper function to call both `preventDefault()` and `stopPropagation()` on the underlying event.
     * @param options Additional options.
     */
    set(keystroke: string | ReadonlyArray<string | number>, callback: (ev: KeyboardEvent, cancel: () => void) => void, options?: KeystrokeHandlerOptions): void;
    /**
     * Triggers a keystroke handler for a specified key combination, if such a keystroke was {@link #set defined}.
     *
     * @param keyEvtData Key event data.
     * @returns Whether the keystroke was handled.
     */
    press(keyEvtData: Readonly<KeystrokeInfo>): boolean;
    /**
     * Stops listening to `keydown` events from the given emitter.
     */
    stopListening(emitter?: Emitter | HTMLElement | Window): void;
    /**
     * Destroys the keystroke handler.
     */
    destroy(): void;
}
/**
 * {@link module:utils/keystrokehandler~KeystrokeHandler#set} method options.
 */
export interface KeystrokeHandlerOptions {
    /**
     * The priority of the keystroke callback. The higher the priority value the sooner the callback will be executed.
     * Keystrokes having the same priority are called in the order they were added.
     */
    readonly priority?: PriorityString;
    /**
     * An optional callback function allowing for filtering keystrokes based on arbitrary criteria.
     * The callback function receives `keydown` DOM event as a parameter.
     */
    readonly filter?: (keyEvtData: KeyboardEvent) => boolean;
}

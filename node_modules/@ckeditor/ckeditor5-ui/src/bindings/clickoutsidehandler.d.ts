/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/bindings/clickoutsidehandler
 */
import type { CallbackOptions, DomEmitter } from '@ckeditor/ckeditor5-utils';
/**
 * Handles clicking **outside** of a specified set of elements, then fires an action.
 *
 * **Note**: Actually, the action is executed upon `mousedown`, not `click`. It prevents
 * certain issues when the user keeps holding the mouse button and the UI cannot react
 * properly.
 *
 * @param options Configuration options.
 * @param options.emitter The emitter to which this behavior should be added.
 * @param options.activator Function returning a `Boolean`, to determine whether the handler is active.
 * @param options.contextElements Array of HTML elements or a callback returning an array of HTML elements
 * that determine the scope of the handler. Clicking any of them or their descendants will **not** fire the callback.
 * @param options.callback An action executed by the handler.
 * @param options.listenerOptions Additional options for the listener (like priority).
 */
export declare function clickOutsideHandler({ emitter, activator, callback, contextElements, listenerOptions }: {
    emitter: DomEmitter;
    activator: () => boolean;
    contextElements: Array<Element> | (() => Array<Element>);
    callback: () => void;
    listenerOptions?: CallbackOptions;
}): void;

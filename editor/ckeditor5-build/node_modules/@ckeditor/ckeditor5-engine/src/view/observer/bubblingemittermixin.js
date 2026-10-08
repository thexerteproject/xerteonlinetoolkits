/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/bubblingemittermixin
 */
import { CKEditorError, EmitterMixin, EventInfo, toArray } from '@ckeditor/ckeditor5-utils';
import { BubblingEventInfo } from './bubblingeventinfo.js';
const bubblingEmitterSymbol = Symbol('bubblingEmitter');
const callbackMapSymbol = Symbol('bubblingCallbacks');
const contextsSymbol = Symbol('bubblingContexts');
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
export function BubblingEmitterMixin(base) {
    class Mixin extends base {
        fire(eventOrInfo, ...eventArgs) {
            try {
                const eventInfo = eventOrInfo instanceof EventInfo ? eventOrInfo : new EventInfo(this, eventOrInfo);
                const bubblingEmitter = getBubblingEmitter(this);
                const customContexts = getCustomContexts(this);
                updateEventInfo(eventInfo, 'capturing', this);
                // The capture phase of the event.
                if (fireListenerFor(bubblingEmitter, '$capture', eventInfo, ...eventArgs)) {
                    return eventInfo.return;
                }
                const startRange = eventInfo.startRange || this.selection.getFirstRange();
                const selectedElement = startRange ? startRange.getContainedElement() : null;
                const isCustomContext = selectedElement ? hasMatchingCustomContext(customContexts, selectedElement) : false;
                let node = selectedElement || getDeeperRangeParent(startRange);
                updateEventInfo(eventInfo, 'atTarget', node);
                // For the not yet bubbling event trigger for $text node if selection can be there and it's not a custom context selected.
                if (!isCustomContext) {
                    if (fireListenerFor(bubblingEmitter, '$text', eventInfo, ...eventArgs)) {
                        return eventInfo.return;
                    }
                    updateEventInfo(eventInfo, 'bubbling', node);
                }
                while (node) {
                    if (node.is('element') && fireListenerFor(bubblingEmitter, node, eventInfo, ...eventArgs)) {
                        return eventInfo.return;
                    }
                    node = node.parent;
                    updateEventInfo(eventInfo, 'bubbling', node);
                }
                updateEventInfo(eventInfo, 'bubbling', this);
                // Document context.
                fireListenerFor(bubblingEmitter, '$document', eventInfo, ...eventArgs);
                return eventInfo.return;
            }
            catch (err) {
                // @if CK_DEBUG // throw err;
                /* istanbul ignore next -- @preserve */
                CKEditorError.rethrowUnexpectedError(err, this);
            }
        }
        _addEventListener(event, callback, options) {
            const contexts = toArray(options.context || '$document');
            const bubblingEmitter = getBubblingEmitter(this);
            const callbacksMap = getCallbackMap(this);
            for (const context of contexts) {
                if (typeof context == 'function') {
                    getCustomContexts(this).add(context);
                }
            }
            // Wrap callback with current target match.
            const wrappedCallback = wrapCallback(this, contexts, callback);
            // Store for later removing of listeners.
            callbacksMap.set(callback, wrappedCallback);
            // Listen for the event.
            this.listenTo(bubblingEmitter, event, wrappedCallback, options);
        }
        _removeEventListener(event, callback) {
            const bubblingEmitter = getBubblingEmitter(this);
            const callbacksMap = getCallbackMap(this);
            const wrappedCallback = callbacksMap.get(callback);
            if (wrappedCallback) {
                callbacksMap.delete(callback);
                this.stopListening(bubblingEmitter, event, wrappedCallback);
            }
        }
    }
    return Mixin;
}
/**
 * Update the event info bubbling fields.
 *
 * @param eventInfo The event info object to update.
 * @param eventPhase The current event phase.
 * @param currentTarget The current bubbling target.
 */
function updateEventInfo(eventInfo, eventPhase, currentTarget) {
    if (eventInfo instanceof BubblingEventInfo) {
        eventInfo._eventPhase = eventPhase;
        eventInfo._currentTarget = currentTarget;
    }
}
/**
 * Fires the listener for the specified context. Returns `true` if event was stopped.
 *
 * @param eventInfo The `EventInfo` object.
 * @param eventArgs Additional arguments to be passed to the callbacks.
 * @returns True if event stop was called.
 */
function fireListenerFor(emitter, currentTarget, eventInfo, ...eventArgs) {
    emitter.fire(eventInfo, {
        currentTarget,
        eventArgs
    });
    // Similar to DOM Event#stopImmediatePropagation() this does not fire events
    // for other contexts on the same node.
    if (eventInfo.stop.called) {
        return true;
    }
    return false;
}
/**
 * Returns an event callback wrapped with context check condition.
 */
function wrapCallback(emitter, contexts, callback) {
    return function (event, data) {
        const { currentTarget, eventArgs } = data;
        // Quick path for string based context ($capture, $text, $document).
        if (typeof currentTarget == 'string') {
            if (contexts.includes(currentTarget)) {
                callback.call(emitter, event, ...eventArgs);
            }
            return;
        }
        // The current target is a view element.
        // Special case for the root element as it could be handled ac $root context.
        // Note that it could also be matched later by custom context.
        if (currentTarget.is('rootElement') && contexts.includes('$root')) {
            callback.call(emitter, event, ...eventArgs);
            return;
        }
        // Check if it is a context for this element name.
        if (contexts.includes(currentTarget.name)) {
            callback.call(emitter, event, ...eventArgs);
            return;
        }
        // Check if dynamic context matches.
        for (const context of contexts) {
            if (typeof context == 'function' && context(currentTarget)) {
                callback.call(emitter, event, ...eventArgs);
                return;
            }
        }
    };
}
/**
 * Returns bubbling emitter for the source (emitter).
 */
function getBubblingEmitter(source) {
    if (!source[bubblingEmitterSymbol]) {
        source[bubblingEmitterSymbol] = new (EmitterMixin())();
    }
    return source[bubblingEmitterSymbol];
}
/**
 * Returns map of callbacks (original to wrapped one).
 */
function getCallbackMap(source) {
    if (!source[callbackMapSymbol]) {
        source[callbackMapSymbol] = new Map();
    }
    return source[callbackMapSymbol];
}
/**
 * Returns the set of registered custom contexts.
 */
function getCustomContexts(source) {
    if (!source[contextsSymbol]) {
        source[contextsSymbol] = new Set();
    }
    return source[contextsSymbol];
}
/**
 * Returns true if any of custom context match the given element.
 */
function hasMatchingCustomContext(customContexts, element) {
    for (const context of customContexts) {
        if (context(element)) {
            return true;
        }
    }
    return false;
}
/**
 * Returns the deeper parent element for the range.
 */
function getDeeperRangeParent(range) {
    if (!range) {
        return null;
    }
    const startParent = range.start.parent;
    const endParent = range.end.parent;
    const startPath = startParent.getPath();
    const endPath = endParent.getPath();
    return startPath.length > endPath.length ? startParent : endParent;
}

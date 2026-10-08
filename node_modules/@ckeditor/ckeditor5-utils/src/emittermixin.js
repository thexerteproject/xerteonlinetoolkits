/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/emittermixin
 */
import { EventInfo } from './eventinfo.js';
import { uid } from './uid.js';
import { priorities } from './priorities.js';
import { insertToPriorityArray } from './inserttopriorityarray.js';
// To check if component is loaded more than once.
import './version.js';
import { CKEditorError } from './ckeditorerror.js';
const _listeningTo = Symbol('listeningTo');
const _emitterId = Symbol('emitterId');
const _delegations = Symbol('delegations');
const defaultEmitterClass = /* #__PURE__ */ EmitterMixin(Object);
export function EmitterMixin(base) {
    if (!base) {
        return defaultEmitterClass;
    }
    class Mixin extends base {
        on(event, callback, options) {
            this.listenTo(this, event, callback, options);
        }
        once(event, callback, options) {
            let wasFired = false;
            const onceCallback = (event, ...args) => {
                // Ensure the callback is called only once even if the callback itself leads to re-firing the event
                // (which would call the callback again).
                if (!wasFired) {
                    wasFired = true;
                    // Go off() at the first call.
                    event.off();
                    // Go with the original callback.
                    callback.call(this, event, ...args);
                }
            };
            // Make a similar on() call, simply replacing the callback.
            this.listenTo(this, event, onceCallback, options);
        }
        off(event, callback) {
            this.stopListening(this, event, callback);
        }
        listenTo(emitter, event, callback, options = {}) {
            let emitterInfo, eventCallbacks;
            // _listeningTo contains a list of emitters that this object is listening to.
            // This list has the following format:
            //
            // _listeningTo: {
            //     emitterId: {
            //         emitter: emitter,
            //         callbacks: {
            //             event1: [ callback1, callback2, ... ]
            //             ....
            //         }
            //     },
            //     ...
            // }
            if (!this[_listeningTo]) {
                this[_listeningTo] = {};
            }
            const emitters = this[_listeningTo];
            if (!_getEmitterId(emitter)) {
                _setEmitterId(emitter);
            }
            const emitterId = _getEmitterId(emitter);
            if (!(emitterInfo = emitters[emitterId])) {
                emitterInfo = emitters[emitterId] = {
                    emitter,
                    callbacks: {}
                };
            }
            if (!(eventCallbacks = emitterInfo.callbacks[event])) {
                eventCallbacks = emitterInfo.callbacks[event] = [];
            }
            eventCallbacks.push(callback);
            // Finally register the callback to the event.
            addEventListener(this, emitter, event, callback, options);
        }
        stopListening(emitter, event, callback) {
            const emitters = this[_listeningTo];
            let emitterId = emitter && _getEmitterId(emitter);
            const emitterInfo = (emitters && emitterId) ? emitters[emitterId] : undefined;
            const eventCallbacks = (emitterInfo && event) ? emitterInfo.callbacks[event] : undefined;
            // Stop if nothing has been listened.
            if (!emitters || (emitter && !emitterInfo) || (event && !eventCallbacks)) {
                return;
            }
            // All params provided. off() that single callback.
            if (callback) {
                removeEventListener(this, emitter, event, callback);
                // We must remove callbacks as well in order to prevent memory leaks.
                // See https://github.com/ckeditor/ckeditor5/pull/8480
                const index = eventCallbacks.indexOf(callback);
                if (index !== -1) {
                    if (eventCallbacks.length === 1) {
                        delete emitterInfo.callbacks[event];
                    }
                    else {
                        removeEventListener(this, emitter, event, callback);
                    }
                }
            }
            // Only `emitter` and `event` provided. off() all callbacks for that event.
            else if (eventCallbacks) {
                while ((callback = eventCallbacks.pop())) {
                    removeEventListener(this, emitter, event, callback);
                }
                delete emitterInfo.callbacks[event];
            }
            // Only `emitter` provided. off() all events for that emitter.
            else if (emitterInfo) {
                for (event in emitterInfo.callbacks) {
                    this.stopListening(emitter, event);
                }
                delete emitters[emitterId];
            }
            // No params provided. off() all emitters.
            else {
                for (emitterId in emitters) {
                    this.stopListening(emitters[emitterId].emitter);
                }
                delete this[_listeningTo];
            }
        }
        fire(eventOrInfo, ...args) {
            try {
                const eventInfo = eventOrInfo instanceof EventInfo ? eventOrInfo : new EventInfo(this, eventOrInfo);
                const event = eventInfo.name;
                let callbacks = getCallbacksForEvent(this, event);
                // Record that the event passed this emitter on its path.
                eventInfo.path.push(this);
                // Handle event listener callbacks first.
                if (callbacks) {
                    // Copying callbacks array is the easiest and most secure way of preventing infinite loops, when event callbacks
                    // are added while processing other callbacks. Previous solution involved adding counters (unique ids) but
                    // failed if callbacks were added to the queue before currently processed callback.
                    // If this proves to be too inefficient, another method is to change `.on()` so callbacks are stored if same
                    // event is currently processed. Then, `.fire()` at the end, would have to add all stored events.
                    callbacks = callbacks.slice();
                    for (let i = 0; i < callbacks.length; i++) {
                        const fn = callbacks[i].callback;
                        fn.call(this, eventInfo, ...args);
                        // Remove the callback from future requests if off() has been called.
                        if (eventInfo.off.called) {
                            // Remove the called mark for the next calls.
                            delete eventInfo.off.called;
                            this._removeEventListener(event, fn);
                        }
                        // Do not execute next callbacks if stop() was called.
                        if (eventInfo.stop.called) {
                            break;
                        }
                    }
                }
                // Delegate event to other emitters if needed.
                const delegations = this[_delegations];
                if (delegations) {
                    const destinations = delegations.get(event);
                    const passAllDestinations = delegations.get('*');
                    if (destinations) {
                        fireDelegatedEvents(destinations, eventInfo, args);
                    }
                    if (passAllDestinations) {
                        fireDelegatedEvents(passAllDestinations, eventInfo, args);
                    }
                }
                return eventInfo.return;
            }
            catch (err) {
                // @if CK_DEBUG // throw err;
                /* istanbul ignore next -- @preserve */
                CKEditorError.rethrowUnexpectedError(err, this);
            }
        }
        delegate(...events) {
            return {
                to: (emitter, nameOrFunction) => {
                    if (!this[_delegations]) {
                        this[_delegations] = new Map();
                    }
                    // Originally there was a for..of loop which unfortunately caused an error in Babel that didn't allow
                    // build an application. See: https://github.com/ckeditor/ckeditor5-react/issues/40.
                    events.forEach(eventName => {
                        const destinations = this[_delegations].get(eventName);
                        if (!destinations) {
                            this[_delegations].set(eventName, new Map([[emitter, nameOrFunction]]));
                        }
                        else {
                            destinations.set(emitter, nameOrFunction);
                        }
                    });
                }
            };
        }
        stopDelegating(event, emitter) {
            if (!this[_delegations]) {
                return;
            }
            if (!event) {
                this[_delegations].clear();
            }
            else if (!emitter) {
                this[_delegations].delete(event);
            }
            else {
                const destinations = this[_delegations].get(event);
                if (destinations) {
                    destinations.delete(emitter);
                }
            }
        }
        _addEventListener(event, callback, options) {
            createEventNamespace(this, event);
            const lists = getCallbacksListsForNamespace(this, event);
            const priority = priorities.get(options.priority);
            const callbackDefinition = {
                callback,
                priority
            };
            // Add the callback to all callbacks list.
            for (const callbacks of lists) {
                // Add the callback to the list in the right priority position.
                insertToPriorityArray(callbacks, callbackDefinition);
            }
        }
        _removeEventListener(event, callback) {
            const lists = getCallbacksListsForNamespace(this, event);
            for (const callbacks of lists) {
                for (let i = 0; i < callbacks.length; i++) {
                    if (callbacks[i].callback == callback) {
                        // Remove the callback from the list (fixing the next index).
                        callbacks.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }
    return Mixin;
}
/**
 * Checks if `listeningEmitter` listens to an emitter with given `listenedToEmitterId` and if so, returns that emitter.
 * If not, returns `null`.
 *
 * @internal
 * @param listeningEmitter An emitter that listens.
 * @param listenedToEmitterId Unique emitter id of emitter listened to.
 */
export function _getEmitterListenedTo(listeningEmitter, listenedToEmitterId) {
    const listeningTo = listeningEmitter[_listeningTo];
    if (listeningTo && listeningTo[listenedToEmitterId]) {
        return listeningTo[listenedToEmitterId].emitter;
    }
    return null;
}
/**
 * Sets emitter's unique id.
 *
 * **Note:** `_emitterId` can be set only once.
 *
 * @internal
 * @param emitter An emitter for which id will be set.
 * @param id Unique id to set. If not passed, random unique id will be set.
 */
export function _setEmitterId(emitter, id) {
    if (!emitter[_emitterId]) {
        emitter[_emitterId] = id || uid();
    }
}
/**
 * Returns emitter's unique id.
 *
 * @internal
 * @param emitter An emitter which id will be returned.
 */
export function _getEmitterId(emitter) {
    return emitter[_emitterId];
}
/**
 * Gets the internal `_events` property of the given object.
 * `_events` property store all lists with callbacks for registered event names.
 * If there were no events registered on the object, empty `_events` object is created.
 */
function getEvents(source) {
    if (!source._events) {
        Object.defineProperty(source, '_events', {
            value: {}
        });
    }
    return source._events;
}
/**
 * Creates event node for generic-specific events relation architecture.
 */
function makeEventNode() {
    return {
        callbacks: [],
        childEvents: []
    };
}
/**
 * Creates an architecture for generic-specific events relation.
 * If needed, creates all events for given eventName, i.e. if the first registered event
 * is foo:bar:abc, it will create foo:bar:abc, foo:bar and foo event and tie them together.
 * It also copies callbacks from more generic events to more specific events when
 * specific events are created.
 */
function createEventNamespace(source, eventName) {
    const events = getEvents(source);
    // First, check if the event we want to add to the structure already exists.
    if (events[eventName]) {
        // If it exists, we don't have to do anything.
        return;
    }
    // In other case, we have to create the structure for the event.
    // Note, that we might need to create intermediate events too.
    // I.e. if foo:bar:abc is being registered and we only have foo in the structure,
    // we need to also register foo:bar.
    // Currently processed event name.
    let name = eventName;
    // Name of the event that is a child event for currently processed event.
    let childEventName = null;
    // Array containing all newly created specific events.
    const newEventNodes = [];
    // While loop can't check for ':' index because we have to handle generic events too.
    // In each loop, we truncate event name, going from the most specific name to the generic one.
    // I.e. foo:bar:abc -> foo:bar -> foo.
    while (name !== '') {
        if (events[name]) {
            // If the currently processed event name is already registered, we can be sure
            // that it already has all the structure created, so we can break the loop here
            // as no more events need to be registered.
            break;
        }
        // If this event is not yet registered, create a new object for it.
        events[name] = makeEventNode();
        // Add it to the array with newly created events.
        newEventNodes.push(events[name]);
        // Add previously processed event name as a child of this event.
        if (childEventName) {
            events[name].childEvents.push(childEventName);
        }
        childEventName = name;
        // If `.lastIndexOf()` returns -1, `.substr()` will return '' which will break the loop.
        name = name.substr(0, name.lastIndexOf(':'));
    }
    if (name !== '') {
        // If name is not empty, we found an already registered event that was a parent of the
        // event we wanted to register.
        // Copy that event's callbacks to newly registered events.
        for (const node of newEventNodes) {
            node.callbacks = events[name].callbacks.slice();
        }
        // Add last newly created event to the already registered event.
        events[name].childEvents.push(childEventName);
    }
}
/**
 * Gets an array containing callbacks list for a given event and it's more specific events.
 * I.e. if given event is foo:bar and there is also foo:bar:abc event registered, this will
 * return callback list of foo:bar and foo:bar:abc (but not foo).
 */
function getCallbacksListsForNamespace(source, eventName) {
    const eventNode = getEvents(source)[eventName];
    if (!eventNode) {
        return [];
    }
    let callbacksLists = [eventNode.callbacks];
    for (let i = 0; i < eventNode.childEvents.length; i++) {
        const childCallbacksLists = getCallbacksListsForNamespace(source, eventNode.childEvents[i]);
        callbacksLists = callbacksLists.concat(childCallbacksLists);
    }
    return callbacksLists;
}
/**
 * Get the list of callbacks for a given event, but only if there any callbacks have been registered.
 * If there are no callbacks registered for given event, it checks if this is a specific event and looks
 * for callbacks for it's more generic version.
 */
function getCallbacksForEvent(source, eventName) {
    if (!source._events) {
        return null;
    }
    let currentEventName = eventName;
    do {
        const event = source._events[currentEventName];
        if (event && event.callbacks && event.callbacks.length) {
            return event.callbacks;
        }
        const colonIndex = currentEventName.lastIndexOf(':');
        currentEventName = colonIndex > -1 ? currentEventName.substring(0, colonIndex) : '';
    } while (currentEventName);
    return null;
}
/**
 * Fires delegated events for given map of destinations.
 *
 * @param destinations A map containing `[ {@link module:utils/emittermixin~Emitter}, "event name" ]` pair destinations.
 * @param eventInfo The original event info object.
 * @param fireArgs Arguments the original event was fired with.
 */
function fireDelegatedEvents(destinations, eventInfo, fireArgs) {
    for (let [emitter, name] of destinations) {
        if (!name) {
            name = eventInfo.name;
        }
        else if (typeof name == 'function') {
            name = name(eventInfo.name);
        }
        const delegatedInfo = new EventInfo(eventInfo.source, name);
        delegatedInfo.path = [...eventInfo.path];
        emitter.fire(delegatedInfo, ...fireArgs);
    }
}
/**
 * Helper for registering event callback on the emitter.
 */
function addEventListener(listener, emitter, event, callback, options) {
    if (emitter._addEventListener) {
        emitter._addEventListener(event, callback, options);
    }
    else {
        // Allow listening on objects that do not implement Emitter interface.
        // This is needed in some tests that are using mocks instead of the real objects with EmitterMixin mixed.
        (listener._addEventListener).call(emitter, event, callback, options);
    }
}
/**
 * Helper for removing event callback from the emitter.
 */
function removeEventListener(listener, emitter, event, callback) {
    if (emitter._removeEventListener) {
        emitter._removeEventListener(event, callback);
    }
    else {
        // Allow listening on objects that do not implement Emitter interface.
        // This is needed in some tests that are using mocks instead of the real objects with EmitterMixin mixed.
        listener._removeEventListener.call(emitter, event, callback);
    }
}

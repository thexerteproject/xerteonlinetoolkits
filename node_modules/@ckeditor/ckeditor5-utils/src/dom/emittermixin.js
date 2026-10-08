/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/emittermixin
 */
import { EmitterMixin, _getEmitterListenedTo, _setEmitterId } from '../emittermixin.js';
import { uid } from '../uid.js';
import { isNode } from './isnode.js';
import { isWindow } from './iswindow.js';
import { global } from './global.js';
const defaultEmitterClass = /* #__PURE__ */ DomEmitterMixin(/* #__PURE__ */ EmitterMixin());
export function DomEmitterMixin(base) {
    if (!base) {
        return defaultEmitterClass;
    }
    class Mixin extends base {
        listenTo(emitter, event, callback, options = {}) {
            // Check if emitter is an instance of DOM Node. If so, use corresponding ProxyEmitter (or create one if not existing).
            if (isNode(emitter) || isWindow(emitter) || emitter instanceof global.window.EventTarget) {
                const proxyOptions = {
                    capture: !!options.useCapture,
                    passive: !!options.usePassive
                };
                const proxyEmitter = this._getProxyEmitter(emitter, proxyOptions) || new ProxyEmitter(emitter, proxyOptions);
                this.listenTo(proxyEmitter, event, callback, options);
            }
            else {
                // Execute parent class method with Emitter (or ProxyEmitter) instance.
                super.listenTo(emitter, event, callback, options);
            }
        }
        stopListening(emitter, event, callback) {
            // Check if the emitter is an instance of DOM Node. If so, forward the call to the corresponding ProxyEmitters.
            if (isNode(emitter) || isWindow(emitter) || emitter instanceof global.window.EventTarget) {
                const proxyEmitters = this._getAllProxyEmitters(emitter);
                for (const proxy of proxyEmitters) {
                    this.stopListening(proxy, event, callback);
                }
            }
            else {
                // Execute parent class method with Emitter (or ProxyEmitter) instance.
                super.stopListening(emitter, event, callback);
            }
        }
        /**
         * Retrieves ProxyEmitter instance for given DOM Node residing in this Host and given options.
         *
         * @param node DOM Node of the ProxyEmitter.
         * @param options Additional options.
         * @param options.useCapture Indicates that events of this type will be dispatched to the registered
         * listener before being dispatched to any EventTarget beneath it in the DOM tree.
         * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
         * and prevents blocking browser's main thread by this event handler.
         * @returns ProxyEmitter instance bound to the DOM Node.
         */
        _getProxyEmitter(node, options) {
            return _getEmitterListenedTo(this, getProxyEmitterId(node, options));
        }
        /**
         * Retrieves all the ProxyEmitter instances for given DOM Node residing in this Host.
         *
         * @param node DOM Node of the ProxyEmitter.
         */
        _getAllProxyEmitters(node) {
            return [
                { capture: false, passive: false },
                { capture: false, passive: true },
                { capture: true, passive: false },
                { capture: true, passive: true }
            ].map(options => this._getProxyEmitter(node, options)).filter(proxy => !!proxy);
        }
    }
    return Mixin;
}
/**
 * Creates a ProxyEmitter instance. Such an instance is a bridge between a DOM Node firing events
 * and any Host listening to them. It is backwards compatible with {@link module:utils/emittermixin~Emitter#on}.
 * There is a separate instance for each combination of modes (useCapture & usePassive). The mode is concatenated with
 * UID stored in HTMLElement to give each instance unique identifier.
 *
 *                                  listenTo( click, ... )
 *                    +-----------------------------------------+
 *                    |              stopListening( ... )       |
 *     +----------------------------+                           |             addEventListener( click, ... )
 *     | Host                       |                           |   +---------------------------------------------+
 *     +----------------------------+                           |   |       removeEventListener( click, ... )     |
 *     | _listeningTo: {            |                +----------v-------------+                                   |
 *     |   UID+mode: {              |                | ProxyEmitter           |                                   |
 *     |     emitter: ProxyEmitter, |                +------------------------+                      +------------v----------+
 *     |     callbacks: {           |                | events: {              |                      | Node (HTMLElement)    |
 *     |       click: [ callbacks ] |                |   click: [ callbacks ] |                      +-----------------------+
 *     |     }                      |                | },                     |                      | data-ck-expando: UID  |
 *     |   }                        |                | _domNode: Node,        |                      +-----------------------+
 *     | }                          |                | _domListeners: {},     |                                   |
 *     | +------------------------+ |                | _emitterId: UID+mode   |                                   |
 *     | | DomEmitterMixin        | |                +--------------^---------+                                   |
 *     | +------------------------+ |                           |   |                                             |
 *     +--------------^-------------+                           |   +---------------------------------------------+
 *                    |                                         |                  click (DOM Event)
 *                    +-----------------------------------------+
 *                                fire( click, DOM Event )
 */
class ProxyEmitter extends /* #__PURE__ */ EmitterMixin() {
    _domNode;
    _options;
    /**
     * @param node DOM Node that fires events.
     * @param options Additional options.
     * @param options.useCapture Indicates that events of this type will be dispatched to the registered
     * listener before being dispatched to any EventTarget beneath it in the DOM tree.
     * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
     * and prevents blocking browser's main thread by this event handler.
     */
    constructor(node, options) {
        super();
        // Set emitter ID to match DOM Node "expando" property.
        _setEmitterId(this, getProxyEmitterId(node, options));
        // Remember the DOM Node this ProxyEmitter is bound to.
        this._domNode = node;
        // And given options.
        this._options = options;
    }
    /**
     * Collection of native DOM listeners.
     */
    _domListeners;
    /**
     * Registers a callback function to be executed when an event is fired.
     *
     * It attaches a native DOM listener to the DOM Node. When fired,
     * a corresponding Emitter event will also fire with DOM Event object as an argument.
     *
     * **Note**: This is automatically called by the
     * {@link module:utils/emittermixin~Emitter#listenTo `Emitter#listenTo()`}.
     *
     * @param event The name of the event.
     */
    attach(event) {
        // If the DOM Listener for given event already exist it is pointless
        // to attach another one.
        if (this._domListeners && this._domListeners[event]) {
            return;
        }
        const domListener = this._createDomListener(event);
        // Attach the native DOM listener to DOM Node.
        this._domNode.addEventListener(event, domListener, this._options);
        if (!this._domListeners) {
            this._domListeners = {};
        }
        // Store the native DOM listener in this ProxyEmitter. It will be helpful
        // when stopping listening to the event.
        this._domListeners[event] = domListener;
    }
    /**
     * Stops executing the callback on the given event.
     *
     * **Note**: This is automatically called by the
     * {@link module:utils/emittermixin~Emitter#stopListening `Emitter#stopListening()`}.
     *
     * @param event The name of the event.
     */
    detach(event) {
        let events;
        // Remove native DOM listeners which are orphans. If no callbacks
        // are awaiting given event, detach native DOM listener from DOM Node.
        // See: {@link attach}.
        if (this._domListeners[event] && (!(events = this._events[event]) || !events.callbacks.length)) {
            this._domListeners[event].removeListener();
        }
    }
    /**
     * Adds callback to emitter for given event.
     *
     * @internal
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    _addEventListener(event, callback, options) {
        this.attach(event);
        EmitterMixin().prototype._addEventListener.call(this, event, callback, options);
    }
    /**
     * Removes callback from emitter for given event.
     *
     * @internal
     * @param event The name of the event.
     * @param callback The function to stop being called.
     */
    _removeEventListener(event, callback) {
        EmitterMixin().prototype._removeEventListener.call(this, event, callback);
        this.detach(event);
    }
    /**
     * Creates a native DOM listener callback. When the native DOM event
     * is fired it will fire corresponding event on this ProxyEmitter.
     * Note: A native DOM Event is passed as an argument.
     *
     * @param event The name of the event.
     * @returns The DOM listener callback.
     */
    _createDomListener(event) {
        const domListener = (domEvt) => {
            this.fire(event, domEvt);
        };
        // Supply the DOM listener callback with a function that will help
        // detach it from the DOM Node, when it is no longer necessary.
        // See: {@link detach}.
        domListener.removeListener = () => {
            this._domNode.removeEventListener(event, domListener, this._options);
            delete this._domListeners[event];
        };
        return domListener;
    }
}
/**
 * Gets an unique DOM Node identifier. The identifier will be set if not defined.
 *
 * @returns UID for given DOM Node.
 */
function getNodeUID(node) {
    return node['data-ck-expando'] || (node['data-ck-expando'] = uid());
}
/**
 * Gets id of the ProxyEmitter for the given node.
 */
function getProxyEmitterId(node, options) {
    let id = getNodeUID(node);
    for (const option of Object.keys(options).sort()) {
        if (options[option]) {
            id += '-' + option;
        }
    }
    return id;
}

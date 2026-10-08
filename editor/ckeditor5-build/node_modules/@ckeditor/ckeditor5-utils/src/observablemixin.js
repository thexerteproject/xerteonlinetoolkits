/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/* eslint-disable @typescript-eslint/unified-signatures */
/**
 * @module utils/observablemixin
 */
import { EmitterMixin } from './emittermixin.js';
import { CKEditorError } from './ckeditorerror.js';
import { isObject } from 'es-toolkit/compat';
const observablePropertiesSymbol = Symbol('observableProperties');
const boundObservablesSymbol = Symbol('boundObservables');
const boundPropertiesSymbol = Symbol('boundProperties');
const decoratedMethods = Symbol('decoratedMethods');
const decoratedOriginal = Symbol('decoratedOriginal');
const defaultObservableClass = /* #__PURE__ */ ObservableMixin(/* #__PURE__ */ EmitterMixin());
export function ObservableMixin(base) {
    if (!base) {
        return defaultObservableClass;
    }
    class Mixin extends base {
        set(name, value) {
            // If the first parameter is an Object, iterate over its properties.
            if (isObject(name)) {
                Object.keys(name).forEach(property => {
                    this.set(property, name[property]);
                }, this);
                return;
            }
            initObservable(this);
            const properties = this[observablePropertiesSymbol];
            if ((name in this) && !properties.has(name)) {
                /**
                 * Cannot override an existing property.
                 *
                 * This error is thrown when trying to {@link module:utils/observablemixin~Observable#set set} a property with
                 * a name of an already existing property. For example:
                 *
                 * ```ts
                 * let observable = new Model();
                 * observable.property = 1;
                 * observable.set( 'property', 2 );			// throws
                 *
                 * observable.set( 'property', 1 );
                 * observable.set( 'property', 2 );			// ok, because this is an existing property.
                 * ```
                 *
                 * @error observable-set-cannot-override
                 */
                throw new CKEditorError('observable-set-cannot-override', this);
            }
            Object.defineProperty(this, name, {
                enumerable: true,
                configurable: true,
                get() {
                    return properties.get(name);
                },
                set(value) {
                    const oldValue = properties.get(name);
                    // Fire `set` event before the new value will be set to make it possible
                    // to override observable property without affecting `change` event.
                    // See https://github.com/ckeditor/ckeditor5-utils/issues/171.
                    let newValue = this.fire(`set:${name}`, name, value, oldValue);
                    if (newValue === undefined) {
                        newValue = value;
                    }
                    // Allow undefined as an initial value like A.define( 'x', undefined ) (#132).
                    // Note: When properties map has no such own property, then its value is undefined.
                    if (oldValue !== newValue || !properties.has(name)) {
                        properties.set(name, newValue);
                        this.fire(`change:${name}`, name, newValue, oldValue);
                    }
                }
            });
            this[name] = value;
        }
        bind(...bindProperties) {
            if (!bindProperties.length || !isStringArray(bindProperties)) {
                /**
                 * All properties must be strings.
                 *
                 * @error observable-bind-wrong-properties
                 */
                throw new CKEditorError('observable-bind-wrong-properties', this);
            }
            if ((new Set(bindProperties)).size !== bindProperties.length) {
                /**
                 * Properties must be unique.
                 *
                 * @error observable-bind-duplicate-properties
                 */
                throw new CKEditorError('observable-bind-duplicate-properties', this);
            }
            initObservable(this);
            const boundProperties = this[boundPropertiesSymbol];
            bindProperties.forEach(propertyName => {
                if (boundProperties.has(propertyName)) {
                    /**
                     * Cannot bind the same property more than once.
                     *
                     * @error observable-bind-rebind
                     */
                    throw new CKEditorError('observable-bind-rebind', this);
                }
            });
            const bindings = new Map();
            bindProperties.forEach(a => {
                const binding = { property: a, to: [] };
                boundProperties.set(a, binding);
                bindings.set(a, binding);
            });
            return {
                to: bindTo,
                toMany: bindToMany,
                _observable: this,
                _bindProperties: bindProperties,
                _to: [],
                _bindings: bindings
            };
        }
        unbind(...unbindProperties) {
            // Nothing to do here if not inited yet.
            if (!(this[observablePropertiesSymbol])) {
                return;
            }
            const boundProperties = this[boundPropertiesSymbol];
            const boundObservables = this[boundObservablesSymbol];
            if (unbindProperties.length) {
                if (!isStringArray(unbindProperties)) {
                    /**
                     * Properties must be strings.
                     *
                     * @error observable-unbind-wrong-properties
                     */
                    throw new CKEditorError('observable-unbind-wrong-properties', this);
                }
                unbindProperties.forEach(propertyName => {
                    const binding = boundProperties.get(propertyName);
                    // Nothing to do if the binding is not defined
                    if (!binding) {
                        return;
                    }
                    binding.to.forEach(([toObservable, toProperty]) => {
                        const toProperties = boundObservables.get(toObservable);
                        const toPropertyBindings = toProperties[toProperty];
                        toPropertyBindings.delete(binding);
                        if (!toPropertyBindings.size) {
                            delete toProperties[toProperty];
                        }
                        if (!Object.keys(toProperties).length) {
                            boundObservables.delete(toObservable);
                            this.stopListening(toObservable, 'change');
                        }
                    });
                    boundProperties.delete(propertyName);
                });
            }
            else {
                boundObservables.forEach((bindings, boundObservable) => {
                    this.stopListening(boundObservable, 'change');
                });
                boundObservables.clear();
                boundProperties.clear();
            }
        }
        decorate(methodName) {
            initObservable(this);
            const originalMethod = this[methodName];
            if (!originalMethod) {
                /**
                 * Cannot decorate an undefined method.
                 *
                 * @error observablemixin-cannot-decorate-undefined
                 * @param {object} object The object which method should be decorated.
                 * @param {string} methodName Name of the method which does not exist.
                 */
                throw new CKEditorError('observablemixin-cannot-decorate-undefined', this, { object: this, methodName });
            }
            this.on(methodName, (evt, args) => {
                evt.return = originalMethod.apply(this, args);
            });
            this[methodName] = function (...args) {
                return this.fire(methodName, args);
            };
            this[methodName][decoratedOriginal] = originalMethod;
            if (!this[decoratedMethods]) {
                this[decoratedMethods] = [];
            }
            this[decoratedMethods].push(methodName);
        }
        // Override the EmitterMixin stopListening method to be able to clean (and restore) decorated methods.
        // This is needed in case of:
        //  1. Have x.foo() decorated.
        //  2. Call x.stopListening()
        //  3. Call x.foo(). Problem: nothing happens (the original foo() method is not executed)
        stopListening(emitter, event, callback) {
            // Removing all listeners so let's clean the decorated methods to the original state.
            if (!emitter && this[decoratedMethods]) {
                for (const methodName of this[decoratedMethods]) {
                    this[methodName] = this[methodName][decoratedOriginal];
                }
                delete this[decoratedMethods];
            }
            super.stopListening(emitter, event, callback);
        }
        [observablePropertiesSymbol];
        [decoratedMethods];
        [boundPropertiesSymbol];
        [boundObservablesSymbol];
    }
    return Mixin;
}
// Init symbol properties needed for the observable mechanism to work.
function initObservable(observable) {
    // Do nothing if already inited.
    if (observable[observablePropertiesSymbol]) {
        return;
    }
    // The internal hash containing the observable's state.
    Object.defineProperty(observable, observablePropertiesSymbol, {
        value: new Map()
    });
    // Map containing bindings to external observables. It shares the binding objects
    // (`{ observable: A, property: 'a', to: ... }`) with {@link module:utils/observablemixin~Observable#_boundProperties} and
    // it is used to observe external observables to update own properties accordingly.
    // See {@link module:utils/observablemixin~Observable#bind}.
    //
    //		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
    //		console.log( A._boundObservables );
    //
    //			Map( {
    //				B: {
    //					x: Set( [
    //						{ observable: A, property: 'a', to: [ [ B, 'x' ] ] },
    //						{ observable: A, property: 'c', to: [ [ B, 'x' ] ] }
    //					] ),
    //					y: Set( [
    //						{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
    //					] )
    //				}
    //			} )
    //
    //		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
    //		console.log( A._boundObservables );
    //
    //			Map( {
    //				B: {
    //					x: Set( [
    //						{ observable: A, property: 'a', to: [ [ B, 'x' ] ] },
    //						{ observable: A, property: 'c', to: [ [ B, 'x' ] ] }
    //					] ),
    //					y: Set( [
    //						{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
    //					] ),
    //					z: Set( [
    //						{ observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
    //					] )
    //				},
    //				C: {
    //					w: Set( [
    //						{ observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
    //					] )
    //				}
    //			} )
    //
    Object.defineProperty(observable, boundObservablesSymbol, {
        value: new Map()
    });
    // Object that stores which properties of this observable are bound and how. It shares
    // the binding objects (`{ observable: A, property: 'a', to: ... }`) with
    // {@link module:utils/observablemixin~Observable#_boundObservables}. This data structure is
    // a reverse of {@link module:utils/observablemixin~Observable#_boundObservables} and it is helpful for
    // {@link module:utils/observablemixin~Observable#unbind}.
    //
    // See {@link module:utils/observablemixin~Observable#bind}.
    //
    //		A.bind( 'a', 'b', 'c' ).to( B, 'x', 'y', 'x' );
    //		console.log( A._boundProperties );
    //
    //			Map( {
    //				a: { observable: A, property: 'a', to: [ [ B, 'x' ] ] },
    //				b: { observable: A, property: 'b', to: [ [ B, 'y' ] ] },
    //				c: { observable: A, property: 'c', to: [ [ B, 'x' ] ] }
    //			} )
    //
    //		A.bind( 'd' ).to( B, 'z' ).to( C, 'w' ).as( callback );
    //		console.log( A._boundProperties );
    //
    //			Map( {
    //				a: { observable: A, property: 'a', to: [ [ B, 'x' ] ] },
    //				b: { observable: A, property: 'b', to: [ [ B, 'y' ] ] },
    //				c: { observable: A, property: 'c', to: [ [ B, 'x' ] ] },
    //				d: { observable: A, property: 'd', to: [ [ B, 'z' ], [ C, 'w' ] ], callback: callback }
    //			} )
    Object.defineProperty(observable, boundPropertiesSymbol, {
        value: new Map()
    });
}
/**
 * A chaining for {@link module:utils/observablemixin~Observable#bind} providing `.to()` interface.
 *
 * @param args Arguments of the `.to( args )` binding.
 */
function bindTo(...args) {
    const parsedArgs = parseBindToArgs(...args);
    const bindingsKeys = Array.from(this._bindings.keys());
    const numberOfBindings = bindingsKeys.length;
    // Eliminate A.bind( 'x' ).to( B, C )
    if (!parsedArgs.callback && parsedArgs.to.length > 1) {
        /**
         * Binding multiple observables only possible with callback.
         *
         * @error observable-bind-to-no-callback
         */
        throw new CKEditorError('observable-bind-to-no-callback', this);
    }
    // Eliminate A.bind( 'x', 'y' ).to( B, callback )
    if (numberOfBindings > 1 && parsedArgs.callback) {
        /**
         * Cannot bind multiple properties and use a callback in one binding.
         *
         * @error observable-bind-to-extra-callback
         */
        throw new CKEditorError('observable-bind-to-extra-callback', this);
    }
    parsedArgs.to.forEach(to => {
        // Eliminate A.bind( 'x', 'y' ).to( B, 'a' )
        if (to.properties.length && to.properties.length !== numberOfBindings) {
            /**
             * The number of properties must match.
             *
             * @error observable-bind-to-properties-length
             */
            throw new CKEditorError('observable-bind-to-properties-length', this);
        }
        // When no to.properties specified, observing source properties instead i.e.
        // A.bind( 'x', 'y' ).to( B ) -> Observe B.x and B.y
        if (!to.properties.length) {
            to.properties = this._bindProperties;
        }
    });
    this._to = parsedArgs.to;
    // Fill {@link BindChain#_bindings} with callback. When the callback is set there's only one binding.
    if (parsedArgs.callback) {
        this._bindings.get(bindingsKeys[0]).callback = parsedArgs.callback;
    }
    attachBindToListeners(this._observable, this._to);
    // Update observable._boundProperties and observable._boundObservables.
    updateBindToBound(this);
    // Set initial values of bound properties.
    this._bindProperties.forEach(propertyName => {
        updateBoundObservableProperty(this._observable, propertyName);
    });
}
/**
 * Binds to an attribute in a set of iterable observables.
 */
function bindToMany(observables, attribute, callback) {
    if (this._bindings.size > 1) {
        /**
         * Binding one attribute to many observables only possible with one attribute.
         *
         * @error observable-bind-to-many-not-one-binding
         */
        throw new CKEditorError('observable-bind-to-many-not-one-binding', this);
    }
    this.to(
    // Bind to #attribute of each observable...
    ...getBindingTargets(observables, attribute), 
    // ...using given callback to parse attribute values.
    callback);
}
/**
 * Returns an array of binding components for
 * {@link Observable#bind} from a set of iterable observables.
 */
function getBindingTargets(observables, attribute) {
    const observableAndAttributePairs = observables.map(observable => [observable, attribute]);
    // Merge pairs to one-dimension array of observables and attributes.
    return Array.prototype.concat.apply([], observableAndAttributePairs);
}
/**
 * Check if all entries of the array are of `String` type.
 */
function isStringArray(arr) {
    return arr.every(a => typeof a == 'string');
}
/**
 * Parses and validates {@link Observable#bind}`.to( args )` arguments and returns
 * an object with a parsed structure. For example
 *
 * ```ts
 * A.bind( 'x' ).to( B, 'a', C, 'b', call );
 * ```
 *
 * becomes
 *
 * ```ts
 * {
 * 	to: [
 * 		{ observable: B, properties: [ 'a' ] },
 * 		{ observable: C, properties: [ 'b' ] },
 * 	],
 * 	callback: call
 * }
 *
 * @param args Arguments of {@link Observable#bind}`.to( args )`.
 */
function parseBindToArgs(...args) {
    // Eliminate A.bind( 'x' ).to()
    if (!args.length) {
        /**
         * Invalid argument syntax in `to()`.
         *
         * @error observable-bind-to-parse-error
         */
        throw new CKEditorError('observable-bind-to-parse-error', null);
    }
    const parsed = { to: [] };
    let lastObservable;
    if (typeof args[args.length - 1] == 'function') {
        parsed.callback = args.pop();
    }
    args.forEach(a => {
        if (typeof a == 'string') {
            lastObservable.properties.push(a);
        }
        else if (typeof a == 'object') {
            lastObservable = { observable: a, properties: [] };
            parsed.to.push(lastObservable);
        }
        else {
            throw new CKEditorError('observable-bind-to-parse-error', null);
        }
    });
    return parsed;
}
/**
 * Synchronizes {@link module:utils/observable#_boundObservables} with {@link Binding}.
 *
 * @param binding A binding to store in {@link Observable#_boundObservables}.
 * @param toObservable A observable, which is a new component of `binding`.
 * @param toPropertyName A name of `toObservable`'s property, a new component of the `binding`.
 */
function updateBoundObservables(observable, binding, toObservable, toPropertyName) {
    const boundObservables = observable[boundObservablesSymbol];
    const bindingsToObservable = boundObservables.get(toObservable);
    const bindings = bindingsToObservable || {};
    if (!bindings[toPropertyName]) {
        bindings[toPropertyName] = new Set();
    }
    // Pass the binding to a corresponding Set in `observable._boundObservables`.
    bindings[toPropertyName].add(binding);
    if (!bindingsToObservable) {
        boundObservables.set(toObservable, bindings);
    }
}
/**
 * Synchronizes {@link Observable#_boundProperties} and {@link Observable#_boundObservables}
 * with {@link BindChain}.
 *
 * Assuming the following binding being created
 *
 * ```ts
 * A.bind( 'a', 'b' ).to( B, 'x', 'y' );
 * ```
 *
 * the following bindings were initialized by {@link Observable#bind} in {@link BindChain#_bindings}:
 *
 * ```ts
 * {
 * 	a: { observable: A, property: 'a', to: [] },
 * 	b: { observable: A, property: 'b', to: [] },
 * }
 * ```
 *
 * Iterate over all bindings in this chain and fill their `to` properties with
 * corresponding to( ... ) arguments (components of the binding), so
 *
 * ```ts
 * {
 * 	a: { observable: A, property: 'a', to: [ B, 'x' ] },
 * 	b: { observable: A, property: 'b', to: [ B, 'y' ] },
 * }
 * ```
 *
 * Then update the structure of {@link Observable#_boundObservables} with updated
 * binding, so it becomes:
 *
 * ```ts
 * Map( {
 * 	B: {
 * 		x: Set( [
 * 			{ observable: A, property: 'a', to: [ [ B, 'x' ] ] }
 * 		] ),
 * 		y: Set( [
 * 			{ observable: A, property: 'b', to: [ [ B, 'y' ] ] },
 * 		] )
 * 	}
 * } )
 * ```
 *
 * @param chain The binding initialized by {@link Observable#bind}.
 */
function updateBindToBound(chain) {
    let toProperty;
    chain._bindings.forEach((binding, propertyName) => {
        // Note: For a binding without a callback, this will run only once
        // like in A.bind( 'x', 'y' ).to( B, 'a', 'b' )
        // TODO: ES6 destructuring.
        chain._to.forEach(to => {
            toProperty = to.properties[binding.callback ? 0 : chain._bindProperties.indexOf(propertyName)];
            binding.to.push([to.observable, toProperty]);
            updateBoundObservables(chain._observable, binding, to.observable, toProperty);
        });
    });
}
/**
 * Updates an property of a {@link Observable} with a value
 * determined by an entry in {@link Observable#_boundProperties}.
 *
 * @param observable A observable which property is to be updated.
 * @param propertyName An property to be updated.
 */
function updateBoundObservableProperty(observable, propertyName) {
    const boundProperties = observable[boundPropertiesSymbol];
    const binding = boundProperties.get(propertyName);
    let propertyValue;
    // When a binding with callback is created like
    //
    // 		A.bind( 'a' ).to( B, 'b', C, 'c', callback );
    //
    // collect B.b and C.c, then pass them to callback to set A.a.
    if (binding.callback) {
        propertyValue = binding.callback.apply(observable, binding.to.map(to => to[0][to[1]]));
    }
    else {
        propertyValue = binding.to[0];
        propertyValue = propertyValue[0][propertyValue[1]];
    }
    if (Object.prototype.hasOwnProperty.call(observable, propertyName)) {
        observable[propertyName] = propertyValue;
    }
    else {
        observable.set(propertyName, propertyValue);
    }
}
/**
 * Starts listening to changes in {@link BindChain._to} observables to update
 * {@link BindChain._observable} {@link BindChain._bindProperties}. Also sets the
 * initial state of {@link BindChain._observable}.
 *
 * @param chain The chain initialized by {@link Observable#bind}.
 */
function attachBindToListeners(observable, toBindings) {
    toBindings.forEach(to => {
        const boundObservables = observable[boundObservablesSymbol];
        let bindings;
        // If there's already a chain between the observables (`observable` listens to
        // `to.observable`), there's no need to create another `change` event listener.
        if (!boundObservables.get(to.observable)) {
            observable.listenTo(to.observable, 'change', (evt, propertyName) => {
                bindings = boundObservables.get(to.observable)[propertyName];
                // Note: to.observable will fire for any property change, react
                // to changes of properties which are bound only.
                if (bindings) {
                    bindings.forEach(binding => {
                        updateBoundObservableProperty(observable, binding.property);
                    });
                }
            });
        }
    });
}

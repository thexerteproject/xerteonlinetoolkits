/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/observablemixin
 */
import { type Emitter } from './emittermixin.js';
import type { Constructor, Mixed } from './mix.js';
/**
 * A mixin that injects the "observable properties" and data binding functionality described in the
 * {@link ~Observable} interface.
 *
 * This function creates a class that inherits from the provided `base` and implements `Observable` interface.
 *
 * ```ts
 * class BaseClass { ... }
 *
 * class MyClass extends ObservableMixin( BaseClass ) {
 * 	// This class derives from `BaseClass` and implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the concept of observables in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep-dive} guide.
 *
 * @label EXTENDS
 */
export declare function ObservableMixin<Base extends Constructor<Emitter>>(base: Base): Mixed<Base, Observable>;
/**
 * A mixin that injects the "observable properties" and data binding functionality described in the
 * {@link ~Observable} interface.
 *
 * This function creates a class that implements `Observable` interface.
 *
 * ```ts
 * class MyClass extends ObservableMixin() {
 * 	// This class implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the concept of observables in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep dive} guide.
 *
 * @label NO_ARGUMENTS
 */
export declare function ObservableMixin(): {
    new (): Observable;
    prototype: Observable;
};
/**
 * An interface which adds "observable properties" and data binding functionality.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/observablemixin~Observable} mixin.
 *
 * ```ts
 * class MyClass extends ObservableMixin( OtherBaseClass ) {
 * 	// This class now implements the `Observable` interface.
 * }
 * ```
 *
 * Read more about the usage of this interface in the:
 * * {@glink framework/architecture/core-editor-architecture#event-system-and-observables Event system and observables}
 * section of the {@glink framework/architecture/core-editor-architecture Core editor architecture} guide,
 * * {@glink framework/deep-dive/observables Observables deep-dive} guide.
 */
export interface Observable extends Emitter {
    /**
     * Creates and sets the value of an observable property of this object. Such a property becomes a part
     * of the state and is observable.
     *
     * This method throws the `observable-set-cannot-override` error if the observable instance already
     * has a property with the given property name. This prevents from mistakenly overriding existing
     * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
     *
     * In TypeScript, those properties should be declared in class using `declare` keyword. In example:
     *
     * ```ts
     * public declare myProp: number;
     *
     * constructor() {
     * 	this.set( 'myProp', 2 );
     * }
     * ```
     *
     * @label KEY_VALUE
     * @param name The property's name.
     * @param value The property's value.
     */
    set<K extends keyof this & string>(name: K, value: this[K]): void;
    /**
     * Creates and sets the value of an observable properties of this object. Such a property becomes a part
     * of the state and is observable.
     *
     * It accepts a single object literal containing key/value pairs with properties to be set.
     *
     * This method throws the `observable-set-cannot-override` error if the observable instance already
     * has a property with the given property name. This prevents from mistakenly overriding existing
     * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
     *
     * In TypeScript, those properties should be declared in class using `declare` keyword. In example:
     *
     * ```ts
     * public declare myProp1: number;
     * public declare myProp2: string;
     *
     * constructor() {
     * 	this.set( {
     * 		'myProp1: 2,
     * 		'myProp2: 'foo'
     * 	} );
     * }
     * ```
     * @label OBJECT
     * @param values An object with `name=>value` pairs.
     */
    set(values: object & {
        readonly [K in keyof this]?: unknown;
    }): void;
    /**
     * Binds {@link #set observable properties} to other objects implementing the
     * {@link module:utils/observablemixin~Observable} interface.
     *
     * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
     * covering the topic of property bindings with some additional examples.
     *
     * Consider two objects: a `button` and an associated `command` (both `Observable`).
     *
     * A simple property binding could be as follows:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
     * ```
     *
     * or even shorter:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * ```
     *
     * which works in the following way:
     *
     * * `button.isEnabled` **instantly equals** `command.isEnabled`,
     * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
     *
     * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
     *
     * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isWorking' );
     * ```
     *
     * It is possible to bind more than one property at a time to shorten the code:
     *
     * ```ts
     * button.bind( 'isEnabled', 'value' ).to( command );
     * ```
     *
     * which corresponds to:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * button.bind( 'value' ).to( command );
     * ```
     *
     * The binding can include more than one observable, combining multiple data sources in a custom callback:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
     * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
     * ```
     *
     * Using a custom callback allows processing the value before passing it to the target property:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
     * ```
     *
     * It is also possible to bind to the same property in an array of observables.
     * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
     * must be enabled for the button to become enabled, use the following code:
     *
     * ```ts
     * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
     * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
     * ```
     *
     * @label SINGLE_BIND
     * @param bindProperty Observable property that will be bound to other observable(s).
     * @returns The bind chain with the `to()` and `toMany()` methods.
     */
    bind<K extends keyof this & string>(bindProperty: K): ObservableSingleBindChain<K, this[K]>;
    /**
     * Binds {@link #set observable properties} to other objects implementing the
     * {@link module:utils/observablemixin~Observable} interface.
     *
     * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
     * covering the topic of property bindings with some additional examples.
     *
     * Consider two objects: a `button` and an associated `command` (both `Observable`).
     *
     * A simple property binding could be as follows:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
     * ```
     *
     * or even shorter:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * ```
     *
     * which works in the following way:
     *
     * * `button.isEnabled` **instantly equals** `command.isEnabled`,
     * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
     *
     * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
     *
     * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isWorking' );
     * ```
     *
     * It is possible to bind more than one property at a time to shorten the code:
     *
     * ```ts
     * button.bind( 'isEnabled', 'value' ).to( command );
     * ```
     *
     * which corresponds to:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * button.bind( 'value' ).to( command );
     * ```
     *
     * The binding can include more than one observable, combining multiple data sources in a custom callback:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
     * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
     * ```
     *
     * Using a custom callback allows processing the value before passing it to the target property:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
     * ```
     *
     * It is also possible to bind to the same property in an array of observables.
     * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
     * must be enabled for the button to become enabled, use the following code:
     *
     * ```ts
     * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
     * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
     * ```
     *
     * @label DUAL_BIND
     * @param bindProperty1 Observable property that will be bound to other observable(s).
     * @param bindProperty2 Observable property that will be bound to other observable(s).
     * @returns The bind chain with the `to()` and `toMany()` methods.
     */
    bind<K1 extends keyof this & string, K2 extends keyof this & string>(bindProperty1: K1, bindProperty2: K2): ObservableDualBindChain<K1, this[K1], K2, this[K2]>;
    /**
     * Binds {@link #set observable properties} to other objects implementing the
     * {@link module:utils/observablemixin~Observable} interface.
     *
     * Read more in the {@glink framework/deep-dive/observables#property-bindings dedicated} guide
     * covering the topic of property bindings with some additional examples.
     *
     * Consider two objects: a `button` and an associated `command` (both `Observable`).
     *
     * A simple property binding could be as follows:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled' );
     * ```
     *
     * or even shorter:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * ```
     *
     * which works in the following way:
     *
     * * `button.isEnabled` **instantly equals** `command.isEnabled`,
     * * whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value.
     *
     * **Note**: To release the binding, use {@link module:utils/observablemixin~Observable#unbind}.
     *
     * You can also "rename" the property in the binding by specifying the new name in the `to()` chain:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isWorking' );
     * ```
     *
     * It is possible to bind more than one property at a time to shorten the code:
     *
     * ```ts
     * button.bind( 'isEnabled', 'value' ).to( command );
     * ```
     *
     * which corresponds to:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command );
     * button.bind( 'value' ).to( command );
     * ```
     *
     * The binding can include more than one observable, combining multiple data sources in a custom callback:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'isEnabled', ui, 'isVisible',
     * 	( isCommandEnabled, isUIVisible ) => isCommandEnabled && isUIVisible );
     * ```
     *
     * Using a custom callback allows processing the value before passing it to the target property:
     *
     * ```ts
     * button.bind( 'isEnabled' ).to( command, 'value', value => value === 'heading1' );
     * ```
     *
     * It is also possible to bind to the same property in an array of observables.
     * To bind a `button` to multiple commands (also `Observables`) so that each and every one of them
     * must be enabled for the button to become enabled, use the following code:
     *
     * ```ts
     * button.bind( 'isEnabled' ).toMany( [ commandA, commandB, commandC ], 'isEnabled',
     * 	( isAEnabled, isBEnabled, isCEnabled ) => isAEnabled && isBEnabled && isCEnabled );
     * ```
     *
     * @label MANY_BIND
     * @param bindProperties Observable properties that will be bound to other observable(s).
     * @returns The bind chain with the `to()` and `toMany()` methods.
     */
    bind(...bindProperties: Array<keyof this & string>): ObservableMultiBindChain;
    /**
     * Removes the binding created with {@link #bind}.
     *
     * ```ts
     * // Removes the binding for the 'a' property.
     * A.unbind( 'a' );
     *
     * // Removes bindings for all properties.
     * A.unbind();
     * ```
     *
     * @param unbindProperties Observable properties to be unbound. All the bindings will
     * be released if no properties are provided.
     */
    unbind(...unbindProperties: Array<keyof this & string>): void;
    /**
     * Turns the given methods of this object into event-based ones. This means that the new method will fire an event
     * (named after the method) and the original action will be plugged as a listener to that event.
     *
     * Read more in the {@glink framework/deep-dive/observables#decorating-object-methods dedicated} guide
     * covering the topic of decorating methods with some additional examples.
     *
     * Decorating the method does not change its behavior (it only adds an event),
     * but it allows to modify it later on by listening to the method's event.
     *
     * For example, to cancel the method execution the event can be {@link module:utils/eventinfo~EventInfo#stop stopped}:
     *
     * ```ts
     * class Foo extends ObservableMixin() {
     * 	constructor() {
     * 		super();
     * 		this.decorate( 'method' );
     * 	}
     *
     * 	method() {
     * 		console.log( 'called!' );
     * 	}
     * }
     *
     * const foo = new Foo();
     * foo.on( 'method', ( evt ) => {
     * 	evt.stop();
     * }, { priority: 'high' } );
     *
     * foo.method(); // Nothing is logged.
     * ```
     *
     *
     * **Note**: The high {@link module:utils/priorities~PriorityString priority} listener
     * has been used to execute this particular callback before the one which calls the original method
     * (which uses the "normal" priority).
     *
     * It is also possible to change the returned value:
     *
     * ```ts
     * foo.on( 'method', ( evt ) => {
     * 	evt.return = 'Foo!';
     * } );
     *
     * foo.method(); // -> 'Foo'
     * ```
     *
     * Finally, it is possible to access and modify the arguments the method is called with:
     *
     * ```ts
     * method( a, b ) {
     * 	console.log( `${ a }, ${ b }`  );
     * }
     *
     * // ...
     *
     * foo.on( 'method', ( evt, args ) => {
     * 	args[ 0 ] = 3;
     *
     * 	console.log( args[ 1 ] ); // -> 2
     * }, { priority: 'high' } );
     *
     * foo.method( 1, 2 ); // -> '3, 2'
     * ```
     *
     * @param methodName Name of the method to decorate.
     */
    decorate(methodName: keyof this & string): void;
}
/**
 * Fired when a property changed value.
 *
 * ```ts
 * observable.set( 'prop', 1 );
 *
 * observable.on<ObservableChangeEvent<number>>( 'change:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `${ propertyName } has changed from ${ oldValue } to ${ newValue }` );
 * } );
 *
 * observable.prop = 2; // -> 'prop has changed from 1 to 2'
 * ```
 *
 * @eventName ~Observable#change:\{property\}
 * @param {String} name The property name.
 * @param {*} value The new property value.
 * @param {*} oldValue The previous property value.
 */
export type ObservableChangeEvent<TValue = any> = {
    name: 'change' | `change:${string}`;
    args: [name: string, value: TValue, oldValue: TValue];
};
/**
 * Fired when a property value is going to be set but is not set yet (before the `change` event is fired).
 *
 * You can control the final value of the property by using
 * the {@link module:utils/eventinfo~EventInfo#return event's `return` property}.
 *
 * ```ts
 * observable.set( 'prop', 1 );
 *
 * observable.on<ObservableSetEvent<number>>( 'set:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `Value is going to be changed from ${ oldValue } to ${ newValue }` );
 * 	console.log( `Current property value is ${ observable[ propertyName ] }` );
 *
 * 	// Let's override the value.
 * 	evt.return = 3;
 * } );
 *
 * observable.on<ObservableChangeEvent<number>>( 'change:prop', ( evt, propertyName, newValue, oldValue ) => {
 * 	console.log( `Value has changed from ${ oldValue } to ${ newValue }` );
 * } );
 *
 * observable.prop = 2; // -> 'Value is going to be changed from 1 to 2'
 *                      // -> 'Current property value is 1'
 *                      // -> 'Value has changed from 1 to 3'
 * ```
 *
 * **Note:** The event is fired even when the new value is the same as the old value.
 *
 * @eventName ~Observable#set:\{property\}
 * @param {String} name The property name.
 * @param {*} value The new property value.
 * @param {*} oldValue The previous property value.
 */
export type ObservableSetEvent<TValue = any> = {
    name: 'set' | `set:${string}`;
    args: [name: string, value: TValue, oldValue: TValue];
    return: TValue;
};
/**
 * Utility type that creates an event describing type from decorated method.
 *
 * ```ts
 * class Foo extends ObservableMixin() {
 * 	constructor() {
 * 		super();
 * 		this.decorate( 'method' );
 * 	}
 *
 * 	method( a: number, b: number ): number {
 * 		return a + b;
 * 	}
 * }
 *
 * type FooMethodEvent = DecoratedMethodEvent<Foo, 'method'>;
 *
 * const foo = new Foo();
 *
 * foo.on<FooMethodEvent>( 'method', ( evt, [ a, b ] ) => {
 * 	// `a` and `b` are inferred as numbers.
 * } )
 * ```
 */
export type DecoratedMethodEvent<TObservable extends Observable & {
    [N in TName]: (...args: Array<any>) => any;
}, TName extends keyof TObservable & string> = {
    name: TName;
    args: [Parameters<TObservable[TName]>];
    return: ReturnType<TObservable[TName]>;
};
export interface ObservableSingleBindChain<TKey extends string, TVal> {
    toMany<O extends Observable, K extends keyof O>(observables: ReadonlyArray<O>, key: K, callback: (...values: Array<O[K]>) => TVal): void;
    to<O extends ObservableWithProperty<TKey, TVal>>(observable: O): void;
    to<O extends ObservableWithProperty<TKey>>(observable: O, callback: (value: O[TKey]) => TVal): void;
    to<O extends ObservableWithProperty<K, TVal>, K extends keyof O>(observable: O, key: K): void;
    to<O extends Observable, K extends keyof O>(observable: O, key: K, callback: (value: O[K]) => TVal): void;
    to<O1 extends ObservableWithProperty<TKey>, O2 extends ObservableWithProperty<TKey>>(observable1: O1, observable2: O2, callback: (value1: O1[TKey], value2: O2[TKey]) => TVal): void;
    to<O1 extends Observable, K1 extends keyof O1, O2 extends Observable, K2 extends keyof O2>(observable1: O1, key1: K1, observable2: O2, key2: K2, callback: (value1: O1[K1], value2: O2[K2]) => TVal): void;
    to<O1 extends ObservableWithProperty<TKey>, O2 extends ObservableWithProperty<TKey>, O3 extends ObservableWithProperty<TKey>>(observable1: O1, observable2: O2, observable3: O3, callback: (value1: O1[TKey], value2: O2[TKey], value3: O3[TKey]) => TVal): void;
    to<O1 extends Observable, K1 extends keyof O1, O2 extends Observable, K2 extends keyof O2, O3 extends Observable, K3 extends keyof O3>(observable1: O1, key1: K1, observable2: O2, key2: K2, observable3: O3, key3: K3, callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3]) => TVal): void;
    to<O1 extends ObservableWithProperty<TKey>, O2 extends ObservableWithProperty<TKey>, O3 extends ObservableWithProperty<TKey>, O4 extends ObservableWithProperty<TKey>>(observable1: O1, observable2: O2, observable3: O3, observable4: O4, callback: (value1: O1[TKey], value2: O2[TKey], value3: O3[TKey], value4: O4[TKey]) => TVal): void;
    to<O1 extends Observable, K1 extends keyof O1, O2 extends Observable, K2 extends keyof O2, O3 extends Observable, K3 extends keyof O3, O4 extends Observable, K4 extends keyof O4>(observable1: O1, key1: K1, observable2: O2, key2: K2, observable3: O3, key3: K3, observable4: O4, key4: K4, callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3], value4: O4[K4]) => TVal): void;
    to<O1 extends ObservableWithProperty<TKey>, O2 extends ObservableWithProperty<TKey>, O3 extends ObservableWithProperty<TKey>, O4 extends ObservableWithProperty<TKey>, O5 extends ObservableWithProperty<TKey>>(observable1: O1, observable2: O2, observable3: O3, observable4: O4, observable5: O5, callback: (value1: O1[TKey], value2: O2[TKey], value3: O3[TKey], value4: O4[TKey], value5: O5[TKey]) => TVal): void;
    to<O1 extends Observable, K1 extends keyof O1, O2 extends Observable, K2 extends keyof O2, O3 extends Observable, K3 extends keyof O3, O4 extends Observable, K4 extends keyof O4, O5 extends Observable, K5 extends keyof O5>(observable1: O1, key1: K1, observable2: O2, key2: K2, observable3: O3, key3: K3, observable4: O4, key4: K4, observable5: O5, key5: K5, callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3], value4: O4[K4], value5: O5[K5]) => TVal): void;
}
/**
 * A helper type that can be used as a constraint, ensuring the type is both observable and have the given property.
 *
 * ```ts
 * // Ensures that `obj` is `Observable` and have property named 'abc'.
 * function f<O extends ObservableWithProperty<'abc'>>( obj: O ) {}
 *
 * // Ensures that `obj` is `Observable` and have property named 'abc' with value `number`.
 * function f<O extends ObservableWithProperty<'abc', number>>( obj: O ) {}
 * ```
 */
export type ObservableWithProperty<TKey extends PropertyKey, TVal = any> = undefined extends TVal ? Observable & {
    [P in TKey]?: TVal;
} : Observable & {
    [P in TKey]: TVal;
};
export interface ObservableDualBindChain<TKey1 extends string, TVal1, TKey2 extends string, TVal2> {
    to<O extends ObservableWithProperty<K1, TVal1> & ObservableWithProperty<K2, TVal2>, K1 extends keyof O, K2 extends keyof O>(observable: O, key1: K1, key2: K2): void;
    to<O extends ObservableWithProperty<TKey1, TVal1> & ObservableWithProperty<TKey2, TVal2>>(observable: O): void;
}
export interface ObservableMultiBindChain {
    to<O extends Observable>(observable: O, ...properties: Array<keyof O>): void;
}

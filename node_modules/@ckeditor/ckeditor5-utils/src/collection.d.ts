/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
declare const Collection_base: {
    new (): import("./emittermixin.js").Emitter;
    prototype: import("./emittermixin.js").Emitter;
};
/**
 * Collections are ordered sets of objects. Items in the collection can be retrieved by their indexes
 * in the collection (like in an array) or by their ids.
 *
 * If an object without an `id` property is being added to the collection, the `id` property will be generated
 * automatically. Note that the automatically generated id is unique only within this single collection instance.
 *
 * By default an item in the collection is identified by its `id` property. The name of the identifier can be
 * configured through the constructor of the collection.
 *
 * @typeParam T The type of the collection element.
 */
export declare class Collection<T extends Record<string, any>> extends /* #__PURE__ */ Collection_base implements Iterable<T> {
    /**
     * The internal list of items in the collection.
     */
    private readonly _items;
    /**
     * The internal map of items in the collection.
     */
    private readonly _itemMap;
    /**
     * The name of the property which is considered to identify an item.
     */
    private readonly _idProperty;
    /**
     * A collection instance this collection is bound to as a result
     * of calling {@link #bindTo} method.
     */
    private _bindToCollection?;
    /**
     * A helper mapping external items of a bound collection ({@link #bindTo})
     * and actual items of this collection. It provides information
     * necessary to properly remove items bound to another collection.
     *
     * See {@link #_bindToInternalToExternalMap}.
     */
    private readonly _bindToExternalToInternalMap;
    /**
     * A helper mapping items of this collection to external items of a bound collection
     * ({@link #bindTo}). It provides information necessary to manage the bindings, e.g.
     * to avoid loops in two–way bindings.
     *
     * See {@link #_bindToExternalToInternalMap}.
     */
    private readonly _bindToInternalToExternalMap;
    /**
     * Stores indexes of skipped items from bound external collection.
     */
    private _skippedIndexesFromExternal;
    /**
     * Creates a new Collection instance.
     *
     * You can pass a configuration object as the argument of the constructor:
     *
     * ```ts
     * const emptyCollection = new Collection<{ name: string }>( { idProperty: 'name' } );
     * emptyCollection.add( { name: 'John' } );
     * console.log( collection.get( 'John' ) ); // -> { name: 'John' }
     * ```
     *
     * The collection is empty by default. You can add new items using the {@link #add} method:
     *
     * ```ts
     * const collection = new Collection<{ id: string }>();
     *
     * collection.add( { id: 'John' } );
     * console.log( collection.get( 0 ) ); // -> { id: 'John' }
     * ```
     *
     * @label NO_ITEMS
     * @param options The options object.
     * @param options.idProperty The name of the property which is used to identify an item.
     * Items that do not have such a property will be assigned one when added to the collection.
     */
    constructor(options?: {
        readonly idProperty?: string;
    });
    /**
     * Creates a new Collection instance with specified initial items.
     *
     * ```ts
     * const collection = new Collection<{ id: string }>( [ { id: 'John' }, { id: 'Mike' } ] );
     *
     * console.log( collection.get( 0 ) ); // -> { id: 'John' }
     * console.log( collection.get( 1 ) ); // -> { id: 'Mike' }
     * console.log( collection.get( 'Mike' ) ); // -> { id: 'Mike' }
     * ```
     *
     * You can always pass a configuration object as the last argument of the constructor:
     *
     * ```ts
     * const nonEmptyCollection = new Collection<{ name: string }>( [ { name: 'John' } ], { idProperty: 'name' } );
     * nonEmptyCollection.add( { name: 'George' } );
     * console.log( collection.get( 'George' ) ); // -> { name: 'George' }
     * console.log( collection.get( 'John' ) ); // -> { name: 'John' }
     * ```
     *
     * @label INITIAL_ITEMS
     * @param initialItems The initial items of the collection.
     * @param options The options object.
     * @param options.idProperty The name of the property which is used to identify an item.
     * Items that do not have such a property will be assigned one when added to the collection.
     */
    constructor(initialItems: Iterable<T>, options?: {
        readonly idProperty?: string;
    });
    /**
     * The number of items available in the collection.
     */
    get length(): number;
    /**
     * Returns the first item from the collection or null when collection is empty.
     */
    get first(): T | null;
    /**
     * Returns the last item from the collection or null when collection is empty.
     */
    get last(): T | null;
    /**
     * Adds an item into the collection.
     *
     * If the item does not have an id, then it will be automatically generated and set on the item.
     *
     * @param item
     * @param index The position of the item in the collection. The item
     * is pushed to the collection when `index` not specified.
     * @fires add
     * @fires change
     */
    add(item: T, index?: number): this;
    /**
     * Adds multiple items into the collection.
     *
     * Any item not containing an id will get an automatically generated one.
     *
     * @param items
     * @param index The position of the insertion. Items will be appended if no `index` is specified.
     * @fires add
     * @fires change
     */
    addMany(items: Iterable<T>, index?: number): this;
    /**
     * Gets an item by its ID or index.
     *
     * @param idOrIndex The item ID or index in the collection.
     * @returns The requested item or `null` if such item does not exist.
     */
    get(idOrIndex: string | number): T | null;
    /**
     * Returns a Boolean indicating whether the collection contains an item.
     *
     * @param itemOrId The item or its ID in the collection.
     * @returns `true` if the collection contains the item, `false` otherwise.
     */
    has(itemOrId: T | string): boolean;
    /**
     * Gets an index of an item in the collection.
     * When an item is not defined in the collection, the index will equal -1.
     *
     * @param itemOrId The item or its ID in the collection.
     * @returns The index of a given item.
     */
    getIndex(itemOrId: T | string): number;
    /**
     * Removes an item from the collection.
     *
     * @param subject The item to remove, its ID or index in the collection.
     * @returns The removed item.
     * @fires remove
     * @fires change
     */
    remove(subject: T | number | string): T;
    /**
     * Executes the callback for each item in the collection and composes an array or values returned by this callback.
     *
     * @typeParam U The result type of the callback.
     * @param callback
     * @param ctx Context in which the `callback` will be called.
     * @returns The result of mapping.
     */
    map<U>(callback: (item: T, index: number) => U, ctx?: any): Array<U>;
    /**
     * Performs the specified action for each item in the collection.
     *
     * @param ctx Context in which the `callback` will be called.
     */
    forEach(callback: (item: T, index: number) => unknown, ctx?: any): void;
    /**
     * Finds the first item in the collection for which the `callback` returns a true value.
     *
     * @param callback
     * @param ctx Context in which the `callback` will be called.
     * @returns The item for which `callback` returned a true value.
     */
    find(callback: (item: T, index: number) => boolean, ctx?: any): T | undefined;
    /**
     * Returns an array with items for which the `callback` returned a true value.
     *
     * @param callback
     * @param ctx Context in which the `callback` will be called.
     * @returns The array with matching items.
     */
    filter(callback: (item: T, index: number) => boolean, ctx?: any): Array<T>;
    /**
     * Removes all items from the collection and destroys the binding created using
     * {@link #bindTo}.
     *
     * @fires remove
     * @fires change
     */
    clear(): void;
    /**
     * Binds and synchronizes the collection with another one.
     *
     * The binding can be a simple factory:
     *
     * ```ts
     * class FactoryClass {
     * 	public label: string;
     *
     * 	constructor( data: { label: string } ) {
     * 		this.label = data.label;
     * 	}
     * }
     *
     * const source = new Collection<{ label: string }>( { idProperty: 'label' } );
     * const target = new Collection<FactoryClass>();
     *
     * target.bindTo( source ).as( FactoryClass );
     *
     * source.add( { label: 'foo' } );
     * source.add( { label: 'bar' } );
     *
     * console.log( target.length ); // 2
     * console.log( target.get( 1 ).label ); // 'bar'
     *
     * source.remove( 0 );
     * console.log( target.length ); // 1
     * console.log( target.get( 0 ).label ); // 'bar'
     * ```
     *
     * or the factory driven by a custom callback:
     *
     * ```ts
     * class FooClass {
     * 	public label: string;
     *
     * 	constructor( data: { label: string } ) {
     * 		this.label = data.label;
     * 	}
     * }
     *
     * class BarClass {
     * 	public label: string;
     *
     * 	constructor( data: { label: string } ) {
     * 		this.label = data.label;
     * 	}
     * }
     *
     * const source = new Collection<{ label: string }>( { idProperty: 'label' } );
     * const target = new Collection<FooClass | BarClass>();
     *
     * target.bindTo( source ).using( ( item ) => {
     * 	if ( item.label == 'foo' ) {
     * 		return new FooClass( item );
     * 	} else {
     * 		return new BarClass( item );
     * 	}
     * } );
     *
     * source.add( { label: 'foo' } );
     * source.add( { label: 'bar' } );
     *
     * console.log( target.length ); // 2
     * console.log( target.get( 0 ) instanceof FooClass ); // true
     * console.log( target.get( 1 ) instanceof BarClass ); // true
     * ```
     *
     * or the factory out of property name:
     *
     * ```ts
     * const source = new Collection<{ nested: { value: string } }>();
     * const target = new Collection<{ value: string }>();
     *
     * target.bindTo( source ).using( 'nested' );
     *
     * source.add( { nested: { value: 'foo' } } );
     * source.add( { nested: { value: 'bar' } } );
     *
     * console.log( target.length ); // 2
     * console.log( target.get( 0 ).value ); // 'foo'
     * console.log( target.get( 1 ).value ); // 'bar'
     * ```
     *
     * It's possible to skip specified items by returning null value:
     *
     * ```ts
     * const source = new Collection<{ hidden: boolean }>();
     * const target = new Collection<{ hidden: boolean }>();
     *
     * target.bindTo( source ).using( item => {
     * 	if ( item.hidden ) {
     * 		return null;
     * 	}
     *
     * 	return item;
     * } );
     *
     * source.add( { hidden: true } );
     * source.add( { hidden: false } );
     *
     * console.log( source.length ); // 2
     * console.log( target.length ); // 1
     * ```
     *
     * **Note**: {@link #clear} can be used to break the binding.
     *
     * @typeParam S The type of `externalCollection` element.
     * @param externalCollection A collection to be bound.
     * @returns The binding chain object.
     */
    bindTo<S extends Record<string, any>>(externalCollection: Collection<S>): CollectionBindToChain<S, T>;
    /**
     * Finalizes and activates a binding initiated by {@link #bindTo}.
     *
     * @param factory A function which produces collection items.
     */
    private _setUpBindToBinding;
    /**
     * Returns an unique id property for a given `item`.
     *
     * The method will generate new id and assign it to the `item` if it doesn't have any.
     *
     * @param item Item to be added.
     */
    private _getItemIdBeforeAdding;
    /**
     * Core {@link #remove} method implementation shared in other functions.
     *
     * In contrast this method **does not** fire the {@link #event:change} event.
     *
     * @param subject The item to remove, its id or index in the collection.
     * @returns Returns an array with the removed item and its index.
     * @fires remove
     */
    private _remove;
    /**
     * Iterable interface.
     */
    [Symbol.iterator](): Iterator<T>;
}
/**
 * Fired when an item is added to the collection.
 *
 * @eventName ~Collection#add
 * @param item The added item.
 * @param index An index where the addition occurred.
 */
export type CollectionAddEvent<T = any> = {
    name: 'add';
    args: [item: T, index: number];
};
/**
 * Fired when the collection was changed due to adding or removing items.
 *
 * @eventName ~Collection#change
 * @param data Changed items.
 */
export type CollectionChangeEvent<T = any> = {
    name: 'change';
    args: [data: CollectionChangeEventData<T>];
};
/**
 * A structure describing the {@link ~Collection#event:change `Collection#change`} event.
 */
export type CollectionChangeEventData<T = any> = {
    /**
     * A list of added items.
     */
    added: Iterable<T>;
    /**
     * A list of removed items.
     */
    removed: Iterable<T>;
    /**
     * An index where the addition or removal occurred.
     */
    index: number;
};
/**
 * Fired when an item is removed from the collection.
 *
 * @eventName ~Collection#remove
 * @param item The removed item.
 * @param index Index from which item was removed.
 */
export type CollectionRemoveEvent<T = any> = {
    name: 'remove';
    args: [item: T, index: number];
};
/**
 * An object returned by the {@link module:utils/collection~Collection#bindTo `bindTo()`} method
 * providing functions that specify the type of the binding.
 *
 * See the {@link module:utils/collection~Collection#bindTo `bindTo()`} documentation for examples.
 */
export interface CollectionBindToChain<S, T> {
    /**
     * Creates the class factory binding in which items of the source collection are passed to
     * the constructor of the specified class.
     *
     * @param Class The class constructor used to create instances in the factory.
     */
    as(Class: new (item: S) => T): void;
    /**
     * Creates a callback or a property binding.
     *
     * @param callbackOrProperty When the function is passed, it should return
     * the collection items. When the string is provided, the property value is used to create the bound collection items.
     */
    using(callbackOrProperty: keyof S | ((item: S) => T | null)): void;
}
export {};

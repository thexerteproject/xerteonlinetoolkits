/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/markercollection
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { ModelLiveRange, type ModelLiveRangeChangeContentEvent, type ModelLiveRangeChangeRangeEvent, type ModelLiveRangeChangeEvent } from './liverange.js';
import { type ModelPosition } from './position.js';
import { type ModelRange } from './range.js';
declare const MarkerCollection_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * The collection of all {@link module:engine/model/markercollection~Marker markers} attached to the document.
 * It lets you {@link module:engine/model/markercollection~MarkerCollection#get get} markers or track them using
 * {@link module:engine/model/markercollection~MarkerCollection#event:update} event.
 *
 * To create, change or remove makers use {@link module:engine/model/writer~ModelWriter model writers'} methods:
 * {@link module:engine/model/writer~ModelWriter#addMarker} or {@link module:engine/model/writer~ModelWriter#removeMarker}. Since
 * the writer is the only proper way to change the data model it is not possible to change markers directly using this
 * collection. All markers created by the writer will be automatically added to this collection.
 *
 * By default there is one marker collection available as {@link module:engine/model/model~Model#markers model property}.
 *
 * @see module:engine/model/markercollection~Marker
 */
export declare class MarkerCollection extends /* #__PURE__ */ MarkerCollection_base implements Iterable<Marker> {
    /**
     * Stores {@link ~Marker markers} added to the collection.
     */
    private _markers;
    /**
     * Iterable interface.
     *
     * Iterates over all {@link ~Marker markers} added to the collection.
     */
    [Symbol.iterator](): IterableIterator<Marker>;
    /**
     * Checks if given {@link ~Marker marker} or marker name is in the collection.
     *
     * @param markerOrName Name of marker or marker instance to check.
     * @returns `true` if marker is in the collection, `false` otherwise.
     */
    has(markerOrName: string | Marker): boolean;
    /**
     * Returns {@link ~Marker marker} with given `markerName`.
     *
     * @param markerName Name of marker to get.
     * @returns Marker with given name or `null` if such marker was
     * not added to the collection.
     */
    get(markerName: string): Marker | null;
    /**
     * Creates and adds a {@link ~Marker marker} to the `MarkerCollection` with given name on given
     * {@link module:engine/model/range~ModelRange range}.
     *
     * If `MarkerCollection` already had a marker with given name (or {@link ~Marker marker} was passed), the marker in
     * collection is updated and {@link module:engine/model/markercollection~MarkerCollection#event:update} event is fired
     * but only if there was a change (marker range or {@link module:engine/model/markercollection~Marker#managedUsingOperations}
     * flag has changed.
     *
     * @internal
     * @fires update
     * @param markerOrName Name of marker to set or marker instance to update.
     * @param range Marker range.
     * @param managedUsingOperations Specifies whether the marker is managed using operations.
     * @param affectsData Specifies whether the marker affects the data produced by the data pipeline
     * (is persisted in the editor's data).
     * @returns `Marker` instance which was added or updated.
     */
    _set(markerOrName: string | Marker, range: ModelRange, managedUsingOperations?: boolean, affectsData?: boolean): Marker;
    /**
     * Removes given {@link ~Marker marker} or a marker with given name from the `MarkerCollection`.
     *
     * @internal
     * @fires update
     * @param markerOrName Marker or name of a marker to remove.
     * @returns `true` if marker was found and removed, `false` otherwise.
     */
    _remove(markerOrName: string | Marker): boolean;
    /**
     * Fires an {@link module:engine/model/markercollection~MarkerCollection#event:update} event for the given {@link ~Marker marker}
     * but does not change the marker. Useful to force {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast
     * conversion} for the marker.
     *
     * @internal
     * @fires update
     * @param markerOrName Marker or name of a marker to refresh.
     */
    _refresh(markerOrName: string | Marker): void;
    /**
     * Returns iterator that iterates over all markers, which ranges
     * contain given {@link module:engine/model/position~ModelPosition position}.
     */
    getMarkersAtPosition(position: ModelPosition): IterableIterator<Marker>;
    /**
     * Returns iterator that iterates over all markers, which intersects with given {@link module:engine/model/range~ModelRange range}.
     */
    getMarkersIntersectingRange(range: ModelRange): Iterable<Marker>;
    /**
     * Destroys marker collection and all markers inside it.
     */
    destroy(): void;
    /**
     * Iterates over all markers that starts with given `prefix`.
     *
     * ```ts
     * const markerFooA = markersCollection._set( 'foo:a', rangeFooA );
     * const markerFooB = markersCollection._set( 'foo:b', rangeFooB );
     * const markerBarA = markersCollection._set( 'bar:a', rangeBarA );
     * const markerFooBarA = markersCollection._set( 'foobar:a', rangeFooBarA );
     * Array.from( markersCollection.getMarkersGroup( 'foo' ) ); // [ markerFooA, markerFooB ]
     * Array.from( markersCollection.getMarkersGroup( 'a' ) ); // []
     * ```
     */
    getMarkersGroup(prefix: string): IterableIterator<Marker>;
    /**
     * Destroys the marker.
     */
    private _destroyMarker;
}
export interface MarkerData {
    /**
     * Marker range. `null` if the marker was removed.
     */
    range: ModelRange | null;
    /**
     * A property defining if the marker affects data.
     */
    affectsData: boolean;
    /**
     * A property defining if the marker is managed using operations.
     */
    managedUsingOperations: boolean;
}
declare const Marker_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ModelTypeCheckable, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * `Marker` is a continuous part of the model (like a range), is named and represents some kind of information about the
 * marked part of the model document. In contrary to {@link module:engine/model/node~ModelNode nodes}, which are building blocks of
 * the model document tree, markers are not stored directly in the document tree but in the
 * {@link module:engine/model/model~Model#markers model markers' collection}. Still, they are document data, by giving
 * additional meaning to the part of a model document between marker start and marker end.
 *
 * In this sense, markers are similar to adding and converting attributes on nodes. The difference is that attribute is
 * connected with a given node (e.g. a character is bold no matter if it gets moved or content around it changes).
 * Markers on the other hand are continuous ranges and are characterized by their start and end position. This means that
 * any character in the marker is marked by the marker. For example, if a character is moved outside of marker it stops being
 * "special" and the marker is shrunk. Similarly, when a character is moved into the marker from other place in document
 * model, it starts being "special" and the marker is enlarged.
 *
 * Another upside of markers is that finding marked part of document is fast and easy. Using attributes to mark some nodes
 * and then trying to find that part of document would require traversing whole document tree. Marker gives instant access
 * to the range which it is marking at the moment.
 *
 * Markers are built from a name and a range.
 *
 * Range of the marker is updated automatically when document changes, using
 * {@link module:engine/model/liverange~ModelLiveRange live range} mechanism.
 *
 * Name is used to group and identify markers. Names have to be unique, but markers can be grouped by
 * using common prefixes, separated with `:`, for example: `user:john` or `search:3`. That's useful in term of creating
 * namespaces for custom elements (e.g. comments, highlights). You can use this prefixes in
 * {@link module:engine/model/markercollection~MarkerCollection#event:update} listeners to listen on changes in a group of markers.
 * For instance: `model.markers.on( 'update:user', callback );` will be called whenever any `user:*` markers changes.
 *
 * There are two types of markers.
 *
 * 1. Markers managed directly, without using operations. They are added directly by {@link module:engine/model/writer~ModelWriter}
 * to the {@link module:engine/model/markercollection~MarkerCollection} without any additional mechanism. They can be used
 * as bookmarks or visual markers. They are great for showing results of the find, or select link when the focus is in the input.
 *
 * 1. Markers managed using operations. These markers are also stored in {@link module:engine/model/markercollection~MarkerCollection}
 * but changes in these markers is managed the same way all other changes in the model structure - using operations.
 * Therefore, they are handled in the undo stack and synchronized between clients if the collaboration plugin is enabled.
 * This type of markers is useful for solutions like spell checking or comments.
 *
 * Both type of them should be added / updated by {@link module:engine/model/writer~ModelWriter#addMarker}
 * and removed by {@link module:engine/model/writer~ModelWriter#removeMarker} methods.
 *
 * ```ts
 * model.change( ( writer ) => {
 * 	const marker = writer.addMarker( name, { range, usingOperation: true } );
 *
 * 	// ...
 *
 * 	writer.removeMarker( marker );
 * } );
 * ```
 *
 * See {@link module:engine/model/writer~ModelWriter} to find more examples.
 *
 * Since markers need to track change in the document, for efficiency reasons, it is best to create and keep as little
 * markers as possible and remove them as soon as they are not needed anymore.
 *
 * Markers can be downcasted and upcasted.
 *
 * Markers downcast happens on {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker} and
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:removeMarker} events.
 * Use {@link module:engine/conversion/downcasthelpers downcast converters} or attach a custom converter to mentioned events.
 * For {@link module:engine/controller/datacontroller~DataController data pipeline}, marker should be downcasted to an element.
 * Then, it can be upcasted back to a marker. Again, use {@link module:engine/conversion/upcasthelpers upcast converters} or
 * attach a custom converter to {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element}.
 *
 * `Marker` instances are created and destroyed only by {@link ~MarkerCollection MarkerCollection}.
 */
declare class Marker extends /* #__PURE__ */ Marker_base {
    /**
     * Marker's name.
     */
    readonly name: string;
    /**
     * Flag indicates if the marker is managed using operations or not.
     *
     * @internal
     */
    _managedUsingOperations: boolean;
    /**
     * Specifies whether the marker affects the data produced by the data pipeline
     * (is persisted in the editor's data).
     *
     * @internal
     */
    _affectsData: boolean;
    /**
     * Range marked by the marker.
     */
    private _liveRange;
    /**
     * Creates a marker instance.
     *
     * @param name Marker name.
     * @param liveRange Range marked by the marker.
     * @param managedUsingOperations Specifies whether the marker is managed using operations.
     * @param affectsData Specifies whether the marker affects the data produced by the data pipeline (is persisted in the editor's data).
     */
    constructor(name: string, liveRange: ModelLiveRange, managedUsingOperations: boolean, affectsData: boolean);
    /**
     * A value indicating if the marker is managed using operations.
     * See {@link ~Marker marker class description} to learn more about marker types.
     * See {@link module:engine/model/writer~ModelWriter#addMarker}.
     */
    get managedUsingOperations(): boolean;
    /**
     * A value indicating if the marker changes the data.
     */
    get affectsData(): boolean;
    /**
     * Returns the marker data (properties defining the marker).
     */
    getData(): MarkerData;
    /**
     * Returns current marker start position.
     */
    getStart(): ModelPosition;
    /**
     * Returns current marker end position.
     */
    getEnd(): ModelPosition;
    /**
     * Returns a range that represents the current state of the marker.
     *
     * Keep in mind that returned value is a {@link module:engine/model/range~ModelRange Range}, not a
     * {@link module:engine/model/liverange~ModelLiveRange ModelLiveRange}. This means that it is up-to-date and relevant only
     * until next model document change. Do not store values returned by this method. Instead, store {@link ~Marker#name}
     * and get `Marker` instance from {@link module:engine/model/markercollection~MarkerCollection MarkerCollection} every
     * time there is a need to read marker properties. This will guarantee that the marker has not been removed and
     * that it's data is up-to-date.
     */
    getRange(): ModelRange;
    /**
     * Converts `Marker` to plain object and returns it.
     *
     * @returns `Marker` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Binds new live range to the marker and detach the old one if is attached.
     *
     * @internal
     * @param liveRange Live range to attach
     * @returns Attached live range.
     */
    _attachLiveRange(liveRange: ModelLiveRange): ModelLiveRange;
    /**
     * Unbinds and destroys currently attached live range.
     *
     * @internal
     */
    _detachLiveRange(): void;
}
export { Marker };
/**
 * Fired whenever {@link ~Marker#_liveRange marker range} is changed due to changes on {@link module:engine/model/document~ModelDocument}.
 * This is a delegated {@link module:engine/model/liverange~ModelLiveRange#event:change:range ModelLiveRange change:range event}.
 *
 * When marker is removed from {@link module:engine/model/markercollection~MarkerCollection MarkerCollection},
 * all event listeners listening to it should be removed. It is best to do it on
 * {@link module:engine/model/markercollection~MarkerCollection#event:update MarkerCollection update event}.
 *
 * @see module:engine/model/liverange~ModelLiveRange#event:change:range
 * @eventName ~Marker#change:range
 */
export type MarkerChangeRangeEvent = ModelLiveRangeChangeRangeEvent;
/**
 * Fired whenever change on {@link module:engine/model/document~ModelDocument} is done inside {@link ~Marker#_liveRange marker range}.
 * This is a delegated {@link module:engine/model/liverange~ModelLiveRange#event:change:content ModelLiveRange change:content event}.
 *
 * When marker is removed from {@link module:engine/model/markercollection~MarkerCollection MarkerCollection},
 * all event listeners listening to it should be removed. It is best to do it on
 * {@link module:engine/model/markercollection~MarkerCollection#event:update MarkerCollection update event}.
 *
 * @see module:engine/model/liverange~ModelLiveRange#event:change:content
 * @eventName ~Marker#change:content
 */
export type MarkerCollectionChangeContentEvent = ModelLiveRangeChangeContentEvent;
/**
 * Describes `change:range` or `change:content` event.
 */
export type MarkerChangeEvent = ModelLiveRangeChangeEvent;
/**
 * Fired whenever marker is added, updated or removed from `MarkerCollection`.
 *
 * @eventName ~MarkerCollection#update
 * @param marker Updated Marker.
 * @param oldRange Marker range before the update. When is not defined it
 * means that marker is just added.
 * @param newRange Marker range after update. When is not defined it
 * means that marker is just removed.
 * @param oldMarkerData Data of the marker before the change.
 */
export type MarkerCollectionUpdateEvent = {
    name: 'update' | `update:${string}`;
    args: [marker: Marker, oldRange: ModelRange | null, newRange: ModelRange | null, oldMarkerData: MarkerData];
};
/**
 * Cannot use a {@link module:engine/model/markercollection~MarkerCollection#destroy destroyed marker} instance.
 *
 * @error marker-destroyed
 */

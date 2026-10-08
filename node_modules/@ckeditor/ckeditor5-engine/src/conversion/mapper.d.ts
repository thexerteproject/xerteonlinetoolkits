/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/conversion/mapper
 */
import { ModelPosition } from '../model/position.js';
import { ModelRange } from '../model/range.js';
import { ViewPosition } from '../view/position.js';
import { ViewRange } from '../view/range.js';
import { type ViewDocumentFragment } from '../view/documentfragment.js';
import { type ViewElement } from '../view/element.js';
import { type ModelElement } from '../model/element.js';
import { type ModelDocumentFragment } from '../model/documentfragment.js';
import type { ViewNode } from '../view/node.js';
declare const Mapper_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Maps elements, positions and markers between the {@link module:engine/view/document~ViewDocument view} and
 * the {@link module:engine/model/model model}.
 *
 * The instance of the Mapper used for the editing pipeline is available in
 * {@link module:engine/controller/editingcontroller~EditingController#mapper `editor.editing.mapper`}.
 *
 * Mapper uses bound elements to find corresponding elements and positions, so, to get proper results,
 * all model elements should be {@link module:engine/conversion/mapper~Mapper#bindElements bound}.
 *
 * To map the complex model to/from view relations, you may provide custom callbacks for the
 * {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition modelToViewPosition event} and
 * {@link module:engine/conversion/mapper~Mapper#event:viewToModelPosition viewToModelPosition event} that are fired whenever
 * a position mapping request occurs.
 * Those events are fired by the {@link module:engine/conversion/mapper~Mapper#toViewPosition toViewPosition}
 * and {@link module:engine/conversion/mapper~Mapper#toModelPosition toModelPosition} methods. `Mapper` adds its own default callbacks
 * with `'lowest'` priority. To override default `Mapper` mapping, add custom callback with higher priority and
 * stop the event.
 */
export declare class Mapper extends /* #__PURE__ */ Mapper_base {
    /**
     * Model element to view element mapping.
     */
    private _modelToViewMapping;
    /**
     * View element to model element mapping.
     */
    private _viewToModelMapping;
    /**
     * A map containing callbacks between view element names and functions evaluating length of view elements
     * in model.
     */
    private _viewToModelLengthCallbacks;
    /**
     * Model marker name to view elements mapping.
     *
     * Keys are `String`s while values are `Set`s with {@link module:engine/view/element~ViewElement view elements}.
     * One marker (name) can be mapped to multiple elements.
     */
    private _markerNameToElements;
    /**
     * View element to model marker names mapping.
     *
     * This is reverse to {@link ~Mapper#_markerNameToElements} map.
     */
    private _elementToMarkerNames;
    /**
     * The map of removed view elements with their current root (used for deferred unbinding).
     */
    private _deferredBindingRemovals;
    /**
     * Stores marker names of markers which have changed due to unbinding a view element (so it is assumed that the view element
     * has been removed, moved or renamed).
     */
    private _unboundMarkerNames;
    /**
     * Manages dynamic cache for the `Mapper` to improve the performance.
     */
    private _cache;
    /**
     * Creates an instance of the mapper.
     */
    constructor();
    /**
     * Marks model and view elements as corresponding. Corresponding elements can be retrieved by using
     * the {@link module:engine/conversion/mapper~Mapper#toModelElement toModelElement} and
     * {@link module:engine/conversion/mapper~Mapper#toViewElement toViewElement} methods.
     * The information that elements are bound is also used to translate positions.
     *
     * @param modelElement Model element.
     * @param viewElement View element.
     */
    bindElements(modelElement: ModelElement | ModelDocumentFragment, viewElement: ViewElement | ViewDocumentFragment): void;
    /**
     * Unbinds the given {@link module:engine/view/element~ViewElement view element} from the map.
     *
     * **Note:** view-to-model binding will be removed, if it existed. However, corresponding model-to-view binding
     * will be removed only if model element is still bound to the passed `viewElement`.
     *
     * This behavior allows for re-binding model element to another view element without fear of losing the new binding
     * when the previously bound view element is unbound.
     *
     * @param viewElement View element to unbind.
     * @param options The options object.
     * @param options.defer Controls whether the binding should be removed immediately or deferred until a
     * {@link #flushDeferredBindings `flushDeferredBindings()`} call.
     */
    unbindViewElement(viewElement: ViewElement, options?: {
        defer?: boolean;
    }): void;
    /**
     * Unbinds the given {@link module:engine/model/element~ModelElement model element} from the map.
     *
     * **Note:** the model-to-view binding will be removed, if it existed. However, the corresponding view-to-model binding
     * will be removed only if the view element is still bound to the passed `modelElement`.
     *
     * This behavior lets for re-binding view element to another model element without fear of losing the new binding
     * when the previously bound model element is unbound.
     *
     * @param modelElement Model element to unbind.
     */
    unbindModelElement(modelElement: ModelElement): void;
    /**
     * Binds the given marker name with the given {@link module:engine/view/element~ViewElement view element}. The element
     * will be added to the current set of elements bound with the given marker name.
     *
     * @param element Element to bind.
     * @param name Marker name.
     */
    bindElementToMarker(element: ViewElement, name: string): void;
    /**
     * Unbinds an element from given marker name.
     *
     * @param element Element to unbind.
     * @param name Marker name.
     */
    unbindElementFromMarkerName(element: ViewElement, name: string): void;
    /**
     * Returns all marker names of markers which have changed due to unbinding a view element (so it is assumed that the view element
     * has been removed, moved or renamed) since the last flush. After returning, the marker names list is cleared.
     */
    flushUnboundMarkerNames(): Array<string>;
    /**
     * Unbinds all deferred binding removals of view elements that in the meantime were not re-attached to some root or document fragment.
     *
     * See: {@link #unbindViewElement `unbindViewElement()`}.
     */
    flushDeferredBindings(): void;
    /**
     * Removes all model to view and view to model bindings.
     */
    clearBindings(): void;
    /**
     * Gets the corresponding model element.
     *
     * **Note:** {@link module:engine/view/uielement~ViewUIElement} does not have corresponding element in model.
     *
     * @label ELEMENT
     * @param viewElement View element.
     * @returns Corresponding model element or `undefined` if not found.
     */
    toModelElement(viewElement: ViewElement): ModelElement | undefined;
    /**
     * Gets the corresponding model document fragment.
     *
     * @label DOCUMENT_FRAGMENT
     * @param viewDocumentFragment View document fragment.
     * @returns Corresponding model document fragment or `undefined` if not found.
     */
    toModelElement(viewDocumentFragment: ViewDocumentFragment): ModelDocumentFragment | undefined;
    /**
     * Gets the corresponding view element.
     *
     * @label ELEMENT
     * @param modelElement Model element.
     * @returns Corresponding view element or `undefined` if not found.
     */
    toViewElement(modelElement: ModelElement): ViewElement | undefined;
    /**
     * Gets the corresponding view document fragment.
     *
     * @label DOCUMENT_FRAGMENT
     * @param modelDocumentFragment Model document fragment.
     * @returns Corresponding view document fragment or `undefined` if not found.
     */
    toViewElement(modelDocumentFragment: ModelDocumentFragment): ViewDocumentFragment | undefined;
    /**
     * Gets the corresponding model range.
     *
     * @param viewRange View range.
     * @returns Corresponding model range.
     */
    toModelRange(viewRange: ViewRange): ModelRange;
    /**
     * Gets the corresponding view range.
     *
     * @param modelRange Model range.
     * @returns Corresponding view range.
     */
    toViewRange(modelRange: ModelRange): ViewRange;
    /**
     * Gets the corresponding model position.
     *
     * @fires viewToModelPosition
     * @param viewPosition View position.
     * @returns Corresponding model position.
     */
    toModelPosition(viewPosition: ViewPosition): ModelPosition;
    /**
     * Gets the corresponding view position.
     *
     * @fires modelToViewPosition
     * @param modelPosition Model position.
     * @param options Additional options for position mapping process.
     * @param options.isPhantom Should be set to `true` if the model position to map is pointing to a place
     * in model tree which no longer exists. For example, it could be an end of a removed model range.
     * @returns Corresponding view position.
     */
    toViewPosition(modelPosition: ModelPosition, options?: {
        isPhantom?: boolean;
    }): ViewPosition;
    /**
     * Gets all view elements bound to the given marker name.
     *
     * @param name Marker name.
     * @returns View elements bound with the given marker name or `null`
     * if no elements are bound to the given marker name.
     */
    markerNameToElements(name: string): Set<ViewElement> | null;
    /**
     * **This method is deprecated and will be removed in one of the future CKEditor 5 releases.**
     *
     * **Using this method will turn off `Mapper` caching system and may degrade performance when operating on bigger documents.**
     *
     * Registers a callback that evaluates the length in the model of a view element with the given name.
     *
     * The callback is fired with one argument, which is a view element instance. The callback is expected to return
     * a number representing the length of the view element in the model.
     *
     * ```ts
     * // List item in view may contain nested list, which have other list items. In model though,
     * // the lists are represented by flat structure. Because of those differences, length of list view element
     * // may be greater than one. In the callback it's checked how many nested list items are in evaluated list item.
     *
     * function getViewListItemLength( element ) {
     * 	let length = 1;
     *
     * 	for ( let child of element.getChildren() ) {
     * 		if ( child.name == 'ul' || child.name == 'ol' ) {
     * 			for ( let item of child.getChildren() ) {
     * 				length += getViewListItemLength( item );
     * 			}
     * 		}
     * 	}
     *
     * 	return length;
     * }
     *
     * mapper.registerViewToModelLength( 'li', getViewListItemLength );
     * ```
     *
     * @param viewElementName Name of view element for which callback is registered.
     * @param lengthCallback Function return a length of view element instance in model.
     * @deprecated
     */
    registerViewToModelLength(viewElementName: string, lengthCallback: (element: ViewElement) => number): void;
    /**
     * For the given `viewPosition`, finds and returns the closest ancestor of this position that has a mapping to
     * the model.
     *
     * @param viewPosition Position for which a mapped ancestor should be found.
     */
    findMappedViewAncestor(viewPosition: ViewPosition): ViewElement;
    /**
     * Calculates model offset based on the view position and the block element.
     *
     * Example:
     *
     * ```html
     * <p>foo<b>ba|r</b></p> // _toModelOffset( b, 2, p ) -> 5
     * ```
     *
     * Is a sum of:
     *
     * ```html
     * <p>foo|<b>bar</b></p> // _toModelOffset( p, 3, p ) -> 3
     * <p>foo<b>ba|r</b></p> // _toModelOffset( b, 2, b ) -> 2
     * ```
     *
     * @param viewParent Position parent.
     * @param viewOffset Position offset.
     * @param viewBlock Block used as a base to calculate offset.
     * @returns Offset in the model.
     */
    private _toModelOffset;
    /**
     * Gets the length of the view element in the model.
     *
     * The length is calculated as follows:
     * * if a {@link #registerViewToModelLength length mapping callback} is provided for the given `viewNode`, it is used to
     * evaluate the model length (`viewNode` is used as first and only parameter passed to the callback),
     * * length of a {@link module:engine/view/text~ViewText text node} is equal to the length of its
     * {@link module:engine/view/text~ViewText#data data},
     * * length of a {@link module:engine/view/uielement~ViewUIElement ui element} is equal to 0,
     * * length of a mapped {@link module:engine/view/element~ViewElement element} is equal to 1,
     * * length of a non-mapped {@link module:engine/view/element~ViewElement element} is equal to the length of its children.
     *
     * Examples:
     *
     * ```
     * foo                          -> 3 // Text length is equal to its data length.
     * <p>foo</p>                   -> 1 // Length of an element which is mapped is by default equal to 1.
     * <b>foo</b>                   -> 3 // Length of an element which is not mapped is a length of its children.
     * <div><p>x</p><p>y</p></div>  -> 2 // Assuming that <div> is not mapped and <p> are mapped.
     * ```
     *
     * @param viewNode View node.
     * @returns Length of the node in the tree model.
     */
    getModelLength(viewNode: ViewNode | ViewDocumentFragment): number;
    /**
     * Finds the position in a view element or view document fragment node (or in its children) with the expected model offset.
     *
     * If the passed `viewContainer` is bound to model, `Mapper` will use caching mechanism to improve performance.
     *
     * @param viewContainer Tree view element in which we are looking for the position.
     * @param modelOffset Expected offset.
     * @returns Found position.
     */
    findPositionIn(viewContainer: ViewElement | ViewDocumentFragment, modelOffset: number): ViewPosition;
    /**
     * Performs most of the logic for `Mapper#findPositionIn()`.
     *
     * It allows to start looking for the requested model offset from a given starting position, to enable caching. Using the cache,
     * you can set the starting point and skip all the calculations that were already previously done.
     *
     * This method uses recursion to find positions inside deep structures. Example:
     *
     * ```
     * <p>fo<b>bar</b>bom</p>  -> target offset: 4
     * <p>|fo<b>bar</b>bom</p> -> target offset: 4, traversed offset: 0
     * <p>fo|<b>bar</b>bom</p> -> target offset: 4, traversed offset: 2
     * <p>fo<b>bar</b>|bom</p> -> target offset: 4, traversed offset: 5 -> we are too far, look recursively in <b>.
     *
     * <p>fo<b>|bar</b>bom</p> -> target offset: 4, traversed offset: 2
     * <p>fo<b>bar|</b>bom</p> -> target offset: 4, traversed offset: 5 -> we are too far, look inside "bar".
     *
     * <p>fo<b>ba|r</b>bom</p> -> target offset: 4, traversed offset: 2 -> position is inside text node at offset 4-2 = 2.
     * ```
     *
     * @param startViewPosition View position to start looking from.
     * @param startModelOffset Model offset related to `startViewPosition`.
     * @param targetModelOffset Target model offset to find.
     * @param viewContainer Mapped ancestor of `startViewPosition`. `startModelOffset` is the offset inside a model element or model
     * document fragment mapped to `viewContainer`.
     * @param useCache Whether `Mapper` should cache positions while traversing the view tree looking for `expectedModelOffset`.
     * @returns View position mapped to `targetModelOffset`.
     */
    private _findPositionStartingFrom;
    /**
     * Gets the length of the view element in the model and updates cache values after each view item it visits.
     *
     * See also {@link #getModelLength}.
     *
     * @param viewNode View node.
     * @param viewContainer Ancestor of `viewNode` that is a mapped view element.
     * @param modelOffset Model offset at which the `viewNode` starts.
     * @returns Length of the node in the tree model.
     */
    private _getModelLengthAndCache;
    /**
     * Because we prefer positions in the text nodes over positions next to text nodes, if the view position was next to a text node,
     * it moves it into the text node instead.
     *
     * ```
     * <p>[]<b>foo</b></p> -> <p>[]<b>foo</b></p> // do not touch if position is not directly next to text
     * <p>foo[]<b>foo</b></p> -> <p>foo{}<b>foo</b></p> // move to text node
     * <p><b>[]foo</b></p> -> <p><b>{}foo</b></p> // move to text node
     * ```
     *
     * @param viewPosition Position potentially next to the text node.
     * @returns Position in the text node if possible.
     */
    private _moveViewPositionToTextNode;
}
declare const MapperCache_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Cache mechanism for {@link module:engine/conversion/mapper~Mapper Mapper}.
 *
 * `MapperCache` improves performance for model-to-view position mapping, which is the main `Mapper` task. Asking for a mapping is much
 * more frequent than actually performing changes, and even if the change happens, we can still partially keep the cache. This makes
 * caching a useful strategy for `Mapper`.
 *
 * `MapperCache` will store some data for view elements or view document fragments that are mapped by the `Mapper`. These view items
 * are "tracked" by the `MapperCache`. For such view items, we will keep entries of model offsets inside their mapped counterpart. For
 * the cached model offsets, we will keep a view position that is inside the tracked item. This allows us to either get the mapping
 * instantly, or at least in less steps than when calculating it from the beginning.
 *
 * Important problem related to caching is invalidating the cache. The cache must be invalidated each time the tracked view item changes.
 * Additionally, we should invalidate as small part of the cache as possible. Since all the logic is encapsulated inside `MapperCache`,
 * the `MapperCache` listens to view items {@link module:engine/view/node~ViewNodeChangeEvent `change` event} and reacts to it.
 * Then, it invalidates just the part of the cache that is "after" the changed part of the view.
 *
 * As mentioned, `MapperCache` currently is used only for model-to-view position mapping as it was much bigger problem than view-to-model
 * mapping. However, it should be possible to use it also for view-to-model.
 *
 * The main assumptions regarding `MapperCache` are:
 *
 * * it is an internal tool, used by `Mapper`, transparent to the outside (no additional effort when developing a plugin or a converter),
 * * it stores all the necessary data internally, which makes it easier to disable or debug,
 * * it is optimized for initial downcast process (long insertions), which is crucial for editor init and data save,
 * * it does not save all possible positions mapping for memory considerations, although it is a possible improvement, which may increase
 *   performance, as well as simplify some parts of the `MapperCache` logic.
 *
 * @internal
 */
export declare class MapperCache extends /* #__PURE__ */ MapperCache_base {
    /**
     * For every view element or document fragment tracked by `MapperCache`, it holds currently cached data, or more precisely,
     * model offset to view position mappings. See also `MappingCache` and `CacheItem`.
     *
     * If an item is tracked by `MapperCache` it has an entry in this structure, so this structure can be used to check which items
     * are tracked by `MapperCache`. When an item is no longer tracked, it is removed from this structure.
     *
     * Although `MappingCache` and `CacheItem` structures allows for caching any model offsets and view positions, we only cache
     * values for model offsets that are after a view node. So, in essence, positions inside text nodes are not cached. However, it takes
     * from one to at most a few steps, to get from a cached position to a position that is inside a view text node.
     *
     * Additionally, only one item per `modelOffset` is cached. There can be several view positions that map to the same `modelOffset`.
     * Only the first save for `modelOffset` is stored.
     */
    private _cachedMapping;
    /**
     * When `MapperCache` {@link ~MapperCache#save saves} view position -> model offset mapping, a `CacheItem` is inserted into certain
     * `MappingCache#cacheList` at some index. Additionally, we store that index with the view node that is before the cached view position.
     *
     * This allows to quickly get a cache list item related to certain view node, and hence, for fast cache invalidation.
     *
     * For example, consider view: `<p>Some <strong>bold</strong> text.</p>`, where `<p>` is a view element tracked by `MapperCache`.
     * If all `<p>` children were visited by `MapperCache`, then `<p>` cache list would have four items, related to following model offsets:
     * `0`, `5`, `9`, `15`. Then, view node `"Some "` would have index `1`, `<strong>` index `2`, and `" text." index `3`.
     *
     * Note that the index related with a node is always greater than `0`. The first item in cache list is always for model offset `0`
     * (and view offset `0`), and it is not related to any node.
     */
    private _nodeToCacheListIndex;
    /**
     * Callback fired whenever there is a direct or indirect children change in tracked view element or tracked view document fragment.
     *
     * This is specified as a property to make it easier to set as an event callback and to later turn off that event.
     */
    private _invalidateOnChildrenChangeCallback;
    /**
     * Callback fired whenever a view text node directly or indirectly inside a tracked view element or tracked view document fragment
     * changes its text data.
     *
     * This is specified as a property to make it easier to set as an event callback and to later turn off that event.
     */
    private _invalidateOnTextChangeCallback;
    /**
     * Saves cache for given view position mapping <-> model offset mapping. The view position should be after a node (i.e. it cannot
     * be the first position inside its parent, or in other words, `viewOffset` must be greater than `0`).
     *
     * Note, that if `modelOffset` for given `viewContainer` was already saved, the stored view position (i.e. parent+offset) will not
     * be overwritten. However, it is important to still save it, as we still store additional data related to cached view positions.
     *
     * @param viewParent View position parent.
     * @param viewOffset View position offset. Must be greater than `0`.
     * @param viewContainer Tracked view position ascendant (it may be the direct parent of the view position).
     * @param modelOffset Model offset in the model element or document fragment which is mapped to `viewContainer`.
     */
    save(viewParent: ViewElement | ViewDocumentFragment, viewOffset: number, viewContainer: ViewElement | ViewDocumentFragment, modelOffset: number): void;
    /**
     * For given `modelOffset` inside a model element mapped to given `viewContainer`, it returns the closest saved cache item
     * (view position and related model offset) to the requested one.
     *
     * It can be exactly the requested mapping, or it can be mapping that is the closest starting point to look for the requested mapping.
     *
     * `viewContainer` must be a view element or document fragment that is mapped by the {@link ~Mapper Mapper}.
     *
     * If `viewContainer` is not yet tracked by the `MapperCache`, it will be automatically tracked after calling this method.
     *
     * Note: this method will automatically "hoist" cached positions, i.e. it will return a position that is closest to the tracked element.
     *
     * For example, if `<p>` is tracked element, and `^` is cached position:
     *
     * ```
     * <p>This is <strong>some <em>heavily <u>formatted</u>^</em></strong> text.</p>
     * ```
     *
     * If this position would be returned, instead, a position directly in `<p>` would be returned:
     *
     * ```
     * <p>This is <strong>some <em>heavily <u>formatted</u></em></strong>^ text.</p>
     * ```
     *
     * Note, that `modelOffset` for both positions is the same.
     *
     * @param viewContainer Tracked view element or document fragment, which cache will be used.
     * @param modelOffset Model offset in a model element or document fragment, which is mapped to `viewContainer`.
     */
    getClosest(viewContainer: ViewElement | ViewDocumentFragment, modelOffset: number): CacheItem;
    /**
     * Starts tracking given `viewContainer`, which must be mapped to a model element or model document fragment.
     *
     * Note, that this method is automatically called by
     * {@link module:engine/conversion/mapper~MapperCache#getClosest `MapperCache#getClosest()`} and there is no need to call it manually.
     *
     * This method initializes the cache for `viewContainer` and adds callbacks for
     * {@link module:engine/view/node~ViewNodeChangeEvent `change` event} fired by `viewContainer`. `MapperCache` listens to `change` event
     * on the tracked elements to invalidate the stored cache.
     */
    startTracking(viewContainer: ViewElement | ViewDocumentFragment): CacheItem;
    /**
     * Stops tracking given `viewContainer`.
     *
     * It removes the cached data and stops listening to {@link module:engine/view/node~ViewNodeChangeEvent `change` event} on the
     * `viewContainer`.
     */
    stopTracking(viewContainer: ViewElement | ViewDocumentFragment): void;
    /**
     * Invalidates cache inside `viewParent`, starting from given `index` in that parent.
     *
     * This method may clear a bit more cache than just what was saved after given `index`, but it is guaranteed that at least it
     * will invalidate everything after `index`.
     */
    private _clearCacheInsideParent;
    /**
     * Clears all the cache for given tracked `viewContainer`.
     */
    private _clearCacheAll;
    /**
     * Clears all the stored cache that is after given `viewNode`. The `viewNode` can be any node that is inside a tracked view element
     * or view document fragment.
     *
     * In reality, this function may clear a bit more cache than just "starting after" `viewNode`, but it is guaranteed that at least
     * all cache after `viewNode` is invalidated.
     */
    private _clearCacheAfter;
    /**
     * Clears all the cache in the cache list related to given `viewContainer`, starting from `index` (inclusive).
     */
    private _clearCacheFromCacheIndex;
    /**
     * Finds a cache item in the given cache list, which `modelOffset` is closest (but smaller or equal) to given `offset`.
     *
     * Since `cacheList` is a sorted array, this uses binary search to retrieve the item quickly.
     */
    private _findInCacheList;
}
/**
 * Fired for each model-to-view position mapping request. The purpose of this event is to enable custom model-to-view position
 * mapping. Callbacks added to this event take {@link module:engine/model/position~ModelPosition model position} and are expected to
 * calculate the {@link module:engine/view/position~ViewPosition view position}. The calculated view position should be added as
 * a `viewPosition` value in the `data` object that is passed as one of parameters to the event callback.
 *
 * ```ts
 * // Assume that "captionedImage" model element is converted to <img> and following <span> elements in view,
 * // and the model element is bound to <img> element. Force mapping model positions inside "captionedImage" to that
 * // <span> element.
 * mapper.on( 'modelToViewPosition', ( evt, data ) => {
 * 	const positionParent = modelPosition.parent;
 *
 * 	if ( positionParent.name == 'captionedImage' ) {
 * 		const viewImg = data.mapper.toViewElement( positionParent );
 * 		const viewCaption = viewImg.nextSibling; // The <span> element.
 *
 * 		data.viewPosition = new ViewPosition( viewCaption, modelPosition.offset );
 *
 * 		// Stop the event if other callbacks should not modify calculated value.
 * 		evt.stop();
 * 	}
 * } );
 * ```
 *
 * **Note:** keep in mind that sometimes a "phantom" model position is being converted. A "phantom" model position is
 * a position that points to a nonexistent place in model. Such a position might still be valid for conversion, though
 * (it would point to a correct place in the view when converted). One example of such a situation is when a range is
 * removed from the model, there may be a need to map the range's end (which is no longer a valid model position). To
 * handle such situations, check the `data.isPhantom` flag:
 *
 * ```ts
 * // Assume that there is a "customElement" model element and whenever the position is before it,
 * // we want to move it to the inside of the view element bound to "customElement".
 * mapper.on( 'modelToViewPosition', ( evt, data ) => {
 * 	if ( data.isPhantom ) {
 * 		return;
 * 	}
 *
 * 	// Below line might crash for phantom position that does not exist in model.
 * 	const sibling = data.modelPosition.nodeBefore;
 *
 * 	// Check if this is the element we are interested in.
 * 	if ( !sibling.is( 'element', 'customElement' ) ) {
 * 		return;
 * 	}
 *
 * 	const viewElement = data.mapper.toViewElement( sibling );
 *
 * 	data.viewPosition = new ViewPosition( sibling, 0 );
 *
 * 	evt.stop();
 * } );
 * ```
 *
 * **Note:** the default mapping callback is provided with a `low` priority setting and does not cancel the event, so it is possible to
 * attach a custom callback after a default callback and also use `data.viewPosition` calculated by the default callback
 * (for example to fix it).
 *
 * **Note:** the default mapping callback will not fire if `data.viewPosition` is already set.
 *
 * **Note:** these callbacks are called **very often**. For efficiency reasons, it is advised to use them only when position
 * mapping between the given model and view elements is unsolvable by using just elements mapping and default algorithm.
 * Also, the condition that checks if a special case scenario happened should be as simple as possible.
 *
 * @eventName ~Mapper#modelToViewPosition
 */
export type MapperModelToViewPositionEvent = {
    name: 'modelToViewPosition';
    args: [MapperModelToViewPositionEventData];
};
/**
 * Data pipeline object that can store and pass data between callbacks. The callback should add
 * the `viewPosition` value to that object with calculated the {@link module:engine/view/position~ViewPosition view position}.
 */
export type MapperModelToViewPositionEventData = {
    /**
     * Mapper instance that fired the event.
     */
    mapper: Mapper;
    /**
     * The model position.
     */
    modelPosition: ModelPosition;
    /**
     * The callback should add the `viewPosition` value to that object with calculated the
     * {@link module:engine/view/position~ViewPosition view position}.
     */
    viewPosition?: ViewPosition;
    /**
     * Should be set to `true` if the model position to map is pointing to a place
     * in model tree which no longer exists. For example, it could be an end of a removed model range.
     */
    isPhantom?: boolean;
};
/**
 * Fired for each view-to-model position mapping request. See {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition}.
 *
 * ```ts
 * // See example in `modelToViewPosition` event description.
 * // This custom mapping will map positions from <span> element next to <img> to the "captionedImage" element.
 * mapper.on( 'viewToModelPosition', ( evt, data ) => {
 * 	const positionParent = viewPosition.parent;
 *
 * 	if ( positionParent.hasClass( 'image-caption' ) ) {
 * 		const viewImg = positionParent.previousSibling;
 * 		const modelImg = data.mapper.toModelElement( viewImg );
 *
 * 		data.modelPosition = new ModelPosition( modelImg, viewPosition.offset );
 * 		evt.stop();
 * 	}
 * } );
 * ```
 *
 * **Note:** the default mapping callback is provided with a `low` priority setting and does not cancel the event, so it is possible to
 * attach a custom callback after the default callback and also use `data.modelPosition` calculated by the default callback
 * (for example to fix it).
 *
 * **Note:** the default mapping callback will not fire if `data.modelPosition` is already set.
 *
 * **Note:** these callbacks are called **very often**. For efficiency reasons, it is advised to use them only when position
 * mapping between the given model and view elements is unsolvable by using just elements mapping and default algorithm.
 * Also, the condition that checks if special case scenario happened should be as simple as possible.
 *
 * @eventName ~Mapper#viewToModelPosition
 */
export type MapperViewToModelPositionEvent = {
    name: 'viewToModelPosition';
    args: [MapperViewToModelPositionEventData];
};
/**
 * Data pipeline object that can store and pass data between callbacks. The callback should add
 * `modelPosition` value to that object with calculated {@link module:engine/model/position~ModelPosition model position}.
 */
export type MapperViewToModelPositionEventData = {
    /**
     * Mapper instance that fired the event.
     */
    mapper: Mapper;
    /**
     * The callback should add `modelPosition` value to that object with calculated
     * {@link module:engine/model/position~ModelPosition model position}.
     */
    modelPosition?: ModelPosition;
    /**
     * The view position.
     */
    viewPosition: ViewPosition;
};
/**
 * Informs that given `viewPosition` corresponds to given `modelOffset` (with the assumption that the model offset is in a model element
 * mapped to the `viewPosition` parent or its ancestor).
 *
 * For example, for model `<paragraph>Some <$text bold=true>bold</$text> text</paragraph>` and view `<p>Some <strong>bold</strong> text</p>`
 * and assuming `<paragraph>` and `<p>` are mapped, following example `CacheItem`s are possible:
 *
 * * `viewPosition` = `<p>`, 1; `modelOffset` = 5
 * * `viewPosition` = `<strong>, 1; `modelOffset` = 9
 * * `viewPosition` = `<p>`, 2; `modelOffset` = 9
 * * `viewPosition` = `<p>`, 3; `modelOffset` = 14
 */
type CacheItem = {
    viewPosition: ViewPosition;
    modelOffset: number;
};
export {};

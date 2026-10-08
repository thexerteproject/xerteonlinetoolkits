/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/differ
 */
import { ModelPosition } from './position.js';
import { ModelRange } from './range.js';
import type { MarkerCollection, MarkerData } from './markercollection.js';
import { type ModelItem } from './item.js';
import { type ModelNode } from './node.js';
import { type ModelRootElement } from './rootelement.js';
import { type Operation } from './operation/operation.js';
/**
 * Calculates the difference between two model states.
 *
 * Receives operations that are to be applied on the model document. Marks parts of the model document tree which
 * are changed and saves the state of these elements before the change. Then, it compares saved elements with the
 * changed elements, after all changes are applied on the model document. Calculates the diff between saved
 * elements and new ones and returns a change set.
 */
export declare class Differ {
    /**
     * Priority of the {@link ~Differ#_elementState element states}. States on higher indexes of the array can overwrite states on the lower
     * indexes.
     */
    private static readonly _statesPriority;
    /**
     * Reference to the model's marker collection.
     */
    private readonly _markerCollection;
    /**
     * A map that stores changes that happened in a given element.
     *
     * The keys of the map are references to the model elements.
     * The values of the map are arrays with changes that were done on this element.
     */
    private readonly _changesInElement;
    /**
     * Stores a snapshot for these model nodes that might have changed.
     *
     * This complements {@link ~Differ#_elementChildrenSnapshots `_elementChildrenSnapshots`}.
     *
     * See also {@link ~DifferSnapshot}.
     */
    private readonly _elementsSnapshots;
    /**
     * For each element or document fragment inside which there was a change, it stores a snapshot of the child nodes list (an array
     * of children snapshots that represent the state in the element / fragment before any change has happened).
     *
     * This complements {@link ~Differ#_elementsSnapshots `_elementsSnapshots`}.
     *
     * See also {@link ~DifferSnapshot}.
     */
    private readonly _elementChildrenSnapshots;
    /**
     * Keeps the state for a given element, describing how the element was changed so far. It is used to evaluate the `action` property
     * of diff items returned by {@link ~Differ#getChanges}.
     *
     * Possible values, in the order from the lowest priority to the highest priority:
     *
     * * `'refresh'` - element was refreshed,
     * * `'rename'` - element was renamed,
     * * `'move'` - element was moved (or, usually, removed, that is moved to the graveyard).
     *
     * Element that was refreshed, may change its state to `'rename'` if it was later renamed, or to `'move'` if it was removed.
     * But the element cannot change its state from `'move'` to `'rename'`, or from `'rename'` to `'refresh'`.
     *
     * Only already existing elements are registered in `_elementState`. If a new element was inserted as a result of a buffered operation,
     * it is not be registered in `_elementState`.
     */
    private readonly _elementState;
    /**
     * A map that stores all changed markers.
     *
     * The keys of the map are marker names.
     *
     * The values of the map are objects with the following properties:
     *
     * * `oldMarkerData`,
     * * `newMarkerData`.
     */
    private readonly _changedMarkers;
    /**
     * A map that stores all roots that have been changed.
     *
     * The keys are the names of the roots while value represents the changes.
     */
    private readonly _changedRoots;
    /**
     * Stores the number of changes that were processed. Used to order the changes chronologically. It is important
     * when changes are sorted.
     */
    private _changeCount;
    /**
     * For efficiency purposes, `Differ` stores the change set returned by the differ after {@link #getChanges} call.
     * Cache is reset each time a new operation is buffered. If the cache has not been reset, {@link #getChanges} will
     * return the cached value instead of calculating it again.
     *
     * This property stores those changes that did not take place in graveyard root.
     */
    private _cachedChanges;
    /**
     * For efficiency purposes, `Differ` stores the change set returned by the differ after the {@link #getChanges} call.
     * The cache is reset each time a new operation is buffered. If the cache has not been reset, {@link #getChanges} will
     * return the cached value instead of calculating it again.
     *
     * This property stores all changes evaluated by `Differ`, including those that took place in the graveyard.
     */
    private _cachedChangesWithGraveyard;
    /**
     * Set of model items that were marked to get refreshed in {@link #_refreshItem}.
     */
    private _refreshedItems;
    /**
     * Creates a `Differ` instance.
     *
     * @param markerCollection Model's marker collection.
     */
    constructor(markerCollection: MarkerCollection);
    /**
     * Informs whether there are any changes buffered in `Differ`.
     */
    get isEmpty(): boolean;
    /**
     * Buffers the given operation. **An operation has to be buffered before it is executed.**
     *
     * @param operationToBuffer An operation to buffer.
     */
    bufferOperation(operationToBuffer: Operation): void;
    /**
     * Buffers a marker change.
     *
     * @param markerName The name of the marker that changed.
     * @param oldMarkerData Marker data before the change.
     * @param newMarkerData Marker data after the change.
     */
    bufferMarkerChange(markerName: string, oldMarkerData: MarkerData, newMarkerData: MarkerData): void;
    /**
     * Returns all markers that should be removed as a result of buffered changes.
     *
     * @returns Markers to remove. Each array item is an object containing the `name` and `range` properties.
     */
    getMarkersToRemove(): Array<{
        name: string;
        range: ModelRange;
    }>;
    /**
     * Returns all markers which should be added as a result of buffered changes.
     *
     * @returns Markers to add. Each array item is an object containing the `name` and `range` properties.
     */
    getMarkersToAdd(): Array<{
        name: string;
        range: ModelRange;
    }>;
    /**
     * Returns all markers which changed.
     */
    getChangedMarkers(): Array<{
        name: string;
        data: {
            oldRange: ModelRange | null;
            newRange: ModelRange | null;
        };
    }>;
    /**
     * Checks whether some of the buffered changes affect the editor data.
     *
     * Types of changes which affect the editor data:
     *
     * * model structure changes,
     * * attribute changes,
     * * a root is added or detached,
     * * changes of markers which were defined as `affectsData`,
     * * changes of markers' `affectsData` property.
     */
    hasDataChanges(): boolean;
    /**
     * Calculates the diff between the old model tree state (the state before the first buffered operations since the last {@link #reset}
     * call) and the new model tree state (actual one). It should be called after all buffered operations are executed.
     *
     * The diff set is returned as an array of {@link module:engine/model/differ~DifferItem diff items}, each describing a change done
     * on the model. The items are sorted by the position on which the change happened. If a position
     * {@link module:engine/model/position~ModelPosition#isBefore is before} another one, it will be on an earlier index in the diff set.
     *
     * **Note**: Elements inside inserted element will not have a separate diff item, only the top most element change will be reported.
     *
     * Because calculating the diff is a costly operation, the result is cached. If no new operation was buffered since the
     * previous {@link #getChanges} call, the next call will return the cached value.
     *
     * @param options Additional options.
     * @param options.includeChangesInGraveyard If set to `true`, also changes that happened
     * in the graveyard root will be returned. By default, changes in the graveyard root are not returned.
     * @returns Diff between the old and the new model tree state.
     */
    getChanges(options?: {
        includeChangesInGraveyard?: boolean;
    }): Array<DifferItem>;
    /**
     * Returns all roots that have changed (either were attached, or detached, or their attributes changed).
     *
     * @returns Diff between the old and the new roots state.
     */
    getChangedRoots(): Array<DifferItemRoot>;
    /**
     * Returns a set of model items that were marked to get refreshed.
     */
    getRefreshedItems(): Set<ModelItem>;
    /**
     * Resets `Differ`. Removes all buffered changes.
     */
    reset(): void;
    /**
     * Marks the given `item` in differ to be "refreshed". It means that the item will be marked as removed and inserted
     * in the differ changes set, so it will be effectively re-converted when the differ changes are handled by a dispatcher.
     *
     * @internal
     * @param item Item to refresh.
     */
    _refreshItem(item: ModelItem): void;
    /**
     * Buffers all the data related to given root like it was all just added to the editor.
     *
     * Following changes are buffered:
     *
     * * root is attached,
     * * all root content is inserted,
     * * all root attributes are added,
     * * all markers inside the root are added.
     *
     * @internal
     */
    _bufferRootLoad(root: ModelRootElement): void;
    /**
     * Buffers the root state change after the root was attached or detached
     */
    private _bufferRootStateChange;
    /**
     * Buffers a root attribute change.
     */
    private _bufferRootAttributeChange;
    /**
     * Saves and handles an insert change.
     */
    private _markInsert;
    /**
     * Saves and handles a remove change.
     */
    private _markRemove;
    /**
     * Saves and handles an attribute change.
     */
    private _markAttribute;
    /**
     * Saves and handles a model change.
     */
    private _markChange;
    /**
     * Tries to set given state for given item.
     *
     * This method does simple validation (it sets the state only for model elements, not for text proxy nodes). It also follows state
     * setting rules, that is, `'refresh'` cannot overwrite `'rename'`, and `'rename'` cannot overwrite `'move'`.
     */
    private _setElementState;
    /**
     * Returns a value for {@link ~DifferItemAction `action`} property for diff items returned by {@link ~Differ#getChanges}.
     * This method aims to return `'rename'` or `'refresh'` when it should, and `diffItemType` ("default action") in all other cases.
     *
     * It bases on a few factors:
     *
     * * for text nodes, the method always returns `diffItemType`,
     * * for newly inserted element, the method returns `diffItemType`,
     * * if {@link ~Differ#_elementState element state} was not recorded, the method returns `diffItemType`,
     * * if state was recorded, and it was `'move'` (default action), the method returns `diffItemType`,
     * * finally, if state was `'refresh'` or `'rename'`, the method returns the state value.
     */
    private _getDiffActionForNode;
    /**
     * Gets an array of changes that have already been saved for a given element.
     */
    private _getChangesForElement;
    /**
     * Creates and saves a snapshot for all children of the given element.
     */
    private _makeSnapshots;
    /**
     * For a given newly saved change, compares it with a change already done on the element and modifies the incoming
     * change and/or the old change.
     *
     * @param inc Incoming (new) change.
     * @param changes An array containing all the changes done on that element.
     */
    private _handleChange;
    /**
     * Returns an object with a single insert change description.
     *
     * @param parent The element in which the change happened.
     * @param offset The offset at which change happened.
     * @param action Further specifies what kind of action led to generating this change.
     * @param elementSnapshot Snapshot of the inserted node after changes.
     * @param elementSnapshotBefore Snapshot of the inserted node before changes.
     * @returns The diff item.
     */
    private _getInsertDiff;
    /**
     * Returns an object with a single remove change description.
     *
     * @param parent The element in which change happened.
     * @param offset The offset at which change happened.
     * @param action Further specifies what kind of action led to generating this change.
     * @param elementSnapshot The snapshot of the removed node before changes.
     * @returns The diff item.
     */
    private _getRemoveDiff;
    /**
     * Returns an array of objects where each one is a single attribute change description.
     *
     * @param range The range where the change happened.
     * @param oldAttributes A map, map iterator or compatible object that contains attributes before the change.
     * @param newAttributes A map, map iterator or compatible object that contains attributes after the change.
     * @returns An array containing one or more diff items.
     */
    private _getAttributesDiff;
    /**
     * Checks whether given element or any of its parents is an element that is buffered as an inserted element.
     */
    private _isInInsertedElement;
    /**
     * Removes deeply all buffered changes that are registered in elements from range specified by `parent`, `offset`
     * and `howMany`.
     */
    private _removeAllNestedChanges;
}
/**
 * Further specifies what kind of action led to generating a change:
 *
 * * `'insert'` if element was inserted,
 * * `'remove'` if element was removed,
 * * `'rename'` if element got renamed (e.g. `writer.rename()`),
 * * `'refresh'` if element got refreshed (e.g. `model.editing.reconvertItem()`).
 */
export type DifferItemAction = 'insert' | 'remove' | 'rename' | 'refresh';
/**
 * A snapshot is representing state of a given element before the first change was applied on that element.
 *
 * @internal
 */
export interface DifferSnapshot {
    /**
     * Node for which was snapshot was made.
     */
    node: ModelNode;
    /**
     * Name of the element at the time when the snapshot was made. For text node snapshots, it is set to `'$text'`.
     */
    name: string;
    /**
     * Attributes of the node at the time when the snapshot was made.
     */
    attributes: Map<string, unknown>;
}
/**
 * The single diff item.
 *
 * Could be one of:
 *
 * * {@link module:engine/model/differ~DifferItemInsert `DifferItemInsert`},
 * * {@link module:engine/model/differ~DifferItemRemove `DifferItemRemove`},
 * * {@link module:engine/model/differ~DifferItemAttribute `DifferItemAttribute`}.
 */
export type DifferItem = DifferItemInsert | DifferItemRemove | DifferItemAttribute;
/**
 * A single diff item for inserted nodes.
 */
export interface DifferItemInsert {
    /**
     * The type of diff item.
     */
    type: 'insert';
    /**
     * Further specifies what kind of action led to generating this change.
     *
     * The action is set in relation to the document state before any change. It means that, for example, if an element was added and
     * then renamed (during the same {@link module:engine/model/batch~Batch batch}), the action will be set to `'insert'`, because when
     * compared to the document state before changes, a new element was inserted, and the renaming does not matter from this point of view.
     */
    action: DifferItemAction;
    /**
     * The name of the inserted elements or `'$text'` for a text node.
     */
    name: string;
    /**
     * Map of attributes of the inserted element.
     */
    attributes: Map<string, unknown>;
    /**
     * The position where the node was inserted.
     */
    position: ModelPosition;
    /**
     * The length of an inserted text node. For elements, it is always 1 as each inserted element is counted as a one.
     */
    length: number;
    /**
     * Holds information about the element state before all changes happened.
     *
     * For example, when `<paragraph textAlign="right">` was changed to `<codeBlock language="plaintext">`,
     * `before.name` will be equal to `'paragraph'` and `before.attributes` map will have one entry: `'textAlign' -> 'right'`.
     *
     * The property is available only if the insertion change was due to element rename or refresh (when `action` property is `'rename'`
     * or `'refresh'`). As such, `before` property is never available for text node changes.
     */
    before?: {
        /**
         * The name of the inserted element before all changes.
         */
        name: string;
        /**
         * Map of the attributes of the inserted element before all changes.
         */
        attributes: Map<string, unknown>;
    };
}
/**
 * A single diff item for re-inserted nodes.
 */
export interface DifferItemReinsert {
    /**
     * The type of diff item.
     */
    type: 'reinsert';
    /**
     * The name of the re-inserted elements or `'$text'` for a text node.
     */
    name: string;
    /**
     * The position where the node was reinserted.
     */
    position: ModelPosition;
    /**
     * The length of a re-inserted text node. For elements, it is always 1 as each re-inserted element is counted as a one.
     */
    length: number;
}
/**
 * A single diff item for removed nodes.
 */
export interface DifferItemRemove {
    /**
     * The type of diff item.
     */
    type: 'remove';
    /**
     * Further specifies what kind of action led to generating this change.
     *
     * The action is set in relation to the document state before any change. It means that, for example, if an element was renamed and
     * then removed (during the same {@link module:engine/model/batch~Batch batch}), the action will be set to `'remove'`, because when
     * compared to the document state before changes, the element was removed, and it does not matter that it was also renamed at one point.
     */
    action: DifferItemAction;
    /**
     * The name of the removed element or `'$text'` for a text node.
     */
    name: string;
    /**
     * Map of attributes that were set on the item while it was removed.
     */
    attributes: Map<string, unknown>;
    /**
     * The position where the node was removed.
     */
    position: ModelPosition;
    /**
     * The length of a removed text node. For elements, it is always 1, as each removed element is counted as a one.
     */
    length: number;
}
/**
 * A single diff item for attribute change.
 */
export interface DifferItemAttribute {
    /**
     * The type of diff item.
     */
    type: 'attribute';
    /**
     * The name of the changed attribute.
     */
    attributeKey: string;
    /**
     * An attribute previous value (before change).
     */
    attributeOldValue: unknown;
    /**
     * An attribute new value (after change).
     */
    attributeNewValue: unknown;
    /**
     * The range where the change happened.
     */
    range: ModelRange;
}
/**
 * A single diff item for a changed root.
 */
export interface DifferItemRoot {
    /**
     * Name of the changed root.
     */
    name: string;
    /**
     * Set accordingly if the root got attached or detached. Otherwise, not set.
     */
    state?: 'attached' | 'detached';
    /**
     * Keeps all attribute changes that happened on the root.
     *
     * The keys are keys of the changed attributes. The values are objects containing the attribute value before the change
     * (`oldValue`) and after the change (`newValue`).
     *
     * Note, that if the root state changed (`state` is set), then `attributes` property will not be set. All attributes should be
     * handled together with the root being attached or detached.
     */
    attributes?: Record<string, {
        oldValue: unknown;
        newValue: unknown;
    }>;
}

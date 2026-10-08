/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/conversion/downcastdispatcher
 */
import { ModelConsumable } from './modelconsumable.js';
import { ModelRange } from '../model/range.js';
import type { Differ, DifferItem, DifferItemReinsert } from '../model/differ.js';
import type { MarkerCollection } from '../model/markercollection.js';
import { type ModelDocumentSelection } from '../model/documentselection.js';
import { type ViewDowncastWriter } from '../view/downcastwriter.js';
import { type ModelElement } from '../model/element.js';
import { type ModelItem } from '../model/item.js';
import { type Mapper } from './mapper.js';
import { type ModelPosition } from '../model/position.js';
import { type ModelSchema } from '../model/schema.js';
import { type ModelSelection } from '../model/selection.js';
import { type ViewElement } from '../view/element.js';
declare const DowncastDispatcher_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events. The callbacks listening to these events are called converters. The
 * converters' role is to convert the model changes to changes in view (for example, adding view nodes or
 * changing attributes on view elements).
 *
 * During the conversion process, downcast dispatcher fires events basing on the state of the model and prepares
 * data for these events. It is important to understand that the events are connected with the changes done on the model,
 * for example: "a node has been inserted" or "an attribute has changed". This is in contrary to upcasting (a view-to-model conversion)
 * where you convert the view state (view nodes) to a model tree.
 *
 * The events are prepared basing on a diff created by the {@link module:engine/model/differ~Differ Differ}, which buffers them
 * and then passes to the downcast dispatcher as a diff between the old model state and the new model state.
 *
 * Note that because the changes are converted, there is a need to have a mapping between the model structure and the view structure.
 * To map positions and elements during the downcast (a model-to-view conversion), use {@link module:engine/conversion/mapper~Mapper}.
 *
 * Downcast dispatcher fires the following events for model tree changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} &ndash;
 * If a range of nodes was inserted to the model tree.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove `remove`} &ndash;
 * If a range of nodes was removed from the model tree.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} &ndash;
 * If an attribute was added, changed or removed from a model node.
 *
 * For {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`}
 * and {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`},
 * the downcast dispatcher generates {@link module:engine/conversion/modelconsumable~ModelConsumable consumables}.
 * These are used to have control over which changes have already been consumed. It is useful when some converters
 * overwrite others or convert multiple changes (for example, it converts an insertion of an element and also converts that
 * element's attributes during the insertion).
 *
 * Additionally, downcast dispatcher fires events for {@link module:engine/model/markercollection~Marker marker} changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker `addMarker`} &ndash; If a marker was added.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:removeMarker `removeMarker`} &ndash; If a marker was
 * removed.
 *
 * Note that changing a marker is done through removing the marker from the old range and adding it to the new range,
 * so both of these events are fired.
 *
 * Finally, a downcast dispatcher also handles firing events for the {@link module:engine/model/selection model selection}
 * conversion:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:selection `selection`}
 * &ndash; Converts the selection from the model to the view.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`}
 * &ndash; Fired for every selection attribute.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker `addMarker`}
 * &ndash; Fired for every marker that contains a selection.
 *
 * Unlike the model tree and the markers, the events for selection are not fired for changes but for a selection state.
 *
 * When providing custom listeners for a downcast dispatcher, remember to check whether a given change has not been
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} yet.
 *
 * When providing custom listeners for a downcast dispatcher, keep in mind that you **should not** stop the event. If you stop it,
 * then the default converter at the `lowest` priority will not trigger the conversion of this node's attributes and child nodes.
 *
 * When providing custom listeners for a downcast dispatcher, remember to use the provided
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter view downcast writer} to apply changes to the view document.
 *
 * You can read more about conversion in the following guide:
 *
 * * {@glink framework/deep-dive/conversion/downcast Downcast conversion}
 *
 * An example of a custom converter for the downcast dispatcher:
 *
 * ```ts
 * // You will convert inserting a "paragraph" model element into the model.
 * downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
 * 	// Remember to check whether the change has not been consumed yet and consume it.
 * 	if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
 * 		return;
 * 	}
 *
 * 	// Translate the position in the model to a position in the view.
 * 	const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 * 	// Create a <p> element that will be inserted into the view at the `viewPosition`.
 * 	const viewElement = conversionApi.writer.createContainerElement( 'p' );
 *
 * 	// Bind the newly created view element to the model element so positions will map accordingly in the future.
 * 	conversionApi.mapper.bindElements( data.item, viewElement );
 *
 * 	// Add the newly created view element to the view.
 * 	conversionApi.writer.insert( viewPosition, viewElement );
 * } );
 * ```
 */
export declare class DowncastDispatcher extends /* #__PURE__ */ DowncastDispatcher_base {
    /**
     * A template for an interface passed by the dispatcher to the event callbacks.
     *
     * @internal
     */
    readonly _conversionApi: Pick<DowncastConversionApi, 'dispatcher' | 'mapper' | 'schema'>;
    /**
     * A map of already fired events for a given `ModelConsumable`.
     */
    private readonly _firedEventsMap;
    /**
     * Creates a downcast dispatcher instance.
     *
     * @see module:engine/conversion/downcastdispatcher~DowncastConversionApi
     *
     * @param conversionApi Additional properties for an interface that will be passed to events fired
     * by the downcast dispatcher.
     */
    constructor(conversionApi: Pick<DowncastConversionApi, 'mapper' | 'schema'>);
    /**
     * Converts changes buffered in the given {@link module:engine/model/differ~Differ model differ}
     * and fires conversion events based on it.
     *
     * @fires insert
     * @fires remove
     * @fires attribute
     * @fires addMarker
     * @fires removeMarker
     * @fires reduceChanges
     * @param differ The differ object with buffered changes.
     * @param markers Markers related to the model fragment to convert.
     * @param writer The view writer that should be used to modify the view document.
     */
    convertChanges(differ: Differ, markers: MarkerCollection, writer: ViewDowncastWriter): void;
    /**
     * Starts a conversion of a model range and the provided markers.
     *
     * @fires insert
     * @fires attribute
     * @fires addMarker
     * @param range The inserted range.
     * @param markers The map of markers that should be down-casted.
     * @param writer The view writer that should be used to modify the view document.
     * @param options Optional options object passed to `convertionApi.options`.
     */
    convert(range: ModelRange, markers: Map<string, ModelRange>, writer: ViewDowncastWriter, options?: DowncastConversionApi['options']): void;
    /**
     * Starts the model selection conversion.
     *
     * Fires events for a given {@link module:engine/model/selection~ModelSelection selection} to start the selection conversion.
     *
     * @fires selection
     * @fires addMarker
     * @fires attribute
     * @param selection The selection to convert.
     * @param markers Markers connected with the converted model.
     * @param writer View writer that should be used to modify the view document.
     */
    convertSelection(selection: ModelSelection | ModelDocumentSelection, markers: MarkerCollection, writer: ViewDowncastWriter): void;
    /**
     * Fires insertion conversion of a range of nodes.
     *
     * For each node in the range, {@link #event:insert `insert` event is fired}. For each attribute on each node,
     * {@link #event:attribute `attribute` event is fired}.
     *
     * @fires insert
     * @fires attribute
     * @param range The inserted range.
     * @param conversionApi The conversion API object.
     * @param options.doNotAddConsumables Whether the ModelConsumable should not get populated
     * for items in the provided range.
     */
    private _convertInsert;
    /**
     * Fires conversion of a single node removal. Fires {@link #event:remove remove event} with provided data.
     *
     * @param position Position from which node was removed.
     * @param length Offset size of removed node.
     * @param name Name of removed node.
     * @param conversionApi The conversion API object.
     */
    private _convertRemove;
    /**
     * Starts a conversion of an attribute change on a given `range`.
     *
     * For each node in the given `range`, {@link #event:attribute attribute event} is fired with the passed data.
     *
     * @fires attribute
     * @param range Changed range.
     * @param key Key of the attribute that has changed.
     * @param oldValue Attribute value before the change or `null` if the attribute has not been set before.
     * @param newValue New attribute value or `null` if the attribute has been removed.
     * @param conversionApi The conversion API object.
     */
    private _convertAttribute;
    /**
     * Fires re-insertion conversion (with a `reconversion` flag passed to `remove` and `insert` events)
     * of a range of elements (only elements on the range depth, without children).
     *
     * For each node in the range on its depth (without children), {@link #event:insert `insert` event} is fired.
     * For each attribute on each node, {@link #event:attribute `attribute` event} is fired.
     *
     * @fires insert
     * @fires attribute
     * @param range The range to reinsert.
     * @param conversionApi The conversion API object.
     */
    private _convertReinsert;
    /**
     * Converts the added marker. Fires the {@link #event:addMarker `addMarker`} event for each item
     * in the marker's range. If the range is collapsed, a single event is dispatched. See the event description for more details.
     *
     * @fires addMarker
     * @param markerName Marker name.
     * @param markerRange The marker range.
     * @param conversionApi The conversion API object.
     */
    private _convertMarkerAdd;
    /**
     * Fires the conversion of the marker removal. Fires the {@link #event:removeMarker `removeMarker`} event with the provided data.
     *
     * @fires removeMarker
     * @param markerName Marker name.
     * @param markerRange The marker range.
     * @param conversionApi The conversion API object.
     */
    private _convertMarkerRemove;
    /**
     * Fires the reduction of changes buffered in the {@link module:engine/model/differ~Differ `Differ`}.
     *
     * Features can replace selected {@link module:engine/model/differ~DifferItem `DifferItem`}s with `reinsert` entries to trigger
     * reconversion. The {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
     * `DowncastHelpers.elementToStructure()`} is using this event to trigger reconversion.
     *
     * @fires reduceChanges
     */
    private _reduceChanges;
    /**
     * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume from a given range,
     * assuming that the range has just been inserted to the model.
     *
     * @param consumable The consumable.
     * @param walkerValues The walker values for the inserted range.
     * @returns The values to consume.
     */
    private _addConsumablesForInsert;
    /**
     * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume for a given range.
     *
     * @param consumable The consumable.
     * @param range The affected range.
     * @param type Consumable type.
     * @returns The values to consume.
     */
    private _addConsumablesForRange;
    /**
     * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with selection consumable values.
     *
     * @param consumable The consumable.
     * @param selection The selection to create the consumable from.
     * @param markers Markers that contain the selection.
     * @returns The values to consume.
     */
    private _addConsumablesForSelection;
    /**
     * Tests whether given event wasn't already fired and if so, fires it.
     *
     * @fires insert
     * @fires attribute
     * @param type Event type.
     * @param data Event data.
     * @param conversionApi The conversion API object.
     */
    private _testAndFire;
    /**
     * Fires not already fired events for setting attributes on just inserted item.
     *
     * @param item The model item to convert attributes for.
     * @param conversionApi The conversion API object.
     */
    private _testAndFireAddAttributes;
    /**
     * Builds an instance of the {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi} from a template and a given
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter `ViewDowncastWriter`} and options object.
     *
     * @param writer View writer that should be used to modify the view document.
     * @param refreshedItems A set of model elements that should not reuse their
     * previous view representations.
     * @param options Optional options passed to `convertionApi.options`.
     * @return The conversion API object.
     */
    private _createConversionApi;
}
/**
 * Fired to enable reducing (transforming) changes buffered in the {@link module:engine/model/differ~Differ `Differ`} before
 * {@link ~DowncastDispatcher#convertChanges `convertChanges()`} will fire any conversion events.
 *
 * For instance, a feature can replace selected {@link module:engine/model/differ~DifferItem `DifferItem`}s with a `reinsert` entry
 * to trigger reconversion of an element when e.g. its attribute has changes.
 * The {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
     * `DowncastHelpers.elementToStructure()`} helper is using this event to trigger reconversion of an element when the element,
 * its attributes or direct children changed.
 *
 * @eventName ~DowncastDispatcher#reduceChanges
 */
export type DowncastReduceChangesEvent = {
    name: 'reduceChanges';
    args: [data: DowncastReduceChangesEventData];
};
export type DowncastReduceChangesEventData = {
    /**
     * A buffered changes to get reduced.
     */
    changes: Iterable<DifferItem | DifferItemReinsert>;
    /**
     * Set of items marked for rebuild without reusing view nodes.
     */
    refreshedItems: Set<ModelItem>;
};
export type DowncastDispatcherEventMap<TItem = ModelItem> = {
    insert: {
        item: TItem;
        range: ModelRange;
        reconversion?: boolean;
    };
    remove: {
        position: ModelPosition;
        length: number;
        reconversion?: boolean;
    };
    attribute: {
        item: TItem;
        range: ModelRange;
        attributeKey: string;
        attributeOldValue: unknown;
        attributeNewValue: unknown;
    };
    cleanSelection: {
        selection: ModelSelection | ModelDocumentSelection;
    };
    selection: {
        selection: ModelSelection | ModelDocumentSelection;
    };
    addMarker: {
        item?: ModelItem | ModelSelection | ModelDocumentSelection;
        range?: ModelRange;
        markerRange: ModelRange;
        markerName: string;
    };
    removeMarker: {
        markerRange: ModelRange;
        markerName: string;
    };
};
export type DowncastEvent<TName extends keyof DowncastDispatcherEventMap<TItem>, TItem = ModelItem> = {
    name: TName | `${TName}:${string}`;
    args: [data: DowncastDispatcherEventMap<TItem>[TName], conversionApi: DowncastConversionApi];
};
/**
 * Fired for inserted nodes.
 *
 * `insert` is a namespace for a class of events. Names of actually called events follow this pattern:
 * `insert:name`. `name` is either `'$text'`, when {@link module:engine/model/text~ModelText a text node} has been inserted,
 * or {@link module:engine/model/element~ModelElement#name name} of inserted element.
 *
 * This way, the listeners can either listen to a general `insert` event or specific event (for example `insert:paragraph`).
 *
 * @eventName ~DowncastDispatcher#insert
 * @param {Object} data Additional information about the change.
 * @param {module:engine/model/item~ModelItem} data.item The inserted item.
 * @param {module:engine/model/range~ModelRange} data.range Range spanning over inserted item.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in the `DowncastDispatcher` constructor.
 */
export type DowncastInsertEvent<TItem extends ModelItem = ModelItem> = DowncastEvent<'insert', TItem>;
/**
 * Fired for removed nodes.
 *
 * `remove` is a namespace for a class of events. Names of actually called events follow this pattern:
 * `remove:name`. `name` is either `'$text'`, when a {@link module:engine/model/text~ModelText a text node} has been removed,
 * or the {@link module:engine/model/element~ModelElement#name name} of removed element.
 *
 * This way, listeners can either listen to a general `remove` event or specific event (for example `remove:paragraph`).
 *
 * @eventName ~DowncastDispatcher#remove
 * @param {Object} data Additional information about the change.
 * @param {module:engine/model/position~ModelPosition} data.position Position from which the node has been removed.
 * @param {Number} data.length Offset size of the removed node.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastRemoveEvent = DowncastEvent<'remove'>;
/**
 * Fired in the following cases:
 *
 * * when an attribute has been added, changed, or removed from a node,
 * * when a node with an attribute is inserted,
 * * when a collapsed model selection attribute is converted.
 *
 * `attribute` is a namespace for a class of events. Names of actually called events follow this pattern:
 * `attribute:attributeKey:name`. `attributeKey` is the key of added/changed/removed attribute.
 * `name` is either `'$text'` if change was on {@link module:engine/model/text~ModelText a text node},
 * or the {@link module:engine/model/element~ModelElement#name name} of element which attribute has changed.
 *
 * This way listeners can either listen to a general `attribute:bold` event or specific event (for example `attribute:src:imageBlock`).
 *
 * @eventName ~DowncastDispatcher#attribute
 * @param {Object} data Additional information about the change.
 * @param {module:engine/model/item~ModelItem|module:engine/model/documentselection~ModelDocumentSelection} data.item Changed item
 * or converted selection.
 * @param {module:engine/model/range~ModelRange} data.range Range spanning over changed item or selection range.
 * @param {String} data.attributeKey Attribute key.
 * @param {*} data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
 * @param {*} data.attributeNewValue New attribute value.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastAttributeEvent<TItem = ModelItem | ModelSelection | ModelDocumentSelection> = DowncastEvent<'attribute', TItem>;
/**
 * Fired for {@link module:engine/model/selection~ModelSelection selection} changes.
 *
 * @eventName ~DowncastDispatcher#selection
 * @param {module:engine/model/selection~ModelSelection} selection Selection that is converted.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastSelectionEvent = DowncastEvent<'selection'>;
/**
 * Fired at the beginning of selection conversion, before
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:selection selection} events.
 *
 * Should be used to clean up the view state at the current selection position, before the selection is moved to another place.
 *
 * @eventName ~DowncastDispatcher#cleanSelection
 * @param {module:engine/model/selection~ModelSelection} selection Selection that is converted.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastCleanSelectionEvent = DowncastEvent<'cleanSelection'>;
/**
 * Fired when a new marker is added to the model. Also fired when a collapsed model selection that is inside a marker is converted.
 *
 * `addMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
 * `addMarker:markerName`. By specifying certain marker names, you can make the events even more gradual. For example,
 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `addMarker:foo` or `addMarker:foo:abc` and
 * `addMarker:foo:bar` events.
 *
 * If the marker range is not collapsed:
 *
 * * the event is fired for each item in the marker range one by one,
 * * `conversionApi.consumable` includes each item of the marker range and the consumable value is same as the event name.
 *
 * If the marker range is collapsed:
 *
 * * there is only one event,
 * * `conversionApi.consumable` includes marker range with the event name.
 *
 * If the selection inside a marker is converted:
 *
 * * there is only one event,
 * * `conversionApi.consumable` includes the selection instance with the event name.
 *
 * @eventName ~DowncastDispatcher#addMarker
 * @param {Object} data Additional information about the change.
 * @param {module:engine/model/item~ModelItem|module:engine/model/selection~ModelSelection} data.item Item inside the new marker or
 * the selection that is being converted.
 * @param {module:engine/model/range~ModelRange} [data.range] Range spanning over converted item. Available only in marker conversion, if
 * the marker range was not collapsed.
 * @param {module:engine/model/range~ModelRange} data.markerRange Marker range.
 * @param {String} data.markerName Marker name.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastAddMarkerEvent = DowncastEvent<'addMarker'>;
/**
 * Fired when a marker is removed from the model.
 *
 * `removeMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
 * `removeMarker:markerName`. By specifying certain marker names, you can make the events even more gradual. For example,
 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `removeMarker:foo` or `removeMarker:foo:abc` and
 * `removeMarker:foo:bar` events.
 *
 * @eventName ~DowncastDispatcher#removeMarker
 * @param {Object} data Additional information about the change.
 * @param {module:engine/model/range~ModelRange} data.markerRange Marker range.
 * @param {String} data.markerName Marker name.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
 * to be used by callback, passed in `DowncastDispatcher` constructor.
 */
export type DowncastRemoveMarkerEvent = DowncastEvent<'removeMarker'>;
/**
 * Conversion interface that is registered for given {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * and is passed as one of parameters when {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher dispatcher}
 * fires its events.
 */
export interface DowncastConversionApi {
    /**
     * The {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} instance.
     */
    dispatcher: DowncastDispatcher;
    /**
     * Stores the information about what parts of a processed model item are still waiting to be handled. After a piece of a model item was
     * converted, an appropriate consumable value should be {@link module:engine/conversion/modelconsumable~ModelConsumable#consume
     * consumed}.
     */
    consumable: ModelConsumable;
    /**
     * The {@link module:engine/conversion/mapper~Mapper} instance.
     */
    mapper: Mapper;
    /**
     * The {@link module:engine/model/schema~ModelSchema} instance set for the model that is downcast.
     */
    schema: ModelSchema;
    /**
     * The {@link module:engine/view/downcastwriter~ViewDowncastWriter} instance used to manipulate the data during conversion.
     */
    writer: ViewDowncastWriter;
    /**
     * An object with an additional configuration which can be used during the conversion process.
     * Available only for data downcast conversion.
     */
    options: Record<string, unknown>;
    /**
     * Triggers conversion of a specified item.
     * This conversion is triggered within (as a separate process of) the parent conversion.
     *
     * @param item The model item to trigger nested insert conversion on.
     */
    convertItem(item: ModelItem): void;
    /**
     * Triggers conversion of children of a specified element.
     *
     * @param element The model element to trigger children insert conversion on.
     */
    convertChildren(element: ModelElement): void;
    /**
     * Triggers conversion of attributes of a specified item.
     *
     * @param item The model item to trigger attribute conversion on.
     */
    convertAttributes(item: ModelItem): void;
    canReuseView(element: ViewElement): boolean;
}
export {};

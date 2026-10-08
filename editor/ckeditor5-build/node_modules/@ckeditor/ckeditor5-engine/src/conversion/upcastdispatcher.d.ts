/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/conversion/upcastdispatcher
 */
import { ViewConsumable } from './viewconsumable.js';
import { ModelRange } from '../model/range.js';
import { ModelPosition } from '../model/position.js';
import { type ModelElement } from '../model/element.js';
import { type ModelNode } from '../model/node.js';
import { type ViewElement } from '../view/element.js';
import { type ViewText } from '../view/text.js';
import { type ViewDocumentFragment } from '../view/documentfragment.js';
import { type ModelDocumentFragment } from '../model/documentfragment.js';
import type { ModelSchema, ModelSchemaContextDefinition } from '../model/schema.js';
import { type ModelWriter } from '../model/writer.js';
import { type ViewItem } from '../view/item.js';
declare const UpcastDispatcher_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Upcast dispatcher is a central point of the view-to-model conversion, which is a process of
 * converting a given {@link module:engine/view/documentfragment~ViewDocumentFragment view document fragment} or
 * {@link module:engine/view/element~ViewElement view element} into a correct model structure.
 *
 * During the conversion process, the dispatcher fires events for all {@link module:engine/view/node~ViewNode view nodes}
 * from the converted view document fragment.
 * Special callbacks called "converters" should listen to these events in order to convert the view nodes.
 *
 * The second parameter of the callback is the `data` object with the following properties:
 *
 * * `data.viewItem` contains a {@link module:engine/view/node~ViewNode view node} or a
 * {@link module:engine/view/documentfragment~ViewDocumentFragment view document fragment}
 * that is converted at the moment and might be handled by the callback.
 * * `data.modelRange` is used to point to the result
 * of the current conversion (e.g. the element that is being inserted)
 * and is always a {@link module:engine/model/range~ModelRange} when the conversion succeeds.
 * * `data.modelCursor` is a {@link module:engine/model/position~ModelPosition position} on which the converter should insert
 * the newly created items.
 *
 * The third parameter of the callback is an instance of {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi}
 * which provides additional tools for converters.
 *
 * You can read more about conversion in the {@glink framework/deep-dive/conversion/upcast Upcast conversion} guide.
 *
 * Examples of event-based converters:
 *
 * ```ts
 * // A converter for links (<a>).
 * editor.data.upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
 * 	if ( conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } ) ) {
 * 		// The <a> element is inline and is represented by an attribute in the model.
 * 		// This is why you need to convert only children.
 * 		const { modelRange } = conversionApi.convertChildren( data.viewItem, data.modelCursor );
 *
 * 		for ( let item of modelRange.getItems() ) {
 * 			if ( conversionApi.schema.checkAttribute( item, 'linkHref' ) ) {
 * 				conversionApi.writer.setAttribute( 'linkHref', data.viewItem.getAttribute( 'href' ), item );
 * 			}
 * 		}
 * 	}
 * } );
 *
 * // Convert <p> element's font-size style.
 * // Note: You should use a low-priority observer in order to ensure that
 * // it is executed after the element-to-element converter.
 * editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
 * 	const { consumable, schema, writer } = conversionApi;
 *
 * 	if ( !consumable.consume( data.viewItem, { style: 'font-size' } ) ) {
 * 		return;
 * 	}
 *
 * 	const fontSize = data.viewItem.getStyle( 'font-size' );
 *
 * 	// Do not go for the model element after data.modelCursor because it might happen
 * 	// that a single view element was converted to multiple model elements. Get all of them.
 * 	for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
 * 		if ( schema.checkAttribute( item, 'fontSize' ) ) {
 * 			writer.setAttribute( 'fontSize', fontSize, item );
 * 		}
 * 	}
 * }, { priority: 'low' } );
 *
 * // Convert all elements which have no custom converter into a paragraph (autoparagraphing).
 * editor.data.upcastDispatcher.on( 'element', ( evt, data, conversionApi ) => {
 * 	// Check if an element can be converted.
 * 	if ( !conversionApi.consumable.test( data.viewItem, { name: data.viewItem.name } ) ) {
 * 		// When an element is already consumed by higher priority converters, do nothing.
 * 		return;
 * 	}
 *
 * 	const paragraph = conversionApi.writer.createElement( 'paragraph' );
 *
 * 	// Try to safely insert a paragraph at the model cursor - it will find an allowed parent for the current element.
 * 	if ( !conversionApi.safeInsert( paragraph, data.modelCursor ) ) {
 * 		// When an element was not inserted, it means that you cannot insert a paragraph at this position.
 * 		return;
 * 	}
 *
 * 	// Consume the inserted element.
 * 	conversionApi.consumable.consume( data.viewItem, { name: data.viewItem.name } ) );
 *
 * 	// Convert the children to a paragraph.
 * 	const { modelRange } = conversionApi.convertChildren( data.viewItem,  paragraph ) );
 *
 * 	// Update `modelRange` and `modelCursor` in the `data` as a conversion result.
 * 	conversionApi.updateConversionResult( paragraph, data );
 * }, { priority: 'low' } );
 * ```
 *
 * @fires viewCleanup
 * @fires element
 * @fires text
 * @fires documentFragment
 */
export declare class UpcastDispatcher extends /* #__PURE__ */ UpcastDispatcher_base {
    /**
     * An interface passed by the dispatcher to the event callbacks.
     */
    conversionApi: UpcastConversionApi;
    /**
     * The list of elements that were created during splitting.
     *
     * After the conversion process, the list is cleared.
     */
    private _splitParts;
    /**
     * The list of cursor parent elements that were created during splitting.
     *
     * After the conversion process the list is cleared.
     */
    private _cursorParents;
    /**
     * The position in the temporary structure where the converted content is inserted. The structure reflects the context of
     * the target position where the content will be inserted. This property is built based on the context parameter of the
     * convert method.
     */
    private _modelCursor;
    /**
     * The list of elements that were created during the splitting but should not get removed on conversion end even if they are empty.
     *
     * The list is cleared after the conversion process.
     */
    private _emptyElementsToKeep;
    /**
     * Creates an upcast dispatcher that operates using the passed API.
     *
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi
     * @param conversionApi Additional properties for an interface that will be passed to events fired
     * by the upcast dispatcher.
     */
    constructor(conversionApi: Pick<UpcastConversionApi, 'schema'>);
    /**
     * Starts the conversion process. The entry point for the conversion.
     *
     * @fires element
     * @fires text
     * @fires documentFragment
     * @param viewElement The part of the view to be converted.
     * @param writer An instance of the model writer.
     * @param context Elements will be converted according to this context.
     * @returns Model data that is the result of the conversion process
     * wrapped in `DocumentFragment`. Converted marker elements will be set as the document fragment's
     * {@link module:engine/model/documentfragment~ModelDocumentFragment#markers static markers map}.
     */
    convert(viewElement: ViewElement | ViewDocumentFragment, writer: ModelWriter, context?: ModelSchemaContextDefinition): ModelDocumentFragment;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertItem
     */
    private _convertItem;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertChildren
     */
    private _convertChildren;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#safeInsert
     */
    private _safeInsert;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#updateConversionResult
     */
    private _updateConversionResult;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#splitToAllowedParent
     */
    private _splitToAllowedParent;
    /**
     * Registers that a `splitPart` element is a split part of the `originalPart` element.
     *
     * The data set by this method is used by {@link #_getSplitParts} and {@link #_removeEmptyElements}.
     */
    private _registerSplitPair;
    /**
     * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#getSplitParts
     */
    private _getSplitParts;
    /**
     * Mark an element that were created during the splitting to not get removed on conversion end even if it is empty.
     */
    private _keepEmptyElement;
    /**
     * Checks if there are any empty elements created while splitting and removes them.
     *
     * This method works recursively to re-check empty elements again after at least one element was removed in the initial call,
     * as some elements might have become empty after other empty elements were removed from them.
     */
    private _removeEmptyElements;
}
/**
 * Fired before the first conversion event, at the beginning of the upcast (view-to-model conversion) process.
 *
 * @eventName ~UpcastDispatcher#viewCleanup
 * @param viewItem A part of the view to be converted.
 */
export type UpcastViewCleanupEvent = {
    name: 'viewCleanup';
    args: [ViewElement | ViewDocumentFragment];
};
export type UpcastEvent<TName extends string, TItem extends ViewItem | ViewDocumentFragment> = {
    name: TName | `${TName}:${string}`;
    args: [data: UpcastConversionData<TItem>, conversionApi: UpcastConversionApi];
};
/**
 * Conversion data.
 *
 * **Note:** Keep in mind that this object is shared by reference between all conversion callbacks that will be called.
 * This means that callbacks can override values if needed, and these values will be available in other callbacks.
 */
export interface UpcastConversionData<TItem extends ViewItem | ViewDocumentFragment = ViewItem | ViewDocumentFragment> {
    /**
     * The converted item.
     */
    viewItem: TItem;
    /**
     * The position where the converter should start changes.
     * Change this value for the next converter to tell where the conversion should continue.
     */
    modelCursor: ModelPosition;
    /**
     * The current state of conversion result. Every change to
     * the converted element should be reflected by setting or modifying this property.
     */
    modelRange: ModelRange | null;
}
/**
 * Fired when an {@link module:engine/view/element~ViewElement} is converted.
 *
 * `element` is a namespace event for a class of events. Names of actually called events follow the pattern of
 * `element:<elementName>` where `elementName` is the name of the converted element. This way listeners may listen to
 * a conversion of all or just specific elements.
 *
 * @eventName ~UpcastDispatcher#element
 * @param data The conversion data. Keep in mind that this object is shared by reference between all callbacks
 * that will be called. This means that callbacks can override values if needed, and these values
 * will be available in other callbacks.
 * @param conversionApi Conversion utilities to be used by the callback.
 */
export type UpcastElementEvent = UpcastEvent<'element', ViewElement>;
/**
 * Fired when a {@link module:engine/view/text~ViewText} is converted.
 *
 * @eventName ~UpcastDispatcher#text
 * @see ~UpcastDispatcher#event:element
 */
export type UpcastTextEvent = UpcastEvent<'text', ViewText>;
/**
 * Fired when a {@link module:engine/view/documentfragment~ViewDocumentFragment} is converted.
 *
 * @eventName ~UpcastDispatcher#documentFragment
 * @see ~UpcastDispatcher#event:element
 */
export type UpcastDocumentFragmentEvent = UpcastEvent<'documentFragment', ViewDocumentFragment>;
/**
 * A set of conversion utilities available as the third parameter of the
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher upcast dispatcher}'s events.
 */
export interface UpcastConversionApi {
    /**
     * Stores information about what parts of the processed view item are still waiting to be handled. After a piece of view item
     * was converted, an appropriate consumable value should be
     * {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consumed}.
     */
    consumable: ViewConsumable;
    /**
     * The model's schema instance.
     */
    schema: ModelSchema;
    /**
     * The {@link module:engine/model/writer~ModelWriter} instance used to manipulate the data during conversion.
     */
    writer: ModelWriter;
    /**
     * Custom data stored by converters for the conversion process. Custom properties of this object can be defined and use to
     * pass parameters between converters.
     *
     * The difference between this property and the `data` parameter of
     * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element} is that the `data` parameters allow you
     * to pass parameters within a single event and `store` within the whole conversion.
     */
    store: unknown;
    /**
     * Starts the conversion of a given item by firing an appropriate event.
     *
     * Every fired event is passed (as the first parameter) an object with the `modelRange` property. Every event may set and/or
     * modify that property. When all callbacks are done, the final value of the `modelRange` property is returned by this method.
     * The `modelRange` must be a {@link module:engine/model/range~ModelRange model range} or `null` (as set by default).
     *
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
     * @param viewItem Item to convert.
     * @param modelCursor The conversion position.
     * @returns The conversion result:
     * * `result.modelRange` The model range containing the result of the item conversion,
     * created and modified by callbacks attached to the fired event, or `null` if the conversion result was incorrect.
     * * `result.modelCursor` The position where the conversion should be continued.
     */
    convertItem(viewItem: ViewItem, modelCursor: ModelPosition): {
        modelRange: ModelRange | null;
        modelCursor: ModelPosition;
    };
    /**
     * Starts the conversion of all children of a given item by firing appropriate events for all the children.
     *
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
     * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
     * @param viewElement An element whose children should be converted.
     * @param positionOrElement A position or an element of
     * the conversion.
     * @returns The conversion result:
     * * `result.modelRange` The model range containing the results of the conversion of all children
     * of the given item. When no child was converted, the range is collapsed.
     * * `result.modelCursor` The position where the conversion should be continued.
     */
    convertChildren(viewElement: ViewElement | ViewDocumentFragment, positionOrElement: ModelPosition | ModelElement): {
        modelRange: ModelRange | null;
        modelCursor: ModelPosition;
    };
    /**
     * Safely inserts an element to the document, checking the
     * {@link module:engine/model/schema~ModelSchema schema} to find an allowed parent
     * for an element that you are going to insert, starting from the given position. If the current parent does not allow to insert
     * the element but one of the ancestors does, then splits the nodes to allowed parent.
     *
     * If the schema allows to insert the node in a given position, nothing is split.
     *
     * If it was not possible to find an allowed parent, `false` is returned and nothing is split.
     *
     * Otherwise, ancestors are split.
     *
     * For instance, if `<imageBlock>` is not allowed in `<paragraph>` but is allowed in `$root`:
     *
     * ```
     * <paragraph>foo[]bar</paragraph>
     *
     * -> safe insert for `<imageBlock>` will split ->
     *
     * <paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
     *```
     *
     * Example usage:
     *
     * ```
     * const myElement = conversionApi.writer.createElement( 'myElement' );
     *
     * if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
     * 	return;
     * }
     *```
     *
     * The split result is saved and {@link #updateConversionResult} should be used to update the
     * {@link module:engine/conversion/upcastdispatcher~UpcastConversionData conversion data}.
     *
     * @param modelNode The node to insert.
     * @param position The position where an element is going to be inserted.
     * @returns The split result. If it was not possible to find an allowed position, `false` is returned.
     */
    safeInsert(modelNode: ModelNode, position: ModelPosition): boolean;
    /**
     * Updates the conversion result and sets a proper {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelRange} and
     * the next {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelCursor} after the conversion.
     * Used together with {@link #safeInsert}, it enables you to easily convert elements without worrying if the node was split
     * during the conversion of its children.
     *
     * A usage example in converter code:
     *
     * ```ts
     * const myElement = conversionApi.writer.createElement( 'myElement' );
     *
     * if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
     * 	return;
     * }
     *
     * // Children conversion may split `myElement`.
     * conversionApi.convertChildren( data.viewItem, myElement );
     *
     * conversionApi.updateConversionResult( myElement, data );
     * ```
     */
    updateConversionResult(modelElement: ModelElement, data: UpcastConversionData): void;
    /**
     * Checks the {@link module:engine/model/schema~ModelSchema schema} to find an allowed parent for an element
     * that is going to be inserted starting from the given position. If the current parent does not allow
     * inserting an element but one of the ancestors does, the method splits nodes to allowed parent.
     *
     * If the schema allows inserting the node in the given position, nothing is split and an object with that position is returned.
     *
     * If it was not possible to find an allowed parent, `null` is returned and nothing is split.
     *
     * Otherwise, ancestors are split and an object with a position and the copy of the split element is returned.
     *
     * For instance, if `<imageBlock>` is not allowed in `<paragraph>` but is allowed in `$root`:
     *
     * ```
     * <paragraph>foo[]bar</paragraph>
     *
     * -> split for `<imageBlock>` ->
     *
     * <paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
     * ```
     *
     * In the example above, the position between `<paragraph>` elements will be returned as `position` and the second `paragraph`
     * as `cursorParent`.
     *
     * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
     *
     * @param modelNode The node to insert.
     * @param modelCursor The position where the element is going to be inserted.
     * @returns The split result. If it was not possible to find an allowed position, `null` is returned.
     * * `position` The position between split elements.
     * * `cursorParent` The element inside which the cursor should be placed to
     * continue the conversion. When the element is not defined it means that there was no split.
     */
    splitToAllowedParent(modelNode: ModelNode, modelCursor: ModelPosition): {
        position: ModelPosition;
        cursorParent?: ModelElement | ModelDocumentFragment;
    } | null;
    /**
     * Returns all the split parts of the given `element` that were created during upcasting through using {@link #splitToAllowedParent}.
     * It enables you to easily track these elements and continue processing them after they are split during the conversion of their
     * children.
     *
     * ```
     * <paragraph>Foo<imageBlock />bar<imageBlock />baz</paragraph> ->
     * <paragraph>Foo</paragraph><imageBlock /><paragraph>bar</paragraph><imageBlock /><paragraph>baz</paragraph>
     * ```
     *
     * For a reference to any of above paragraphs, the function will return all three paragraphs (the original element included),
     * sorted in the order of their creation (the original element is the first one).
     *
     * If the given `element` was not split, an array with a single element is returned.
     *
     * A usage example in the converter code:
     *
     * ```ts
     * const myElement = conversionApi.writer.createElement( 'myElement' );
     *
     * // Children conversion may split `myElement`.
     * conversionApi.convertChildren( data.viewItem, data.modelCursor );
     *
     * const splitParts = conversionApi.getSplitParts( myElement );
     * const lastSplitPart = splitParts[ splitParts.length - 1 ];
     *
     * // Setting `data.modelRange` basing on split parts:
     * data.modelRange = conversionApi.writer.createRange(
     * 	conversionApi.writer.createPositionBefore( myElement ),
     * 	conversionApi.writer.createPositionAfter( lastSplitPart )
     * );
     *
     * // Setting `data.modelCursor` to continue after the last split element:
     * data.modelCursor = conversionApi.writer.createPositionAfter( lastSplitPart );
     * ```
     *
     * **Tip:** If you are unable to get a reference to the original element (for example because the code is split into multiple converters
     * or even classes) but it has already been converted, you may want to check the first element in `data.modelRange`. This is a common
     * situation if an attribute converter is separated from an element converter.
     *
     * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
     */
    getSplitParts(modelElement: ModelElement): Array<ModelElement>;
    /**
     * Mark an element that was created during splitting to not get removed on conversion end even if it is empty.
     *
     * **Note:** This is an advanced method. For most cases you will not need to keep the split empty element.
     */
    keepEmptyElement(modelElement: ModelElement): void;
}
export {};

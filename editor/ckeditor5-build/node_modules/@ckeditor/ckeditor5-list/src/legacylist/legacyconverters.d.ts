/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylist/legacyconverters
 */
import { type DowncastAttributeEvent, type DowncastInsertEvent, type DowncastRemoveEvent, type ModelElement, type MapperModelToViewPositionEvent, type MapperViewToModelPositionEvent, type Model, type ModelInsertContentEvent, type UpcastElementEvent, type EditingView, type ModelWriter } from 'ckeditor5/src/engine.js';
import type { GetCallback } from 'ckeditor5/src/utils.js';
/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It creates a `<ul><li></li><ul>` (or `<ol>`) view structure out of a `listItem` model element, inserts it at the correct
 * position, and merges the list with surrounding lists (if available).
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 */
export declare function modelViewInsertion(model: Model): GetCallback<DowncastInsertEvent<ModelElement>>;
/**
 * A model-to-view converter for the `listItem` model element removal.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */
export declare function modelViewRemove(model: Model): GetCallback<DowncastRemoveEvent>;
/**
 * A model-to-view converter for the `type` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished
 * by breaking view elements and changing their name. The next {@link module:list/legacylist/legacyconverters~modelViewMergeAfterChangeType}
 * converter will attempt to merge split nodes.
 *
 * Splitting this conversion into 2 steps makes it possible to add an additional conversion in the middle.
 * Check {@link module:list/legacytodolist/legacytodolistconverters~modelViewChangeType} to see an example of it.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 */
export declare const modelViewChangeType: GetCallback<DowncastAttributeEvent<ModelElement>>;
/**
 * A model-to-view converter that attempts to merge nodes split by {@link module:list/legacylist/legacyconverters~modelViewChangeType}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 */
export declare const modelViewMergeAfterChangeType: GetCallback<DowncastAttributeEvent<ModelElement>>;
/**
 * A model-to-view converter for the `listIndent` attribute change on the `listItem` model element.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */
export declare function modelViewChangeIndent(model: Model): GetCallback<DowncastAttributeEvent<ModelElement>>;
/**
 * A special model-to-view converter introduced by the {@link module:list/legacylist~LegacyList list feature}. This converter is fired for
 * insert change of every model item, and should be fired before the actual converter. The converter checks whether the inserted
 * model item is a non-`listItem` element. If it is, and it is inserted inside a view list, the converter breaks the
 * list so the model element is inserted to the view parent element corresponding to its model parent element.
 *
 * The converter prevents such situations:
 *
 * ```xml
 * // Model:                        // View:
 * <listItem>foo</listItem>         <ul>
 * <listItem>bar</listItem>             <li>foo</li>
 *                                      <li>bar</li>
 *                                  </ul>
 *
 * // After change:                 // Correct view guaranteed by this converter:
 * <listItem>foo</listItem>         <ul><li>foo</li></ul><p>xxx</p><ul><li>bar</li></ul>
 * <paragraph>xxx</paragraph>       // Instead of this wrong view state:
 * <listItem>bar</listItem>         <ul><li>foo</li><p>xxx</p><li>bar</li></ul>
 * ```
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 */
export declare const modelViewSplitOnInsert: GetCallback<DowncastInsertEvent<ModelElement>>;
/**
 * A special model-to-view converter introduced by the {@link module:list/legacylist~LegacyList list feature}. This converter takes care of
 * merging view lists after something is removed or moved from near them.
 *
 * Example:
 *
 * ```xml
 * // Model:                        // View:
 * <listItem>foo</listItem>         <ul><li>foo</li></ul>
 * <paragraph>xxx</paragraph>       <p>xxx</p>
 * <listItem>bar</listItem>         <ul><li>bar</li></ul>
 *
 * // After change:                 // Correct view guaranteed by this converter:
 * <listItem>foo</listItem>         <ul>
 * <listItem>bar</listItem>             <li>foo</li>
 *                                      <li>bar</li>
 *                                  </ul>
 * ```
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 */
export declare const modelViewMergeAfter: GetCallback<DowncastRemoveEvent>;
/**
 * A view-to-model converter that converts the `<li>` view elements into the `listItem` model elements.
 *
 * To set correct values of the `listType` and `listIndent` attributes the converter:
 * * checks `<li>`'s parent,
 * * stores and increases the `conversionApi.store.indent` value when `<li>`'s sub-items are converted.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */
export declare const viewModelConverter: GetCallback<UpcastElementEvent>;
/**
 * A view-to-model converter for the `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */
export declare const cleanList: GetCallback<UpcastElementEvent>;
/**
 * A view-to-model converter for the `<li>` elements that cleans whitespace formatting from the input view.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */
export declare const cleanListItem: GetCallback<UpcastElementEvent>;
/**
 * Returns a callback for model position to view position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `listItem` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @internal
 */
export declare function modelToViewPosition(view: EditingView): GetCallback<MapperModelToViewPositionEvent>;
/**
 * The callback for view position to model position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `<li>` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @internal
 * @see module:engine/conversion/mapper~Mapper#event:viewToModelPosition
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */
export declare function viewToModelPosition(model: Model): GetCallback<MapperViewToModelPositionEvent>;
/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=1>Item 2</listItem>   <--- this is removed.
 * <listItem listType="bulleted" listIndent=2>Item 3</listItem>
 * ```
 *
 * The list structure after the middle element is removed:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=2>Item 3</listItem>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 * ```
 *
 * @internal
 * @param model The data model.
 * @param writer The writer to do changes with.
 * @returns `true` if any change has been applied, `false` otherwise.
 */
export declare function modelChangePostFixer(model: Model, writer: ModelWriter): boolean;
/**
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>A</listItem>
 * <listItem listType="bulleted" listIndent=1>B^</listItem>
 * // At ^ paste:  <listItem listType="bulleted" listIndent=4>X</listItem>
 * //              <listItem listType="bulleted" listIndent=5>Y</listItem>
 * <listItem listType="bulleted" listIndent=2>C</listItem>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>A</listItem>
 * <listItem listType="bulleted" listIndent=1>BX</listItem>
 * <listItem listType="bulleted" listIndent=2>Y/listItem>
 * <listItem listType="bulleted" listIndent=2>C</listItem>
 * ```
 *
 * @internal
 */
export declare const modelIndentPasteFixer: GetCallback<ModelInsertContentEvent>;

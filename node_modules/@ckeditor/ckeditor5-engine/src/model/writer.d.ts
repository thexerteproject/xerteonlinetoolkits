/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ModelDocumentFragment } from './documentfragment.js';
import { ModelElement } from './element.js';
import { ModelPosition, type ModelPositionOffset, type ModelPositionStickiness } from './position.js';
import { ModelRange } from './range.js';
import { ModelRootElement } from './rootelement.js';
import { ModelText } from './text.js';
import type { Marker } from './markercollection.js';
import type { ModelSelection, ModelPlaceOrOffset, ModelSelectable } from './selection.js';
import { type Batch } from './batch.js';
import { type ModelItem } from './item.js';
import { type Model } from './model.js';
import type { ModelNode, ModelNodeAttributes } from './node.js';
/**
 * The model can only be modified by using the writer. It should be used whenever you want to create a node, modify
 * child nodes, attributes or text, set the selection's position and its attributes.
 *
 * The instance of the writer is only available in the {@link module:engine/model/model~Model#change `change()`} or
 * {@link module:engine/model/model~Model#enqueueChange `enqueueChange()`}.
 *
 * ```ts
 * model.change( writer => {
 * 	writer.insertText( 'foo', paragraph, 'end' );
 * } );
 * ```
 *
 * Note that the writer should never be stored and used outside of the `change()` and
 * `enqueueChange()` blocks.
 *
 * Note that writer's methods do not check the {@link module:engine/model/schema~ModelSchema}. It is possible
 * to create incorrect model structures by using the writer. Read more about in
 * {@glink framework/deep-dive/schema#who-checks-the-schema "Who checks the schema?"}.
 *
 * @see module:engine/model/model~Model#change
 * @see module:engine/model/model~Model#enqueueChange
 */
export declare class ModelWriter {
    /**
     * Instance of the model on which this writer operates.
     */
    readonly model: Model;
    /**
     * The batch to which this writer will add changes.
     */
    readonly batch: Batch;
    /**
     * Creates a writer instance.
     *
     * **Note:** It is not recommended to use it directly. Use {@link module:engine/model/model~Model#change `Model#change()`} or
     * {@link module:engine/model/model~Model#enqueueChange `Model#enqueueChange()`} instead.
     *
     * @internal
     */
    constructor(model: Model, batch: Batch);
    /**
     * Creates a new {@link module:engine/model/text~ModelText text node}.
     *
     * ```ts
     * writer.createText( 'foo' );
     * writer.createText( 'foo', { bold: true } );
     * ```
     *
     * @param data Text data.
     * @param attributes Text attributes.
     * @returns {module:engine/model/text~ModelText} Created text node.
     */
    createText(data: string, attributes?: ModelNodeAttributes): ModelText;
    /**
     * Creates a new {@link module:engine/model/element~ModelElement element}.
     *
     * ```ts
     * writer.createElement( 'paragraph' );
     * writer.createElement( 'paragraph', { alignment: 'center' } );
     * ```
     *
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @returns Created element.
     */
    createElement(name: string, attributes?: ModelNodeAttributes): ModelElement;
    /**
     * Creates a new {@link module:engine/model/documentfragment~ModelDocumentFragment document fragment}.
     *
     * @returns Created document fragment.
     */
    createDocumentFragment(): ModelDocumentFragment;
    /**
     * Creates a copy of the element and returns it. Created element has the same name and attributes as the original element.
     * If clone is deep, the original element's children are also cloned. If not, then empty element is returned.
     *
     * @param element The element to clone.
     * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
     * element will be cloned without any child.
     */
    cloneElement(element: ModelElement, deep?: boolean): ModelElement;
    /**
     * Inserts item on given position.
     *
     * ```ts
     * const paragraph = writer.createElement( 'paragraph' );
     * writer.insert( paragraph, position );
     * ```
     *
     * Instead of using position you can use parent and offset:
     *
     * ```ts
     * const text = writer.createText( 'foo' );
     * writer.insert( text, paragraph, 5 );
     * ```
     *
     * You can also use `end` instead of the offset to insert at the end:
     *
     * ```ts
     * const text = writer.createText( 'foo' );
     * writer.insert( text, paragraph, 'end' );
     * ```
     *
     * Or insert before or after another element:
     *
     * ```ts
     * const paragraph = writer.createElement( 'paragraph' );
     * writer.insert( paragraph, anotherParagraph, 'after' );
     * ```
     *
     * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * Note that if the item already has parent it will be removed from the previous parent.
     *
     * Note that you cannot re-insert a node from a document to a different document or a document fragment. In this case,
     * `model-writer-insert-forbidden-move` is thrown.
     *
     * If you want to move {@link module:engine/model/range~ModelRange range} instead of an
     * {@link module:engine/model/item~ModelItem item} use {@link module:engine/model/writer~ModelWriter#move `Writer#move()`}.
     *
     * **Note:** For a paste-like content insertion mechanism see
     * {@link module:engine/model/model~Model#insertContent `model.insertContent()`}.
     *
     * @param item Item or document fragment to insert.
     * @param offset Offset or one of the flags. Used only when second parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    insert(item: ModelItem | ModelDocumentFragment, itemOrPosition: ModelItem | ModelDocumentFragment | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Creates and inserts text on given position.
     *
     * ```ts
     * writer.insertText( 'foo', position );
     * ```
     *
     * Instead of using position you can use parent and offset or define that text should be inserted at the end
     * or before or after other node:
     *
     * ```ts
     * // Inserts 'foo' in paragraph, at offset 5:
     * writer.insertText( 'foo', paragraph, 5 );
     * // Inserts 'foo' at the end of a paragraph:
     * writer.insertText( 'foo', paragraph, 'end' );
     * // Inserts 'foo' after an image:
     * writer.insertText( 'foo', image, 'after' );
     * ```
     *
     * These parameters work in the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * @label WITHOUT_ATTRIBUTES
     * @param text Text data.
     * @param offset Offset or one of the flags. Used only when second parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    insertText(text: string, itemOrPosition?: ModelItem | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Creates and inserts text with specified attributes on given position.
     *
     * ```ts
     * writer.insertText( 'foo', { bold: true }, position );
     * ```
     *
     * Instead of using position you can use parent and offset or define that text should be inserted at the end
     * or before or after other node:
     *
     * ```ts
     * // Inserts 'foo' in paragraph, at offset 5:
     * writer.insertText( 'foo', { bold: true }, paragraph, 5 );
     * // Inserts 'foo' at the end of a paragraph:
     * writer.insertText( 'foo', { bold: true }, paragraph, 'end' );
     * // Inserts 'foo' after an image:
     * writer.insertText( 'foo', { bold: true }, image, 'after' );
     * ```
     *
     * These parameters work in the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * @label WITH_ATTRIBUTES
     * @param text Text data.
     * @param attributes Text attributes.
     * @param offset Offset or one of the flags. Used only when third parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    insertText(text: string, attributes?: ModelNodeAttributes, itemOrPosition?: ModelItem | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Creates and inserts element on given position. You can optionally set attributes:
     *
     * ```ts
     * writer.insertElement( 'paragraph', position );
     * ```
     *
     * Instead of using position you can use parent and offset or define that text should be inserted at the end
     * or before or after other node:
     *
     * ```ts
     * // Inserts paragraph in the root at offset 5:
     * writer.insertElement( 'paragraph', root, 5 );
     * // Inserts paragraph at the end of a blockquote:
     * writer.insertElement( 'paragraph', blockquote, 'end' );
     * // Inserts after an image:
     * writer.insertElement( 'paragraph', image, 'after' );
     * ```
     *
     * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * @label WITHOUT_ATTRIBUTES
     * @param name Name of the element.
     * @param offset Offset or one of the flags. Used only when second parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    insertElement(name: string, itemOrPosition: ModelItem | ModelDocumentFragment | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Creates and inserts element with specified attributes on given position.
     *
     * ```ts
     * writer.insertElement( 'paragraph', { alignment: 'center' }, position );
     * ```
     *
     * Instead of using position you can use parent and offset or define that text should be inserted at the end
     * or before or after other node:
     *
     * ```ts
     * // Inserts paragraph in the root at offset 5:
     * writer.insertElement( 'paragraph', { alignment: 'center' }, root, 5 );
     * // Inserts paragraph at the end of a blockquote:
     * writer.insertElement( 'paragraph', { alignment: 'center' }, blockquote, 'end' );
     * // Inserts after an image:
     * writer.insertElement( 'paragraph', { alignment: 'center' }, image, 'after' );
     * ```
     *
     * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * @label WITH_ATTRIBUTES
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @param offset Offset or one of the flags. Used only when third parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    insertElement(name: string, attributes: ModelNodeAttributes, itemOrPosition: ModelItem | ModelDocumentFragment | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Inserts item at the end of the given parent.
     *
     * ```ts
     * const paragraph = writer.createElement( 'paragraph' );
     * writer.append( paragraph, root );
     * ```
     *
     * Note that if the item already has parent it will be removed from the previous parent.
     *
     * If you want to move {@link module:engine/model/range~ModelRange range} instead of an
     * {@link module:engine/model/item~ModelItem item} use {@link module:engine/model/writer~ModelWriter#move `Writer#move()`}.
     *
     * @param item Item or document fragment to insert.
     */
    append(item: ModelItem | ModelDocumentFragment, parent: ModelElement | ModelDocumentFragment): void;
    /**
     * Creates text node and inserts it at the end of the parent.
     *
     * ```ts
     * writer.appendText( 'foo', paragraph );
     * ```
     *
     * @label WITHOUT_ATTRIBUTES
     * @param text Text data.
     */
    appendText(text: string, parent: ModelElement | ModelDocumentFragment): void;
    /**
     * Creates text node with specified attributes and inserts it at the end of the parent.
     *
     * ```ts
     * writer.appendText( 'foo', { bold: true }, paragraph );
     * ```
     *
     * @label WITH_ATTRIBUTES
     * @param text Text data.
     * @param attributes Text attributes.
     */
    appendText(text: string, attributes: ModelNodeAttributes, parent: ModelElement | ModelDocumentFragment): void;
    /**
     * Creates element and inserts it at the end of the parent.
     *
     * ```ts
     * writer.appendElement( 'paragraph', root );
     * ```
     *
     * @label WITHOUT_ATTRIBUTES
     * @param name Name of the element.
     */
    appendElement(name: string, parent: ModelElement | ModelDocumentFragment): void;
    /**
     * Creates element with specified attributes and inserts it at the end of the parent.
     *
     * ```ts
     * writer.appendElement( 'paragraph', { alignment: 'center' }, root );
     * ```
     *
     * @label WITH_ATTRIBUTES
     * @param name Name of the element.
     * @param attributes Elements attributes.
     */
    appendElement(name: string, attributes: ModelNodeAttributes, parent: ModelElement | ModelDocumentFragment): void;
    /**
     * Sets value of the attribute with given key on a {@link module:engine/model/item~ModelItem model item}
     * or on a {@link module:engine/model/range~ModelRange range}.
     *
     * @param key Attribute key.
     * @param value Attribute new value.
     * @param itemOrRange Model item or range on which the attribute will be set.
     */
    setAttribute(key: string, value: unknown, itemOrRange: ModelItem | ModelRange): void;
    /**
     * Sets values of attributes on a {@link module:engine/model/item~ModelItem model item}
     * or on a {@link module:engine/model/range~ModelRange range}.
     *
     * ```ts
     * writer.setAttributes( {
     * 	bold: true,
     * 	italic: true
     * }, range );
     * ```
     *
     * @param attributes Attributes keys and values.
     * @param itemOrRange Model item or range on which the attributes will be set.
     */
    setAttributes(attributes: ModelNodeAttributes, itemOrRange: ModelItem | ModelRange): void;
    /**
     * Removes an attribute with given key from a {@link module:engine/model/item~ModelItem model item}
     * or from a {@link module:engine/model/range~ModelRange range}.
     *
     * @param key Attribute key.
     * @param itemOrRange Model item or range from which the attribute will be removed.
     */
    removeAttribute(key: string, itemOrRange: ModelItem | ModelRange): void;
    /**
     * Removes all attributes from all elements in the range or from the given item.
     *
     * @param itemOrRange Model item or range from which all attributes will be removed.
     */
    clearAttributes(itemOrRange: ModelItem | ModelRange): void;
    /**
     * Moves all items in the source range to the target position.
     *
     * ```ts
     * writer.move( sourceRange, targetPosition );
     * ```
     *
     * Instead of the target position you can use parent and offset or define that range should be moved to the end
     * or before or after chosen item:
     *
     * ```ts
     * // Moves all items in the range to the paragraph at offset 5:
     * writer.move( sourceRange, paragraph, 5 );
     * // Moves all items in the range to the end of a blockquote:
     * writer.move( sourceRange, blockquote, 'end' );
     * // Moves all items in the range to a position after an image:
     * writer.move( sourceRange, image, 'after' );
     * ```
     *
     * These parameters work the same way as {@link #createPositionAt `writer.createPositionAt()`}.
     *
     * Note that items can be moved only within the same tree. It means that you can move items within the same root
     * (element or document fragment) or between {@link module:engine/model/document~ModelDocument#roots documents roots},
     * but you cannot move items from document fragment to the document or from one detached element to another. Use
     * {@link module:engine/model/writer~ModelWriter#insert} in such cases.
     *
     * @param range Source range.
     * @param offset Offset or one of the flags. Used only when second parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    move(range: ModelRange, itemOrPosition: ModelItem | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Removes given model {@link module:engine/model/item~ModelItem item} or {@link module:engine/model/range~ModelRange range}.
     *
     * @param itemOrRange Model item or range to remove.
     */
    remove(itemOrRange: ModelItem | ModelRange): void;
    /**
     * Merges two siblings at the given position.
     *
     * Node before and after the position have to be an element. Otherwise `writer-merge-no-element-before` or
     * `writer-merge-no-element-after` error will be thrown.
     *
     * @param position Position between merged elements.
     */
    merge(position: ModelPosition): void;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createPositionFromPath `Model#createPositionFromPath()`}.
     *
     * @param root Root of the position.
     * @param path Position path. See {@link module:engine/model/position~ModelPosition#path}.
     * @param stickiness Position stickiness. See {@link module:engine/model/position~ModelPositionStickiness}.
     */
    createPositionFromPath(root: ModelElement | ModelDocumentFragment, path: ReadonlyArray<number>, stickiness?: ModelPositionStickiness): ModelPosition;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createPositionAt `Model#createPositionAt()`}.
     *
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    createPositionAt(itemOrPosition: ModelItem | ModelPosition | ModelDocumentFragment, offset?: ModelPositionOffset): ModelPosition;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createPositionAfter `Model#createPositionAfter()`}.
     *
     * @param item Item after which the position should be placed.
     */
    createPositionAfter(item: ModelItem): ModelPosition;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createPositionBefore `Model#createPositionBefore()`}.
     *
     * @param item Item after which the position should be placed.
     */
    createPositionBefore(item: ModelItem): ModelPosition;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createRange `Model#createRange()`}.
     *
     * @param start Start position.
     * @param end End position. If not set, range will be collapsed at `start` position.
     */
    createRange(start: ModelPosition, end?: ModelPosition): ModelRange;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createRangeIn `Model#createRangeIn()`}.
     *
     * @param element Element which is a parent for the range.
     */
    createRangeIn(element: ModelElement | ModelDocumentFragment): ModelRange;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createRangeOn `Model#createRangeOn()`}.
     *
     * @param element Element which is a parent for the range.
     */
    createRangeOn(element: ModelItem): ModelRange;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createSelection:NODE_OFFSET `Model#createSelection()`}.
     *
     * @label NODE_OFFSET
     */
    createSelection(selectable: ModelNode, placeOrOffset: ModelPlaceOrOffset, options?: {
        backward?: boolean;
    }): ModelSelection;
    /**
     * Shortcut for {@link module:engine/model/model~Model#createSelection:SELECTABLE `Model#createSelection()`}.
     *
     * @label SELECTABLE
     */
    createSelection(selectable?: Exclude<ModelSelectable, ModelNode>, options?: {
        backward?: boolean;
    }): ModelSelection;
    /**
     * Performs merge action in a detached tree.
     *
     * @param position Position between merged elements.
     */
    private _mergeDetached;
    /**
     * Performs merge action in a non-detached tree.
     *
     * @param position Position between merged elements.
     */
    private _merge;
    /**
     * Renames the given element.
     *
     * @param element The element to rename.
     * @param newName New element name.
     */
    rename(element: ModelElement | ModelDocumentFragment, newName: string): void;
    /**
     * Splits elements starting from the given position and going to the top of the model tree as long as given
     * `limitElement` is reached. When `limitElement` is not defined then only the parent of the given position will be split.
     *
     * The element needs to have a parent. It cannot be a root element nor a document fragment.
     * The `writer-split-element-no-parent` error will be thrown if you try to split an element with no parent.
     *
     * @param position Position of split.
     * @param limitElement Stop splitting when this element will be reached.
     * @returns Split result with properties:
     * * `position` - Position between split elements.
     * * `range` - Range that stars from the end of the first split element and ends at the beginning of the first copy element.
     */
    split(position: ModelPosition, limitElement?: ModelNode | ModelDocumentFragment): {
        position: ModelPosition;
        range: ModelRange;
    };
    /**
     * Wraps the given range with the given element or with a new element (if a string was passed).
     *
     * **Note:** range to wrap should be a "flat range" (see {@link module:engine/model/range~ModelRange#isFlat `Range#isFlat`}).
     * If not, an error will be thrown.
     *
     * @param range Range to wrap.
     * @param elementOrString Element or name of element to wrap the range with.
     */
    wrap(range: ModelRange, elementOrString: ModelElement | string): void;
    /**
     * Unwraps children of the given element – all its children are moved before it and then the element is removed.
     * Throws error if you try to unwrap an element which does not have a parent.
     *
     * @param element Element to unwrap.
     */
    unwrap(element: ModelElement): void;
    /**
     * Adds a {@link module:engine/model/markercollection~Marker marker}. Marker is a named range, which tracks
     * changes in the document and updates its range automatically, when model tree changes.
     *
     * As the first parameter you can set marker name.
     *
     * The required `options.usingOperation` parameter lets you decide if the marker should be managed by operations or not. See
     * {@link module:engine/model/markercollection~Marker marker class description} to learn about the difference between
     * markers managed by operations and not-managed by operations.
     *
     * The `options.affectsData` parameter, which defaults to `false`, allows you to define if a marker affects the data. It should be
     * `true` when the marker change changes the data returned by the
     * {@link module:core/editor/editor~Editor#getData `editor.getData()`} method.
     * When set to `true` it fires the {@link module:engine/model/document~ModelDocument#event:change:data `change:data`} event.
     * When set to `false` it fires the {@link module:engine/model/document~ModelDocument#event:change `change`} event.
     *
     * Create marker directly base on marker's name:
     *
     * ```ts
     * addMarker( markerName, { range, usingOperation: false } );
     * ```
     *
     * Create marker using operation:
     *
     * ```ts
     * addMarker( markerName, { range, usingOperation: true } );
     * ```
     *
     * Create marker that affects the editor data:
     *
     * ```ts
     * addMarker( markerName, { range, usingOperation: false, affectsData: true } );
     * ```
     *
     * Note: For efficiency reasons, it's best to create and keep as little markers as possible.
     *
     * @see module:engine/model/markercollection~Marker
     * @param name Name of a marker to create - must be unique.
     * @param options.usingOperation Flag indicating that the marker should be added by MarkerOperation.
     * See {@link module:engine/model/markercollection~Marker#managedUsingOperations}.
     * @param options.range Marker range.
     * @param options.affectsData Flag indicating that the marker changes the editor data.
     * @returns Marker that was set.
     */
    addMarker(name: string, options: {
        usingOperation: boolean;
        affectsData?: boolean;
        range: ModelRange;
    }): Marker;
    /**
     * Adds, updates or refreshes a {@link module:engine/model/markercollection~Marker marker}. Marker is a named range, which tracks
     * changes in the document and updates its range automatically, when model tree changes. Still, it is possible to change the
     * marker's range directly using this method.
     *
     * As the first parameter you can set marker name or instance. If none of them is provided, new marker, with a unique
     * name is created and returned.
     *
     * **Note**: If you want to change the {@link module:engine/view/element~ViewElement view element}
     * of the marker while its data in the model
     * remains the same, use the dedicated {@link module:engine/controller/editingcontroller~EditingController#reconvertMarker} method.
     *
     * The `options.usingOperation` parameter lets you change if the marker should be managed by operations or not. See
     * {@link module:engine/model/markercollection~Marker marker class description} to learn about the difference between
     * markers managed by operations and not-managed by operations. It is possible to change this option for an existing marker.
     *
     * The `options.affectsData` parameter, which defaults to `false`, allows you to define if a marker affects the data. It should be
     * `true` when the marker change changes the data returned by
     * the {@link module:core/editor/editor~Editor#getData `editor.getData()`} method.
     * When set to `true` it fires the {@link module:engine/model/document~ModelDocument#event:change:data `change:data`} event.
     * When set to `false` it fires the {@link module:engine/model/document~ModelDocument#event:change `change`} event.
     *
     * Update marker directly base on marker's name:
     *
     * ```ts
     * updateMarker( markerName, { range } );
     * ```
     *
     * Update marker using operation:
     *
     * ```ts
     * updateMarker( marker, { range, usingOperation: true } );
     * updateMarker( markerName, { range, usingOperation: true } );
     * ```
     *
     * Change marker's option (start using operations to manage it):
     *
     * ```ts
     * updateMarker( marker, { usingOperation: true } );
     * ```
     *
     * Change marker's option (inform the engine, that the marker does not affect the data anymore):
     *
     * ```ts
     * updateMarker( markerName, { affectsData: false } );
     * ```
     *
     * @see module:engine/model/markercollection~Marker
     * @param markerOrName Name of a marker to update, or a marker instance.
     * @param options If options object is not defined then marker will be refreshed by triggering
     * downcast conversion for this marker with the same data.
     * @param options.range Marker range to update.
     * @param options.usingOperation Flag indicated whether the marker should be added by MarkerOperation.
     * See {@link module:engine/model/markercollection~Marker#managedUsingOperations}.
     * @param options.affectsData Flag indicating that the marker changes the editor data.
     */
    updateMarker(markerOrName: string | Marker, options?: {
        range?: ModelRange;
        usingOperation?: boolean;
        affectsData?: boolean;
    }): void;
    /**
     * Removes given {@link module:engine/model/markercollection~Marker marker} or marker with given name.
     * The marker is removed accordingly to how it has been created, so if the marker was created using operation,
     * it will be destroyed using operation.
     *
     * @param markerOrName Marker or marker name to remove.
     */
    removeMarker(markerOrName: string | Marker): void;
    /**
     * Adds a new root to the document (or re-attaches a {@link #detachRoot detached root}).
     *
     * Throws an error, if trying to add a root that is already added and attached.
     *
     * @param rootName Name of the added root.
     * @param elementName The element name. Defaults to `'$root'` which also has some basic schema defined
     * (e.g. `$block` elements are allowed inside the `$root`). Make sure to define a proper schema if you use a different name.
     * @returns The added root element.
     */
    addRoot(rootName: string, elementName?: string): ModelRootElement;
    /**
     * Detaches the root from the document.
     *
     * All content and markers are removed from the root upon detaching. New content and new markers cannot be added to the root, as long
     * as it is detached.
     *
     * A root cannot be fully removed from the document, it can be only detached. A root is permanently removed only after you
     * re-initialize the editor and do not specify the root in the initial data.
     *
     * A detached root can be re-attached using {@link #addRoot}.
     *
     * Throws an error if the root does not exist or the root is already detached.
     *
     * @param rootOrName Name of the detached root.
     */
    detachRoot(rootOrName: string | ModelRootElement): void;
    /**
     * Sets the document's selection (ranges and direction) to the specified location based on the given
     * {@link module:engine/model/selection~ModelSelectable selectable} or creates an empty selection if no arguments were passed.
     *
     * ```ts
     * // Sets collapsed selection at the position of the given node and an offset.
     * writer.setSelection( paragraph, offset );
     * ```
     *
     * Creates a range inside an {@link module:engine/model/element~ModelElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * ```ts
     * writer.setSelection( paragraph, 'in' );
     * ```
     *
     * Creates a range on an {@link module:engine/model/item~ModelItem item} which starts before the item and ends just after the item.
     *
     * ```ts
     * writer.setSelection( paragraph, 'on' );
     * ```
     *
     * `Writer#setSelection()` allow passing additional options (`backward`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * writer.setSelection( element, 'in', { backward: true } );
     * ```
     *
     * Throws `writer-incorrect-use` error when the writer is used outside the `change()` block.
     *
     * See also: {@link #setSelection:SELECTABLE `setSelection( selectable, options )`}.
     *
     * @label NODE_OFFSET
     */
    setSelection(selectable: ModelNode, placeOrOffset: ModelPlaceOrOffset, options?: {
        backward?: boolean;
    }): void;
    /**
     * Sets the document's selection (ranges and direction) to the specified location based on the given
     * {@link module:engine/model/selection~ModelSelectable selectable} or creates an empty selection if no arguments were passed.
     *
     * ```ts
     * // Sets selection to the given range.
     * const range = writer.createRange( start, end );
     * writer.setSelection( range );
     *
     * // Sets selection to given ranges.
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
     * writer.setSelection( ranges );
     *
     * // Sets selection to other selection.
     * const otherSelection = writer.createSelection();
     * writer.setSelection( otherSelection );
     *
     * // Sets selection to the given document selection.
     * const documentSelection = model.document.selection;
     * writer.setSelection( documentSelection );
     *
     * // Sets collapsed selection at the given position.
     * const position = writer.createPosition( root, path );
     * writer.setSelection( position );
     *
     * // Removes all selection's ranges.
     * writer.setSelection( null );
     * ```
     *
     * `Writer#setSelection()` allow passing additional options (`backward`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * writer.setSelection( range, { backward: true } );
     * ```
     *
     * Throws `writer-incorrect-use` error when the writer is used outside the `change()` block.
     *
     * See also: {@link #setSelection:NODE_OFFSET `setSelection( node, placeOrOffset, options )`}.
     *
     * @label SELECTABLE
     */
    setSelection(selectable: Exclude<ModelSelectable, ModelNode>, options?: {
        backward?: boolean;
    }): void;
    /**
     * Moves {@link module:engine/model/documentselection~ModelDocumentSelection#focus} to the specified location.
     *
     * The location can be specified in the same form as
     * {@link #createPositionAt `writer.createPositionAt()`} parameters.
     *
     * @param itemOrPosition
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    setSelectionFocus(itemOrPosition: ModelItem | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
     *
     * ```ts
     * writer.setSelectionAttribute( 'italic', true );
     * ```
     *
     * @label KEY_VALUE
     * @param key Key of the attribute to set.
     * @param value Attribute value.
     */
    setSelectionAttribute(key: string, value: unknown): void;
    /**
     * Sets attributes on the selection. If any attribute with the same key already is set, it's value is overwritten.
     *
     * Using key-value object:
     *
     * ```ts
     * writer.setSelectionAttribute( { italic: true, bold: false } );
     * ```
     *
     * Using iterable object:
     *
     * ```ts
     * writer.setSelectionAttribute( new Map( [ [ 'italic', true ] ] ) );
     * ```
     *
     * @label OBJECT
     * @param objectOrIterable Object / iterable of key => value attribute pairs.
     */
    setSelectionAttribute(objectOrIterable: ModelNodeAttributes): void;
    /**
     * Removes attribute(s) with given key(s) from the selection.
     *
     * Remove one attribute:
     *
     * ```ts
     * writer.removeSelectionAttribute( 'italic' );
     * ```
     *
     * Remove multiple attributes:
     *
     * ```ts
     * writer.removeSelectionAttribute( [ 'italic', 'bold' ] );
     * ```
     *
     * @param keyOrIterableOfKeys Key of the attribute to remove or an iterable of attribute keys to remove.
     */
    removeSelectionAttribute(keyOrIterableOfKeys: string | Iterable<string>): void;
    /**
     * Temporarily changes the {@link module:engine/model/documentselection~ModelDocumentSelection#isGravityOverridden gravity}
     * of the selection from left to right.
     *
     * The gravity defines from which direction the selection inherits its attributes. If it's the default left gravity,
     * then the selection (after being moved by the user) inherits attributes from its left-hand side.
     * This method allows to temporarily override this behavior by forcing the gravity to the right.
     *
     * For the following model fragment:
     *
     * ```xml
     * <$text bold="true" linkHref="url">bar[]</$text><$text bold="true">biz</$text>
     * ```
     *
     * * Default gravity: selection will have the `bold` and `linkHref` attributes.
     * * Overridden gravity: selection will have `bold` attribute.
     *
     * **Note**: It returns an unique identifier which is required to restore the gravity. It guarantees the symmetry
     * of the process.
     *
     * @returns The unique id which allows restoring the gravity.
     */
    overrideSelectionGravity(): string;
    /**
     * Restores {@link ~ModelWriter#overrideSelectionGravity} gravity to default.
     *
     * Restoring the gravity is only possible using the unique identifier returned by
     * {@link ~ModelWriter#overrideSelectionGravity}. Note that the gravity remains overridden as long as won't be restored
     * the same number of times it was overridden.
     *
     * @param uid The unique id returned by {@link ~ModelWriter#overrideSelectionGravity}.
     */
    restoreSelectionGravity(uid: string): void;
    /**
     * @param key Key of the attribute to remove.
     * @param value Attribute value.
     */
    private _setSelectionAttribute;
    /**
     * @param key Key of the attribute to remove.
     */
    private _removeSelectionAttribute;
    /**
     * Throws `writer-detached-writer-tries-to-modify-model` error when the writer is used outside of the `change()` block.
     */
    private _assertWriterUsedCorrectly;
    /**
     * For given action `type` and `positionOrRange` where the action happens, this function finds all affected markers
     * and applies a marker operation with the new marker range equal to the current range. Thanks to this, the marker range
     * can be later correctly processed during undo.
     *
     * @param type Writer action type.
     * @param positionOrRange Position or range where the writer action happens.
     */
    private _addOperationForAffectedMarkers;
}

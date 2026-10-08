/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/selection
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { ModelNode } from './node.js';
import { ModelPosition, type ModelPositionOffset } from './position.js';
import { ModelRange } from './range.js';
import { type ModelDocumentSelection } from './documentselection.js';
import { type ModelElement } from './element.js';
import { type ModelItem } from './item.js';
declare const ModelSelection_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ModelTypeCheckable, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * Selection is a set of {@link module:engine/model/range~ModelRange ranges}. It has a direction specified by its
 * {@link module:engine/model/selection~ModelSelection#anchor anchor} and {@link module:engine/model/selection~ModelSelection#focus focus}
 * (it can be {@link module:engine/model/selection~ModelSelection#isBackward forward or backward}).
 * Additionally, selection may have its own attributes (think – whether text typed in in this selection
 * should have those attributes – e.g. whether you type a bolded text).
 */
export declare class ModelSelection extends /* #__PURE__ */ ModelSelection_base {
    /**
     * Specifies whether the last added range was added as a backward or forward range.
     */
    private _lastRangeBackward;
    /**
     * List of attributes set on current selection.
     */
    protected _attrs: Map<string, unknown>;
    /** @internal */
    _ranges: Array<ModelRange>;
    /**
     * Creates a new selection instance based on the given {@link module:engine/model/selection~ModelSelectable selectable}
     * or creates an empty selection if no arguments were passed.
     *
     * ```ts
     * // Creates empty selection without ranges.
     * const selection = writer.createSelection();
     *
     * // Creates selection at the given range.
     * const range = writer.createRange( start, end );
     * const selection = writer.createSelection( range );
     *
     * // Creates selection at the given ranges
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
     * const selection = writer.createSelection( ranges );
     *
     * // Creates selection from the other selection.
     * // Note: It doesn't copy selection attributes.
     * const otherSelection = writer.createSelection();
     * const selection = writer.createSelection( otherSelection );
     *
     * // Creates selection from the given document selection.
     * // Note: It doesn't copy selection attributes.
     * const documentSelection = model.document.selection;
     * const selection = writer.createSelection( documentSelection );
     *
     * // Creates selection at the given position.
     * const position = writer.createPositionFromPath( root, path );
     * const selection = writer.createSelection( position );
     *
     * // Creates selection at the given offset in the given element.
     * const paragraph = writer.createElement( 'paragraph' );
     * const selection = writer.createSelection( paragraph, offset );
     *
     * // Creates a range inside an {@link module:engine/model/element~ModelElement element} which starts before the
     * // first child of that element and ends after the last child of that element.
     * const selection = writer.createSelection( paragraph, 'in' );
     *
     * // Creates a range on an {@link module:engine/model/item~ModelItem item} which starts before the item and ends
     * // just after the item.
     * const selection = writer.createSelection( paragraph, 'on' );
     * ```
     *
     * Selection's constructor allow passing additional options (`'backward'`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = writer.createSelection( range, { backward: true } );
     * ```
     *
     * @internal
     */
    constructor(...args: [] | [
        selectable: ModelNode,
        placeOrOffset: ModelPlaceOrOffset,
        options?: {
            backward?: boolean;
        }
    ] | [
        selectable?: Exclude<ModelSelectable, ModelNode>,
        options?: {
            backward?: boolean;
        }
    ]);
    /**
     * Selection anchor. Anchor is the position from which the selection was started. If a user is making a selection
     * by dragging the mouse, the anchor is where the user pressed the mouse button (the beginning of the selection).
     *
     * Anchor and {@link #focus} define the direction of the selection, which is important
     * when expanding/shrinking selection. The focus moves, while the anchor should remain in the same place.
     *
     * Anchor is always set to the {@link module:engine/model/range~ModelRange#start start} or
     * {@link module:engine/model/range~ModelRange#end end} position of the last of selection's ranges. Whether it is
     * the `start` or `end` depends on the specified `options.backward`. See the {@link #setTo `setTo()`} method.
     *
     * May be set to `null` if there are no ranges in the selection.
     *
     * @see #focus
     */
    get anchor(): ModelPosition | null;
    /**
     * Selection focus. Focus is the position where the selection ends. If a user is making a selection
     * by dragging the mouse, the focus is where the mouse cursor is.
     *
     * May be set to `null` if there are no ranges in the selection.
     *
     * @see #anchor
     */
    get focus(): ModelPosition | null;
    /**
     * Whether the selection is collapsed. Selection is collapsed when there is exactly one range in it
     * and it is collapsed.
     */
    get isCollapsed(): boolean;
    /**
     * Returns the number of ranges in the selection.
     */
    get rangeCount(): number;
    /**
     * Specifies whether the selection's {@link #focus} precedes the selection's {@link #anchor}.
     */
    get isBackward(): boolean;
    /**
     * Checks whether this selection is equal to the given selection. Selections are equal if they have the same directions,
     * the same number of ranges and all ranges from one selection equal to ranges from the another selection.
     *
     * @param otherSelection Selection to compare with.
     * @returns `true` if selections are equal, `false` otherwise.
     */
    isEqual(otherSelection: ModelSelection | ModelDocumentSelection): boolean;
    /**
     * Returns an iterable object that iterates over copies of selection ranges.
     */
    getRanges(): IterableIterator<ModelRange>;
    /**
     * Returns a copy of the first range in the selection.
     * First range is the one which {@link module:engine/model/range~ModelRange#start start} position
     * {@link module:engine/model/position~ModelPosition#isBefore is before} start position of all other ranges
     * (not to confuse with the first range added to the selection).
     *
     * Returns `null` if there are no ranges in selection.
     */
    getFirstRange(): ModelRange | null;
    /**
     * Returns a copy of the last range in the selection.
     * Last range is the one which {@link module:engine/model/range~ModelRange#end end} position
     * {@link module:engine/model/position~ModelPosition#isAfter is after} end position of all other
     * ranges (not to confuse with the range most recently added to the selection).
     *
     * Returns `null` if there are no ranges in selection.
     */
    getLastRange(): ModelRange | null;
    /**
     * Returns the first position in the selection.
     * First position is the position that {@link module:engine/model/position~ModelPosition#isBefore is before}
     * any other position in the selection.
     *
     * Returns `null` if there are no ranges in selection.
     */
    getFirstPosition(): ModelPosition | null;
    /**
     * Returns the last position in the selection.
     * Last position is the position that {@link module:engine/model/position~ModelPosition#isAfter is after}
     * any other position in the selection.
     *
     * Returns `null` if there are no ranges in selection.
     */
    getLastPosition(): ModelPosition | null;
    /**
     * Sets this selection's ranges and direction to the specified location based on the given
     * {@link module:engine/model/selection~ModelSelectable selectable}.
     *
     * ```ts
     * // Removes all selection's ranges.
     * selection.setTo( null );
     *
     * // Sets selection to the given range.
     * const range = writer.createRange( start, end );
     * selection.setTo( range );
     *
     * // Sets selection to given ranges.
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
     * selection.setTo( ranges );
     *
     * // Sets selection to other selection.
     * // Note: It doesn't copy selection attributes.
     * const otherSelection = writer.createSelection();
     * selection.setTo( otherSelection );
     *
     * // Sets selection to the given document selection.
     * // Note: It doesn't copy selection attributes.
     * const documentSelection = new ModelDocumentSelection( doc );
     * selection.setTo( documentSelection );
     *
     * // Sets collapsed selection at the given position.
     * const position = writer.createPositionFromPath( root, path );
     * selection.setTo( position );
     *
     * // Sets collapsed selection at the position of the given node and an offset.
     * selection.setTo( paragraph, offset );
     * ```
     *
     * Creates a range inside an {@link module:engine/model/element~ModelElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * ```ts
     * selection.setTo( paragraph, 'in' );
     * ```
     *
     * Creates a range on an {@link module:engine/model/item~ModelItem item} which starts before the item and ends just after the item.
     *
     * ```ts
     * selection.setTo( paragraph, 'on' );
     * ```
     *
     * `Selection#setTo()`' method allow passing additional options (`backward`) as the last argument.
     *
     * ```ts
     * // Sets backward selection.
     * const selection = writer.createSelection( range, { backward: true } );
     * ```
     */
    setTo(...args: [
        selectable: ModelNode,
        placeOrOffset: ModelPlaceOrOffset,
        options?: {
            backward?: boolean;
        }
    ] | [
        selectable?: Exclude<ModelSelectable, ModelNode>,
        options?: {
            backward?: boolean;
        }
    ]): void;
    /**
     * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
     * is treated like the last added range and is used to set {@link module:engine/model/selection~ModelSelection#anchor} and
     * {@link module:engine/model/selection~ModelSelection#focus}. Accepts a flag describing in which direction the selection is made.
     *
     * @fires change:range
     * @param newRanges Ranges to set.
     * @param isLastBackward Flag describing if last added range was selected forward - from start to end (`false`)
     * or backward - from end to start (`true`).
     */
    protected _setRanges(newRanges: Iterable<ModelRange>, isLastBackward?: boolean): void;
    /**
     * Moves {@link module:engine/model/selection~ModelSelection#focus} to the specified location.
     *
     * The location can be specified in the same form as
     * {@link module:engine/model/writer~ModelWriter#createPositionAt writer.createPositionAt()} parameters.
     *
     * @fires change:range
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    setFocus(itemOrPosition: ModelItem | ModelPosition, offset?: ModelPositionOffset): void;
    /**
     * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
     *
     * @param key Key of attribute to look for.
     * @returns Attribute value or `undefined`.
     */
    getAttribute(key: string): unknown;
    /**
     * Returns iterable that iterates over this selection's attributes.
     *
     * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes(): IterableIterator<[string, unknown]>;
    /**
     * Returns iterable that iterates over this selection's attribute keys.
     */
    getAttributeKeys(): IterableIterator<string>;
    /**
     * Checks if the selection has an attribute for given key.
     *
     * @param key Key of attribute to check.
     * @returns `true` if attribute with given key is set on selection, `false` otherwise.
     */
    hasAttribute(key: string): boolean;
    /**
     * Removes an attribute with given key from the selection.
     *
     * If given attribute was set on the selection, fires the {@link #event:change:range} event with
     * removed attribute key.
     *
     * @fires change:attribute
     * @param key Key of attribute to remove.
     */
    removeAttribute(key: string): void;
    /**
     * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
     *
     * If the attribute value has changed, fires the {@link #event:change:range} event with
     * the attribute key.
     *
     * @fires change:attribute
     * @param key Key of attribute to set.
     * @param value Attribute value.
     */
    setAttribute(key: string, value: unknown): void;
    /**
     * Returns the selected element. {@link module:engine/model/element~ModelElement Element} is considered as selected if there is only
     * one range in the selection, and that range contains exactly one element.
     * Returns `null` if there is no selected element.
     */
    getSelectedElement(): ModelElement | null;
    /**
     * Gets elements of type {@link module:engine/model/schema~ModelSchema#isBlock "block"} touched by the selection.
     *
     * This method's result can be used for example to apply block styling to all blocks covered by this selection.
     *
     * **Note:** `getSelectedBlocks()` returns blocks that are nested in other non-block elements
     * but will not return blocks nested in other blocks.
     *
     * In this case the function will return exactly all 3 paragraphs (note: `<blockQuote>` is not a block itself):
     *
     * ```xml
     * <paragraph>[a</paragraph>
     * <blockQuote>
     * 	<paragraph>b</paragraph>
     * </blockQuote>
     * <paragraph>c]d</paragraph>
     * ```
     *
     * In this case the paragraph will also be returned, despite the collapsed selection:
     *
     * ```xml
     * <paragraph>[]a</paragraph>
     * ```
     *
     * In such a scenario, however, only blocks A, B & E will be returned as blocks C & D are nested in block B:
     *
     * ```xml
     * [<blockA></blockA>
     * <blockB>
     * 	<blockC></blockC>
     * 	<blockD></blockD>
     * </blockB>
     * <blockE></blockE>]
     * ```
     *
     * If the selection is inside a block all the inner blocks (A & B) are returned:
     *
     * ```xml
     * <block>
     * 	<blockA>[a</blockA>
     * 	<blockB>b]</blockB>
     * </block>
     * ```
     *
     * **Special case**: Selection ignores first and/or last blocks if nothing (from user perspective) is selected in them.
     *
     * ```xml
     * // Selection ends and the beginning of the last block.
     * <paragraph>[a</paragraph>
     * <paragraph>b</paragraph>
     * <paragraph>]c</paragraph> // This block will not be returned
     *
     * // Selection begins at the end of the first block.
     * <paragraph>a[</paragraph> // This block will not be returned
     * <paragraph>b</paragraph>
     * <paragraph>c]</paragraph>
     *
     * // Selection begings at the end of the first block and ends at the beginning of the last block.
     * <paragraph>a[</paragraph> // This block will not be returned
     * <paragraph>b</paragraph>
     * <paragraph>]c</paragraph> // This block will not be returned
     * ```
     */
    getSelectedBlocks(): IterableIterator<ModelElement>;
    /**
     * Checks whether the selection contains the entire content of the given element. This means that selection must start
     * at a position {@link module:engine/model/position~ModelPosition#isTouching touching} the element's start and ends at position
     * touching the element's end.
     *
     * By default, this method will check whether the entire content of the selection's current root is selected.
     * Useful to check if e.g. the user has just pressed <kbd>Ctrl</kbd> + <kbd>A</kbd>.
     */
    containsEntireContent(element?: ModelElement): boolean;
    /**
     * Converts `Selection` to plain object and returns it.
     *
     * @returns `Selection` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Adds given range to internal {@link #_ranges ranges array}. Throws an error
     * if given range is intersecting with any range that is already stored in this selection.
     */
    protected _pushRange(range: ModelRange): void;
    /**
     * Checks if given range intersects with ranges that are already in the selection. Throws an error if it does.
     */
    protected _checkRange(range: ModelRange): void;
    /**
     * Replaces all the ranges by the given ones.
     * Uses {@link #_popRange _popRange} and {@link #_pushRange _pushRange} to ensure proper ranges removal and addition.
     */
    protected _replaceAllRanges(ranges: Array<ModelRange>): void;
    /**
     * Deletes ranges from internal range array. Uses {@link #_popRange _popRange} to
     * ensure proper ranges removal.
     */
    protected _removeAllRanges(): void;
    /**
     * Removes most recently added range from the selection.
     */
    protected _popRange(): void;
}
/**
 * Describes one of the events: `change:range` or `change:attribute`.
 */
export type ModelSelectionChangeEvent = {
    name: 'change' | 'change:range' | 'change:attribute';
    args: [
        {
            directChange: boolean;
            attributeKeys?: Array<string>;
        }
    ];
};
/**
 * Fired when selection range(s) changed.
 *
 * @eventName ~ModelSelection#change:range
 * @param directChange In case of {@link module:engine/model/selection~ModelSelection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~ModelDocumentSelection}, however, may change because its position
 * was directly changed through the {@link module:engine/model/writer~ModelWriter writer} or because its position was
 * changed because the structure of the model has been changed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 */
export type ModelSelectionChangeRangeEvent = {
    name: 'change' | 'change:range';
    args: [
        {
            directChange: boolean;
        }
    ];
};
/**
 * Fired when selection attribute changed.
 *
 * @eventName ~ModelSelection#change:attribute
 * @param directChange In case of {@link module:engine/model/selection~ModelSelection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~ModelDocumentSelection}, however, may change because its attributes
 * were directly changed through the {@link module:engine/model/writer~ModelWriter writer} or because its position was
 * changed in the model and its attributes were refreshed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 * @param attributeKeys Array containing keys of attributes that changed.
 */
export type ModelSelectionChangeAttributeEvent = {
    name: 'change' | 'change:attribute';
    args: [
        {
            directChange: boolean;
            attributeKeys: Array<string>;
        }
    ];
};
/**
 * An entity that is used to set selection.
 *
 * See also {@link module:engine/model/selection~ModelSelection#setTo}.
 */
export type ModelSelectable = ModelSelection | ModelDocumentSelection | ModelPosition | ModelRange | ModelNode | Iterable<ModelRange> | null;
/**
 * The place or offset of the selection.
 */
export type ModelPlaceOrOffset = number | 'before' | 'end' | 'after' | 'on' | 'in';
export {};

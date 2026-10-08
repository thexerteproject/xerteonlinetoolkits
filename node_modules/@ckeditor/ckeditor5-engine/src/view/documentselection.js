/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/documentselection
 */
import { ViewTypeCheckable } from './typecheckable.js';
import { ViewSelection } from './selection.js';
import { EmitterMixin } from '@ckeditor/ckeditor5-utils';
/**
 * Class representing the document selection in the view.
 *
 * Its instance is available in {@link module:engine/view/document~ViewDocument#selection `Document#selection`}.
 *
 * It is similar to {@link module:engine/view/selection~ViewSelection} but
 * it has a read-only API and can be modified only by the writer available in
 * the {@link module:engine/view/view~EditingView#change `View#change()`} block
 * (so via {@link module:engine/view/downcastwriter~ViewDowncastWriter#setSelection `ViewDowncastWriter#setSelection()`}).
 */
export class ViewDocumentSelection extends /* #__PURE__ */ EmitterMixin(ViewTypeCheckable) {
    /**
     * Selection is used internally (`ViewDocumentSelection` is a proxy to that selection).
     */
    _selection;
    constructor(...args) {
        super();
        this._selection = new ViewSelection();
        // Delegate change event to be fired on ViewDocumentSelection instance.
        this._selection.delegate('change').to(this);
        // Set selection data.
        if (args.length) {
            this._selection.setTo(...args);
        }
    }
    /**
     * Returns true if selection instance is marked as `fake`.
     *
     * @see #_setTo
     */
    get isFake() {
        return this._selection.isFake;
    }
    /**
     * Returns fake selection label.
     *
     * @see #_setTo
     */
    get fakeSelectionLabel() {
        return this._selection.fakeSelectionLabel;
    }
    /**
     * Selection anchor. Anchor may be described as a position where the selection starts. Together with
     * {@link #focus focus} they define the direction of selection, which is important
     * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
     * It may be a bit unintuitive when there are multiple ranges in selection.
     *
     * @see #focus
     */
    get anchor() {
        return this._selection.anchor;
    }
    /**
     * Selection focus. Focus is a position where the selection ends.
     *
     * @see #anchor
     */
    get focus() {
        return this._selection.focus;
    }
    /**
     * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
     * collapsed.
     */
    get isCollapsed() {
        return this._selection.isCollapsed;
    }
    /**
     * Returns number of ranges in selection.
     */
    get rangeCount() {
        return this._selection.rangeCount;
    }
    /**
     * Specifies whether the {@link #focus} precedes {@link #anchor}.
     */
    get isBackward() {
        return this._selection.isBackward;
    }
    /**
     * {@link module:engine/view/editableelement~ViewEditableElement ViewEditableElement} instance that contains this selection, or `null`
     * if the selection is not inside an editable element.
     */
    get editableElement() {
        return this._selection.editableElement;
    }
    /**
     * Used for the compatibility with the {@link module:engine/view/selection~ViewSelection#isEqual} method.
     *
     * @internal
     */
    get _ranges() {
        return this._selection._ranges;
    }
    /**
     * Returns an iterable that contains copies of all ranges added to the selection.
     */
    *getRanges() {
        yield* this._selection.getRanges();
    }
    /**
     * Returns copy of the first range in the selection. First range is the one which
     * {@link module:engine/view/range~ViewRange#start start} position
     * {@link module:engine/view/position~ViewPosition#isBefore is before} start
     * position of all other ranges (not to confuse with the first range added to the selection).
     * Returns `null` if no ranges are added to selection.
     */
    getFirstRange() {
        return this._selection.getFirstRange();
    }
    /**
     * Returns copy of the last range in the selection. Last range is the one which {@link module:engine/view/range~ViewRange#end end}
     * position {@link module:engine/view/position~ViewPosition#isAfter is after} end position of all other ranges (not to confuse
     * with the last range added to the selection). Returns `null` if no ranges are added to selection.
     */
    getLastRange() {
        return this._selection.getLastRange();
    }
    /**
     * Returns copy of the first position in the selection. First position is the position that
     * {@link module:engine/view/position~ViewPosition#isBefore is before} any other position in the selection ranges.
     * Returns `null` if no ranges are added to selection.
     */
    getFirstPosition() {
        return this._selection.getFirstPosition();
    }
    /**
     * Returns copy of the last position in the selection. Last position is the position that
     * {@link module:engine/view/position~ViewPosition#isAfter is after} any other position in the selection ranges.
     * Returns `null` if no ranges are added to selection.
     */
    getLastPosition() {
        return this._selection.getLastPosition();
    }
    /**
     * Returns the selected element. {@link module:engine/view/element~ViewElement Element} is considered as selected if there is only
     * one range in the selection, and that range contains exactly one element.
     * Returns `null` if there is no selected element.
     */
    getSelectedElement() {
        return this._selection.getSelectedElement();
    }
    /**
     * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
     * same number of ranges and all ranges from one selection equal to a range from other selection.
     *
     * @param otherSelection Selection to compare with.
     * @returns `true` if selections are equal, `false` otherwise.
     */
    isEqual(otherSelection) {
        return this._selection.isEqual(otherSelection);
    }
    /**
     * Checks whether this selection is similar to given selection. Selections are similar if they have same directions, same
     * number of ranges, and all {@link module:engine/view/range~ViewRange#getTrimmed trimmed} ranges from one selection are
     * equal to any trimmed range from other selection.
     *
     * @param otherSelection Selection to compare with.
     * @returns `true` if selections are similar, `false` otherwise.
     */
    isSimilar(otherSelection) {
        return this._selection.isSimilar(otherSelection);
    }
    /**
     * Converts `ViewDocumentSelection` instance to plain object and returns it.
     *
     * @returns `ViewDocumentSelection` instance converted to plain object.
     */
    toJSON() {
        return this._selection.toJSON();
    }
    /**
     * Sets this selection's ranges and direction to the specified location based on the given
     * {@link module:engine/view/selection~ViewSelectable selectable}.
     *
     * ```ts
     * // Sets selection to the given range.
     * const range = writer.createRange( start, end );
     * documentSelection._setTo( range );
     *
     * // Sets selection to given ranges.
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
     * documentSelection._setTo( range );
     *
     * // Sets selection to the other selection.
     * const otherSelection = writer.createSelection();
     * documentSelection._setTo( otherSelection );
     *
     * // Sets collapsed selection at the given position.
     * const position = writer.createPositionAt( root, offset );
     * documentSelection._setTo( position );
     *
     * // Sets collapsed selection at the position of given item and offset.
     * documentSelection._setTo( paragraph, offset );
     * ```
     *
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * ```ts
     * documentSelection._setTo( paragraph, 'in' );
     * ```
     *
     * Creates a range on an {@link module:engine/view/item~ViewItem item} which starts before the item and ends just after the item.
     *
     * ```ts
     * documentSelection._setTo( paragraph, 'on' );
     *
     * // Clears selection. Removes all ranges.
     * documentSelection._setTo( null );
     * ```
     *
     * `Selection#_setTo()` method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * documentSelection._setTo( range, { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to des cribe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * documentSelection._setTo( range, { fake: true, label: 'foo' } );
     * ```
     *
     * @internal
     * @fires change
     */
    _setTo(...args) {
        this._selection.setTo(...args);
    }
    /**
     * Moves {@link #focus} to the specified location.
     *
     * The location can be specified in the same form as
     * {@link module:engine/view/view~EditingView#createPositionAt view.createPositionAt()}
     * parameters.
     *
     * @internal
     * @fires change
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~ViewItem view item}.
     */
    _setFocus(itemOrPosition, offset) {
        this._selection.setFocus(itemOrPosition, offset);
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewDocumentSelection.prototype.is = function (type) {
    return type === 'selection' ||
        type == 'documentSelection' ||
        type == 'view:selection' ||
        type == 'view:documentSelection';
};

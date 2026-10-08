/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/documentselection
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { ModelLiveRange } from './liverange.js';
import { ModelSelection } from './selection.js';
import { ModelText } from './text.js';
import { ModelTextProxy } from './textproxy.js';
import { CKEditorError, Collection, EmitterMixin, toMap, uid } from '@ckeditor/ckeditor5-utils';
const storePrefix = 'selection:';
/**
 * `ModelDocumentSelection` is a special selection which is used as the
 * {@link module:engine/model/document~ModelDocument#selection document's selection}.
 * There can be only one instance of `ModelDocumentSelection` per document.
 *
 * Document selection can only be changed by using the {@link module:engine/model/writer~ModelWriter} instance
 * inside the {@link module:engine/model/model~Model#change `change()`} block, as it provides a secure way to modify model.
 *
 * `ModelDocumentSelection` is automatically updated upon changes in the {@link module:engine/model/document~ModelDocument document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~ModelSelection} and `ModelDocumentSelection` are:
 * * there is always a range in `ModelDocumentSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `ModelDocumentSelection` are updated automatically according to selection ranges.
 *
 * Since `ModelDocumentSelection` uses {@link module:engine/model/liverange~ModelLiveRange live ranges}
 * and is updated when {@link module:engine/model/document~ModelDocument document}
 * changes, it cannot be set on {@link module:engine/model/node~ModelNode nodes}
 * that are inside {@link module:engine/model/documentfragment~ModelDocumentFragment document fragment}.
 * If you need to represent a selection in document fragment,
 * use {@link module:engine/model/selection~ModelSelection Selection class} instead.
 */
export class ModelDocumentSelection extends /* #__PURE__ */ EmitterMixin(ModelTypeCheckable) {
    /**
     * Selection used internally by that class (`ModelDocumentSelection` is a proxy to that selection).
     */
    _selection;
    /**
     * Creates an empty live selection for given {@link module:engine/model/document~ModelDocument}.
     *
     * @param doc Document which owns this selection.
     */
    constructor(doc) {
        super();
        this._selection = new LiveSelection(doc);
        this._selection.delegate('change:range').to(this);
        this._selection.delegate('change:attribute').to(this);
        this._selection.delegate('change:marker').to(this);
    }
    /**
     * Describes whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
     * collapsed.
     */
    get isCollapsed() {
        return this._selection.isCollapsed;
    }
    /**
     * Selection anchor. Anchor may be described as a position where the most recent part of the selection starts.
     * Together with {@link #focus} they define the direction of selection, which is important
     * when expanding/shrinking selection. Anchor is always {@link module:engine/model/range~ModelRange#start start} or
     * {@link module:engine/model/range~ModelRange#end end} position of the most recently added range.
     *
     * Is set to `null` if there are no ranges in selection.
     *
     * @see #focus
     */
    get anchor() {
        return this._selection.anchor;
    }
    /**
     * Selection focus. Focus is a position where the selection ends.
     *
     * Is set to `null` if there are no ranges in selection.
     *
     * @see #anchor
     */
    get focus() {
        return this._selection.focus;
    }
    /**
     * Number of ranges in selection.
     */
    get rangeCount() {
        return this._selection.rangeCount;
    }
    /**
     * Describes whether `Documentselection` has own range(s) set, or if it is defaulted to
     * {@link module:engine/model/document~ModelDocument#_getDefaultRange document's default range}.
     */
    get hasOwnRange() {
        return this._selection.hasOwnRange;
    }
    /**
     * Specifies whether the {@link #focus}
     * precedes {@link #anchor}.
     *
     * @readonly
     * @type {Boolean}
     */
    get isBackward() {
        return this._selection.isBackward;
    }
    /**
     * Describes whether the gravity is overridden (using {@link module:engine/model/writer~ModelWriter#overrideSelectionGravity}) or not.
     *
     * Note that the gravity remains overridden as long as will not be restored the same number of times as it was overridden.
     */
    get isGravityOverridden() {
        return this._selection.isGravityOverridden;
    }
    /**
     * A collection of selection {@link module:engine/model/markercollection~Marker markers}.
     * Marker is a selection marker when selection range is inside the marker range.
     *
     * **Note**: Only markers from {@link ~ModelDocumentSelection#observeMarkers observed markers groups} are collected.
     */
    get markers() {
        return this._selection.markers;
    }
    /**
     * Used for the compatibility with the {@link module:engine/model/selection~ModelSelection#isEqual} method.
     *
     * @internal
     */
    get _ranges() {
        return this._selection._ranges;
    }
    /**
     * Returns an iterable that iterates over copies of selection ranges.
     */
    getRanges() {
        return this._selection.getRanges();
    }
    /**
     * Returns the first position in the selection.
     * First position is the position that {@link module:engine/model/position~ModelPosition#isBefore is before}
     * any other position in the selection.
     *
     * Returns `null` if there are no ranges in selection.
     */
    getFirstPosition() {
        return this._selection.getFirstPosition();
    }
    /**
     * Returns the last position in the selection.
     * Last position is the position that {@link module:engine/model/position~ModelPosition#isAfter is after}
     * any other position in the selection.
     *
     * Returns `null` if there are no ranges in selection.
     */
    getLastPosition() {
        return this._selection.getLastPosition();
    }
    /**
     * Returns a copy of the first range in the selection.
     * First range is the one which {@link module:engine/model/range~ModelRange#start start} position
     * {@link module:engine/model/position~ModelPosition#isBefore is before} start position of all other ranges
     * (not to confuse with the first range added to the selection).
     *
     * Returns `null` if there are no ranges in selection.
     */
    getFirstRange() {
        return this._selection.getFirstRange();
    }
    /**
     * Returns a copy of the last range in the selection.
     * Last range is the one which {@link module:engine/model/range~ModelRange#end end} position
     * {@link module:engine/model/position~ModelPosition#isAfter is after} end position of all
     * other ranges (not to confuse with the range most recently added to the selection).
     *
     * Returns `null` if there are no ranges in selection.
     */
    getLastRange() {
        return this._selection.getLastRange();
    }
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
     * ```
     * <paragraph>[a</paragraph>
     * <blockQuote>
     * 	<paragraph>b</paragraph>
     * </blockQuote>
     * <paragraph>c]d</paragraph>
     * ```
     *
     * In this case the paragraph will also be returned, despite the collapsed selection:
     *
     * ```
     * <paragraph>[]a</paragraph>
     * ```
     *
     * In such a scenario, however, only blocks A, B & E will be returned as blocks C & D are nested in block B:
     *
     * ```
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
     * ```
     * <block>
     * 	<blockA>[a</blockA>
     * 	<blockB>b]</blockB>
     * </block>
     * ```
     *
     * **Special case**: If a selection ends at the beginning of a block, that block is not returned as from user perspective
     * this block wasn't selected. See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
     *
     * ```
     * <paragraph>[a</paragraph>
     * <paragraph>b</paragraph>
     * <paragraph>]c</paragraph> // this block will not be returned
     * ```
     */
    getSelectedBlocks() {
        return this._selection.getSelectedBlocks();
    }
    /**
     * Returns the selected element. {@link module:engine/model/element~ModelElement Element} is considered as selected if there is only
     * one range in the selection, and that range contains exactly one element.
     * Returns `null` if there is no selected element.
     */
    getSelectedElement() {
        return this._selection.getSelectedElement();
    }
    /**
     * Checks whether the selection contains the entire content of the given element. This means that selection must start
     * at a position {@link module:engine/model/position~ModelPosition#isTouching touching} the element's start and ends at position
     * touching the element's end.
     *
     * By default, this method will check whether the entire content of the selection's current root is selected.
     * Useful to check if e.g. the user has just pressed <kbd>Ctrl</kbd> + <kbd>A</kbd>.
     */
    containsEntireContent(element) {
        return this._selection.containsEntireContent(element);
    }
    /**
     * Unbinds all events previously bound by document selection.
     */
    destroy() {
        this._selection.destroy();
    }
    /**
     * Returns iterable that iterates over this selection's attribute keys.
     */
    getAttributeKeys() {
        return this._selection.getAttributeKeys();
    }
    /**
     * Returns iterable that iterates over this selection's attributes.
     *
     * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes() {
        return this._selection.getAttributes();
    }
    /**
     * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
     *
     * @param key Key of attribute to look for.
     * @returns Attribute value or `undefined`.
     */
    getAttribute(key) {
        return this._selection.getAttribute(key);
    }
    /**
     * Checks if the selection has an attribute for given key.
     *
     * @param key Key of attribute to check.
     * @returns `true` if attribute with given key is set on selection, `false` otherwise.
     */
    hasAttribute(key) {
        return this._selection.hasAttribute(key);
    }
    /**
     * Refreshes selection attributes and markers according to the current position in the model.
     */
    refresh() {
        this._selection.updateMarkers();
        this._selection._updateAttributes(false);
    }
    /**
     * Registers a marker group prefix or a marker name to be collected in the
     * {@link ~ModelDocumentSelection#markers selection markers collection}.
     *
     * See also {@link module:engine/model/markercollection~MarkerCollection#getMarkersGroup `MarkerCollection#getMarkersGroup()`}.
     *
     * @param prefixOrName The marker group prefix or marker name.
     */
    observeMarkers(prefixOrName) {
        this._selection.observeMarkers(prefixOrName);
    }
    /**
     * Converts `DocumentSelection` to plain object and returns it.
     *
     * @returns `DocumentSelection` converted to plain object.
     */
    toJSON() {
        return this._selection.toJSON();
    }
    /**
     * Moves {@link module:engine/model/documentselection~ModelDocumentSelection#focus} to the specified location.
     * Should be used only within the {@link module:engine/model/writer~ModelWriter#setSelectionFocus} method.
     *
     * The location can be specified in the same form as
     * {@link module:engine/model/writer~ModelWriter#createPositionAt writer.createPositionAt()} parameters.
     *
     * @see module:engine/model/writer~ModelWriter#setSelectionFocus
     * @internal
     * @param offset Offset or one of the flags. Used only when
     * first parameter is a {@link module:engine/model/item~ModelItem model item}.
     */
    _setFocus(itemOrPosition, offset) {
        this._selection.setFocus(itemOrPosition, offset);
    }
    /**
     * Sets this selection's ranges and direction to the specified location based on the given
     * {@link module:engine/model/selection~ModelSelectable selectable}.
     * Should be used only within the {@link module:engine/model/writer~ModelWriter#setSelection} method.
     *
     * @see module:engine/model/writer~ModelWriter#setSelection
     * @internal
     */
    _setTo(...args) {
        this._selection.setTo(...args);
    }
    /**
     * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
     * Should be used only within the {@link module:engine/model/writer~ModelWriter#setSelectionAttribute} method.
     *
     * @see module:engine/model/writer~ModelWriter#setSelectionAttribute
     * @internal
     * @param key Key of the attribute to set.
     * @param value Attribute value.
     */
    _setAttribute(key, value) {
        this._selection.setAttribute(key, value);
    }
    /**
     * Removes an attribute with given key from the selection.
     * If the given attribute was set on the selection, fires the {@link module:engine/model/selection~ModelSelection#event:change:range}
     * event with removed attribute key.
     * Should be used only within the {@link module:engine/model/writer~ModelWriter#removeSelectionAttribute} method.
     *
     * @see module:engine/model/writer~ModelWriter#removeSelectionAttribute
     * @internal
     * @param key Key of the attribute to remove.
     */
    _removeAttribute(key) {
        this._selection.removeAttribute(key);
    }
    /**
     * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
     *
     * @internal
     */
    _getStoredAttributes() {
        return this._selection.getStoredAttributes();
    }
    /**
     * Temporarily changes the gravity of the selection from the left to the right.
     *
     * The gravity defines from which direction the selection inherits its attributes. If it's the default left
     * gravity, the selection (after being moved by the the user) inherits attributes from its left hand side.
     * This method allows to temporarily override this behavior by forcing the gravity to the right.
     *
     * It returns an unique identifier which is required to restore the gravity. It guarantees the symmetry
     * of the process.
     *
     * @see module:engine/model/writer~ModelWriter#overrideSelectionGravity
     * @internal
     * @returns The unique id which allows restoring the gravity.
     */
    _overrideGravity() {
        return this._selection.overrideGravity();
    }
    /**
     * Restores the {@link ~ModelDocumentSelection#_overrideGravity overridden gravity}.
     *
     * Restoring the gravity is only possible using the unique identifier returned by
     * {@link ~ModelDocumentSelection#_overrideGravity}. Note that the gravity remains overridden as long as won't be restored
     * the same number of times it was overridden.
     *
     * @see module:engine/model/writer~ModelWriter#restoreSelectionGravity
     * @internal
     * @param uid The unique id returned by {@link #_overrideGravity}.
     */
    _restoreGravity(uid) {
        this._selection.restoreGravity(uid);
    }
    /**
     * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
     *
     * @internal
     * @param key Attribute key to convert.
     * @returns Converted attribute key, applicable for selection store.
     */
    static _getStoreAttributeKey(key) {
        return storePrefix + key;
    }
    /**
     * Checks whether the given attribute key is an attribute stored on an element.
     *
     * @internal
     */
    static _isStoreAttributeKey(key) {
        return key.startsWith(storePrefix);
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelDocumentSelection.prototype.is = function (type) {
    return type === 'selection' ||
        type == 'model:selection' ||
        type == 'documentSelection' ||
        type == 'model:documentSelection';
};
/**
 * `LiveSelection` is used internally by {@link module:engine/model/documentselection~ModelDocumentSelection}
 * and shouldn't be used directly.
 *
 * `LiveSelection` is automatically updated upon changes in the {@link module:engine/model/document~ModelDocument document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~ModelSelection} and `LiveSelection` are:
 * * there is always a range in `LiveSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `LiveSelection` are updated automatically according to selection ranges.
 */
class LiveSelection extends ModelSelection {
    /**
     * List of selection markers.
     * Marker is a selection marker when selection range is inside the marker range.
     */
    markers = new Collection({ idProperty: 'name' });
    /**
     * Document which owns this selection.
     */
    _model;
    /**
     * Document which owns this selection.
     */
    _document;
    /**
     * Keeps mapping of attribute name to priority with which the attribute got modified (added/changed/removed)
     * last time. Possible values of priority are: `'low'` and `'normal'`.
     *
     * Priorities are used by internal `LiveSelection` mechanisms. All attributes set using `LiveSelection`
     * attributes API are set with `'normal'` priority.
     */
    _attributePriority = new Map();
    /**
     * Position to which the selection should be set if the last selection range was moved to the graveyard.
     */
    _selectionRestorePosition = null;
    /**
     * Flag that informs whether the selection ranges have changed. It is changed on true when `LiveRange#change:range` event is fired.
     */
    _hasChangedRange = false;
    /**
     * Each overriding gravity adds an UID to the set and each removal removes it.
     * Gravity is overridden when there's at least one UID in the set.
     * Gravity is restored when the set is empty.
     * This is to prevent conflicts when gravity is overridden by more than one feature at the same time.
     */
    _overriddenGravityRegister = new Set();
    /**
     * Prefixes of marker names that should affect `LiveSelection#markers` collection.
     */
    _observedMarkers = new Set();
    /**
     * Creates an empty live selection for given {@link module:engine/model/document~ModelDocument}.
     *
     * @param doc Document which owns this selection.
     */
    constructor(doc) {
        super();
        this._model = doc.model;
        this._document = doc;
        // Ensure selection is correct after each operation.
        this.listenTo(this._model, 'applyOperation', (evt, args) => {
            const operation = args[0];
            if (!operation.isDocumentOperation || operation.type == 'marker' || operation.type == 'rename' || operation.type == 'noop') {
                return;
            }
            // Fix selection if the last range was removed from it and we have a position to which we can restore the selection.
            if (this._ranges.length == 0 && this._selectionRestorePosition) {
                this._fixGraveyardSelection(this._selectionRestorePosition);
            }
            // "Forget" the restore position even if it was not "used".
            this._selectionRestorePosition = null;
            if (this._hasChangedRange) {
                this._hasChangedRange = false;
                this.fire('change:range', { directChange: false });
            }
        }, { priority: 'lowest' });
        // Ensure selection is correct and up to date after each range change.
        this.on('change:range', () => {
            this._validateSelectionRanges(this.getRanges());
        });
        // Update markers data stored by the selection after each marker change.
        // This handles only marker changes done through marker operations (not model tree changes).
        this.listenTo(this._model.markers, 'update', (evt, marker, oldRange, newRange) => {
            this._updateMarker(marker, newRange);
        });
        // Ensure selection is up to date after each change block.
        this.listenTo(this._document, 'change', (evt, batch) => {
            clearAttributesStoredInElement(this._model, batch);
        });
    }
    get isCollapsed() {
        const length = this._ranges.length;
        return length === 0 ? this._document._getDefaultRange().isCollapsed : super.isCollapsed;
    }
    get anchor() {
        return super.anchor || this._document._getDefaultRange().start;
    }
    get focus() {
        return super.focus || this._document._getDefaultRange().end;
    }
    get rangeCount() {
        return this._ranges.length ? this._ranges.length : 1;
    }
    /**
     * Describes whether `LiveSelection` has own range(s) set, or if it is defaulted to
     * {@link module:engine/model/document~ModelDocument#_getDefaultRange document's default range}.
     */
    get hasOwnRange() {
        return this._ranges.length > 0;
    }
    /**
     * When set to `true` then selection attributes on node before the caret won't be taken
     * into consideration while updating selection attributes.
     */
    get isGravityOverridden() {
        return !!this._overriddenGravityRegister.size;
    }
    /**
     * Unbinds all events previously bound by live selection.
     */
    destroy() {
        for (let i = 0; i < this._ranges.length; i++) {
            this._ranges[i].detach();
        }
        this.stopListening();
    }
    *getRanges() {
        if (this._ranges.length) {
            yield* super.getRanges();
        }
        else {
            yield this._document._getDefaultRange();
        }
    }
    getFirstRange() {
        return super.getFirstRange() || this._document._getDefaultRange();
    }
    getLastRange() {
        return super.getLastRange() || this._document._getDefaultRange();
    }
    setTo(...args) {
        super.setTo(...args);
        this._updateAttributes(true);
        this.updateMarkers();
    }
    setFocus(itemOrPosition, offset) {
        super.setFocus(itemOrPosition, offset);
        this._updateAttributes(true);
        this.updateMarkers();
    }
    setAttribute(key, value) {
        if (this._setAttribute(key, value)) {
            // Fire event with exact data.
            const attributeKeys = [key];
            this.fire('change:attribute', { attributeKeys, directChange: true });
        }
    }
    removeAttribute(key) {
        if (this._removeAttribute(key)) {
            // Fire event with exact data.
            const attributeKeys = [key];
            this.fire('change:attribute', { attributeKeys, directChange: true });
        }
    }
    overrideGravity() {
        const overrideUid = uid();
        // Remember that another overriding has been requested. It will need to be removed
        // before the gravity is to be restored.
        this._overriddenGravityRegister.add(overrideUid);
        if (this._overriddenGravityRegister.size === 1) {
            this._updateAttributes(true);
        }
        return overrideUid;
    }
    restoreGravity(uid) {
        if (!this._overriddenGravityRegister.has(uid)) {
            /**
             * Restoring gravity for an unknown UID is not possible. Make sure you are using a correct
             * UID obtained from the {@link module:engine/model/writer~ModelWriter#overrideSelectionGravity} to restore.
             *
             * @error document-selection-gravity-wrong-restore
             * @param {string} uid The unique identifier returned by
             * {@link module:engine/model/documentselection~ModelDocumentSelection#_overrideGravity}.
             */
            throw new CKEditorError('document-selection-gravity-wrong-restore', this, { uid });
        }
        this._overriddenGravityRegister.delete(uid);
        // Restore gravity only when all overriding have been restored.
        if (!this.isGravityOverridden) {
            this._updateAttributes(true);
        }
    }
    observeMarkers(prefixOrName) {
        this._observedMarkers.add(prefixOrName);
        this.updateMarkers();
    }
    _replaceAllRanges(ranges) {
        this._validateSelectionRanges(ranges);
        super._replaceAllRanges(ranges);
    }
    _popRange() {
        this._ranges.pop().detach();
    }
    _pushRange(range) {
        const liveRange = this._prepareRange(range);
        // `undefined` is returned when given `range` is in graveyard root.
        if (liveRange) {
            this._ranges.push(liveRange);
        }
    }
    /**
     * Converts `LiveSelection` to plain object and returns it.
     *
     * @returns `LiveSelection` converted to plain object.
     */
    toJSON() {
        const json = super.toJSON();
        if (this.markers.length) {
            json.markers = this.markers.map(marker => marker.toJSON());
        }
        return json;
    }
    _validateSelectionRanges(ranges) {
        for (const range of ranges) {
            if (!this._document._validateSelectionRange(range)) {
                /**
                 * Range from {@link module:engine/model/documentselection~ModelDocumentSelection document selection}
                 * starts or ends at incorrect position.
                 *
                 * @error document-selection-wrong-position
                 * @param {module:engine/model/range~ModelRange} range The invalid range.
                 */
                throw new CKEditorError('document-selection-wrong-position', this, { range });
            }
        }
    }
    /**
     * Prepares given range to be added to selection. Checks if it is correct,
     * converts it to {@link module:engine/model/liverange~ModelLiveRange ModelLiveRange}
     * and sets listeners listening to the range's change event.
     */
    _prepareRange(range) {
        this._checkRange(range);
        if (range.root == this._document.graveyard) {
            // @if CK_DEBUG // console.warn( 'Trying to add a Range that is in the graveyard root. Range rejected.' );
            return;
        }
        const liveRange = ModelLiveRange.fromRange(range);
        // If selection range is moved to the graveyard remove it from the selection object.
        // Also, save some data that can be used to restore selection later, on `Model#applyOperation` event.
        liveRange.on('change:range', (evt, oldRange, data) => {
            this._hasChangedRange = true;
            if (liveRange.root == this._document.graveyard) {
                this._selectionRestorePosition = data.deletionPosition;
                const index = this._ranges.indexOf(liveRange);
                this._ranges.splice(index, 1);
                liveRange.detach();
            }
        });
        return liveRange;
    }
    updateMarkers() {
        if (!this._observedMarkers.size) {
            return;
        }
        const markers = [];
        let changed = false;
        for (const marker of this._model.markers) {
            const markerGroup = marker.name.split(':', 1)[0];
            if (!this._observedMarkers.has(markerGroup)) {
                continue;
            }
            const markerRange = marker.getRange();
            for (const selectionRange of this.getRanges()) {
                if (markerRange.containsRange(selectionRange, !selectionRange.isCollapsed)) {
                    markers.push(marker);
                }
            }
        }
        const oldMarkers = Array.from(this.markers);
        for (const marker of markers) {
            if (!this.markers.has(marker)) {
                this.markers.add(marker);
                changed = true;
            }
        }
        for (const marker of Array.from(this.markers)) {
            if (!markers.includes(marker)) {
                this.markers.remove(marker);
                changed = true;
            }
        }
        if (changed) {
            this.fire('change:marker', { oldMarkers, directChange: false });
        }
    }
    _updateMarker(marker, markerRange) {
        const markerGroup = marker.name.split(':', 1)[0];
        if (!this._observedMarkers.has(markerGroup)) {
            return;
        }
        let changed = false;
        const oldMarkers = Array.from(this.markers);
        const hasMarker = this.markers.has(marker);
        if (!markerRange) {
            if (hasMarker) {
                this.markers.remove(marker);
                changed = true;
            }
        }
        else {
            let contained = false;
            for (const selectionRange of this.getRanges()) {
                if (markerRange.containsRange(selectionRange, !selectionRange.isCollapsed)) {
                    contained = true;
                    break;
                }
            }
            if (contained && !hasMarker) {
                this.markers.add(marker);
                changed = true;
            }
            else if (!contained && hasMarker) {
                this.markers.remove(marker);
                changed = true;
            }
        }
        if (changed) {
            this.fire('change:marker', { oldMarkers, directChange: false });
        }
    }
    /**
     * Updates this selection attributes according to its ranges and the {@link module:engine/model/document~ModelDocument model document}.
     */
    _updateAttributes(clearAll) {
        const newAttributes = toMap(this._getSurroundingAttributes());
        const oldAttributes = toMap(this.getAttributes());
        if (clearAll) {
            // If `clearAll` remove all attributes and reset priorities.
            this._attributePriority = new Map();
            this._attrs = new Map();
        }
        else {
            // If not, remove only attributes added with `low` priority.
            for (const [key, priority] of this._attributePriority) {
                if (priority == 'low') {
                    this._attrs.delete(key);
                    this._attributePriority.delete(key);
                }
            }
        }
        this._setAttributesTo(newAttributes);
        // Let's evaluate which attributes really changed.
        const changed = [];
        // First, loop through all attributes that are set on selection right now.
        // Check which of them are different than old attributes.
        for (const [newKey, newValue] of this.getAttributes()) {
            if (!oldAttributes.has(newKey) || oldAttributes.get(newKey) !== newValue) {
                changed.push(newKey);
            }
        }
        // Then, check which of old attributes got removed.
        for (const [oldKey] of oldAttributes) {
            if (!this.hasAttribute(oldKey)) {
                changed.push(oldKey);
            }
        }
        // Fire event with exact data (fire only if anything changed).
        if (changed.length > 0) {
            this.fire('change:attribute', { attributeKeys: changed, directChange: false });
        }
    }
    /**
     * Internal method for setting `LiveSelection` attribute. Supports attribute priorities (through `directChange`
     * parameter).
     */
    _setAttribute(key, value, directChange = true) {
        const priority = directChange ? 'normal' : 'low';
        if (priority == 'low' && this._attributePriority.get(key) == 'normal') {
            // Priority too low.
            return false;
        }
        const oldValue = super.getAttribute(key);
        // Don't do anything if value has not changed.
        if (oldValue === value) {
            return false;
        }
        this._attrs.set(key, value);
        // Update priorities map.
        this._attributePriority.set(key, priority);
        return true;
    }
    /**
     * Internal method for removing `LiveSelection` attribute. Supports attribute priorities (through `directChange`
     * parameter).
     *
     * NOTE: Even if attribute is not present in the selection but is provided to this method, it's priority will
     * be changed according to `directChange` parameter.
     */
    _removeAttribute(key, directChange = true) {
        const priority = directChange ? 'normal' : 'low';
        if (priority == 'low' && this._attributePriority.get(key) == 'normal') {
            // Priority too low.
            return false;
        }
        // Update priorities map.
        this._attributePriority.set(key, priority);
        // Don't do anything if value has not changed.
        if (!super.hasAttribute(key)) {
            return false;
        }
        this._attrs.delete(key);
        return true;
    }
    /**
     * Internal method for setting multiple `LiveSelection` attributes. Supports attribute priorities (through
     * `directChange` parameter).
     */
    _setAttributesTo(attrs) {
        const changed = new Set();
        for (const [oldKey, oldValue] of this.getAttributes()) {
            // Do not remove attribute if attribute with same key and value is about to be set.
            if (attrs.get(oldKey) === oldValue) {
                continue;
            }
            // All rest attributes will be removed so changed attributes won't change .
            this._removeAttribute(oldKey, false);
        }
        for (const [key, value] of attrs) {
            // Attribute may not be set because of attributes or because same key/value is already added.
            const gotAdded = this._setAttribute(key, value, false);
            if (gotAdded) {
                changed.add(key);
            }
        }
        return changed;
    }
    /**
     * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
     */
    *getStoredAttributes() {
        const selectionParent = this.getFirstPosition().parent;
        if (this.isCollapsed && selectionParent.isEmpty) {
            for (const key of selectionParent.getAttributeKeys()) {
                if (key.startsWith(storePrefix)) {
                    const realKey = key.substr(storePrefix.length);
                    yield [realKey, selectionParent.getAttribute(key)];
                }
            }
        }
    }
    /**
     * Checks model text nodes that are closest to the selection's first position and returns attributes of first
     * found element. If there are no text nodes in selection's first position parent, it returns selection
     * attributes stored in that parent.
     */
    _getSurroundingAttributes() {
        const position = this.getFirstPosition();
        const schema = this._model.schema;
        if (position.root.rootName == '$graveyard') {
            return null;
        }
        let attrs = null;
        if (!this.isCollapsed) {
            // 1. If selection is a range...
            const range = this.getFirstRange();
            // ...look for a first character node in that range and take attributes from it.
            for (const value of range) {
                // If the item is an object, we don't want to get attributes from its children...
                if (value.item.is('element') && schema.isObject(value.item)) {
                    // ...but collect attributes from inline object.
                    attrs = getTextAttributes(value.item, schema);
                    break;
                }
                if (value.type == 'text') {
                    attrs = value.item.getAttributes();
                    break;
                }
            }
        }
        else {
            // 2. If the selection is a caret or the range does not contain a character node...
            const nodeBefore = position.textNode ? position.textNode : position.nodeBefore;
            const nodeAfter = position.textNode ? position.textNode : position.nodeAfter;
            // When gravity is overridden then don't take node before into consideration.
            if (!this.isGravityOverridden) {
                // ...look at the node before caret and take attributes from it if it is a character node.
                attrs = getTextAttributes(nodeBefore, schema);
            }
            // 3. If not, look at the node after caret...
            if (!attrs) {
                attrs = getTextAttributes(nodeAfter, schema);
            }
            // 4. If not, try to find the first character on the left, that is in the same node.
            // When gravity is overridden then don't take node before into consideration.
            if (!this.isGravityOverridden && !attrs) {
                let node = nodeBefore;
                while (node && !attrs) {
                    node = node.previousSibling;
                    attrs = getTextAttributes(node, schema);
                }
            }
            // 5. If not found, try to find the first character on the right, that is in the same node.
            if (!attrs) {
                let node = nodeAfter;
                while (node && !attrs) {
                    node = node.nextSibling;
                    attrs = getTextAttributes(node, schema);
                }
            }
            // 6. If not found, selection should retrieve attributes from parent.
            if (!attrs) {
                attrs = this.getStoredAttributes();
            }
        }
        return attrs;
    }
    /**
     * Fixes the selection after all its ranges got removed.
     * @param deletionPosition Position where the deletion happened.
     */
    _fixGraveyardSelection(deletionPosition) {
        // Find a range that is a correct selection range and is closest to the position where the deletion happened.
        const selectionRange = this._model.schema.getNearestSelectionRange(deletionPosition);
        // If nearest valid selection range has been found - add it in the place of old range.
        if (selectionRange) {
            // Check the range, convert it to live range, bind events, etc.
            this._pushRange(selectionRange);
        }
        // If nearest valid selection range cannot be found don't add any range. Selection will be set to the default range.
    }
}
/**
 * Helper function for {@link module:engine/model/liveselection~LiveSelection#_updateAttributes}.
 *
 * It checks if the passed model item is a text node (or text proxy) and, if so, returns it's attributes.
 * If not, it checks if item is an inline object and does the same. Otherwise it returns `null`.
 */
function getTextAttributes(node, schema) {
    if (!node) {
        return null;
    }
    if (node instanceof ModelTextProxy || node instanceof ModelText) {
        return node.getAttributes();
    }
    if (!schema.isInline(node)) {
        return null;
    }
    // Stop on inline elements (such as `<softBreak>`) that are not objects (such as `<imageInline>` or `<mathml>`).
    if (!schema.isObject(node)) {
        return [];
    }
    const attributes = [];
    // Collect all attributes that can be applied to the text node.
    for (const [key, value] of node.getAttributes()) {
        if (schema.checkAttribute('$text', key) &&
            schema.getAttributeProperties(key).copyFromObject !== false) {
            attributes.push([key, value]);
        }
    }
    return attributes;
}
/**
 * Removes selection attributes from element which is not empty anymore.
 */
function clearAttributesStoredInElement(model, batch) {
    const differ = model.document.differ;
    for (const entry of differ.getChanges()) {
        if (entry.type != 'insert') {
            continue;
        }
        const changeParent = entry.position.parent;
        const isNoLongerEmpty = entry.length === changeParent.maxOffset;
        if (isNoLongerEmpty) {
            model.enqueueChange(batch, writer => {
                const storedAttributes = Array.from(changeParent.getAttributeKeys())
                    .filter(key => key.startsWith(storePrefix));
                for (const key of storedAttributes) {
                    writer.removeAttribute(key, changeParent);
                }
            });
        }
    }
}

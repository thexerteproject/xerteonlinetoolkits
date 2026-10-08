/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/liverange
 */
import { ModelRange } from './range.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelElement } from './element.js';
import { type ModelItem } from './item.js';
import { type ModelPosition } from './position.js';
declare const ModelLiveRange_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ModelRange, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * `ModelLiveRange` is a type of {@link module:engine/model/range~ModelRange Range}
 * that updates itself as {@link module:engine/model/document~ModelDocument document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Be very careful when dealing with `ModelLiveRange`. Each `ModelLiveRange` instance bind events that might
 * have to be unbound. Use {@link module:engine/model/liverange~ModelLiveRange#detach detach} whenever you don't need
 * `ModelLiveRange` anymore.
 */
export declare class ModelLiveRange extends /* #__PURE__ */ ModelLiveRange_base {
    /**
     * Creates a live range.
     *
     * @see module:engine/model/range~ModelRange
     */
    constructor(start: ModelPosition, end?: ModelPosition | null);
    /**
     * Unbinds all events previously bound by `ModelLiveRange`. Use it whenever you don't need `ModelLiveRange` instance
     * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
     * referring to it).
     */
    detach(): void;
    /**
     * Creates a {@link module:engine/model/range~ModelRange range instance} that is equal to this live range.
     */
    toRange(): ModelRange;
    /**
     * Creates a `ModelLiveRange` instance that is equal to the given range.
     */
    static fromRange(range: ModelRange): ModelLiveRange;
    /**
     * @see module:engine/model/range~ModelRange._createIn
     * @internal
     */
    static readonly _createIn: (element: ModelElement | ModelDocumentFragment) => ModelLiveRange;
    /**
     * @see module:engine/model/range~ModelRange._createOn
     * @internal
     */
    static readonly _createOn: (element: ModelItem | ModelDocumentFragment) => ModelLiveRange;
    /**
     * @see module:engine/model/range~ModelRange._createFromPositionAndShift
     * @internal
     */
    static readonly _createFromPositionAndShift: (position: ModelPosition, shift: number) => ModelLiveRange;
}
/**
 * Fired when `ModelLiveRange` instance boundaries have changed due to changes in the
 * {@link module:engine/model/document~ModelDocument document}.
 *
 * @eventName ~ModelLiveRange#change:range
 * @param oldRange Range with start and end position equal to start and end position of this live
 * range before it got changed.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Source position for remove and merge changes.
 * Available if the range was moved to the graveyard root, `null` otherwise.
 */
export type ModelLiveRangeChangeRangeEvent = {
    name: 'change' | 'change:range';
    args: [range: ModelRange, data: {
        deletionPosition: ModelPosition | null;
    }];
};
/**
 * Fired when `ModelLiveRange` instance boundaries have not changed after
 * a change in {@link module:engine/model/document~ModelDocument document}
 * but the change took place inside the range, effectively changing its content.
 *
 * @eventName ~ModelLiveRange#change:content
 * @param range Range with start and end position equal to start and end position of
 * change range.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Due to the nature of this event, this property is always set to `null`. It is passed
 * for compatibility with the {@link module:engine/model/liverange~ModelLiveRange#event:change:range} event.
 */
export type ModelLiveRangeChangeContentEvent = {
    name: 'change' | 'change:content';
    args: [range: ModelRange, data: {
        deletionPosition: null;
    }];
};
/**
 * Describes `change:range` or `change:content` event.
 *
 * @eventName ~ModelLiveRange#change
 */
export type ModelLiveRangeChangeEvent = {
    name: 'change' | 'change:range' | 'change:content';
    args: [range: ModelRange, data: {
        deletionPosition: ModelPosition | null;
    }];
};
export {};

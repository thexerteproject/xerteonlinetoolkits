/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ViewDowncastWriter, DowncastHighlightDescriptor } from '@ckeditor/ckeditor5-engine';
declare const WidgetHighlightStack_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Class used to handle the correct order of highlights on elements.
 *
 * When different highlights are applied to same element the correct order should be preserved:
 *
 * * highlight with highest priority should be applied,
 * * if two highlights have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor}.
 *
 * This way, highlight will be applied with the same rules it is applied on texts.
 */
export declare class WidgetHighlightStack extends /* #__PURE__ */ WidgetHighlightStack_base {
    private readonly _stack;
    /**
     * Adds highlight descriptor to the stack.
     *
     * @fires change:top
     */
    add(descriptor: DowncastHighlightDescriptor, writer: ViewDowncastWriter): void;
    /**
     * Removes highlight descriptor from the stack.
     *
     * @fires change:top
     * @param id Id of the descriptor to remove.
     */
    remove(id: string, writer: ViewDowncastWriter): void;
    /**
     * Inserts a given descriptor in correct place in the stack. It also takes care about updating information
     * when descriptor with same id is already present.
     */
    private _insertDescriptor;
    /**
     * Removes descriptor with given id from the stack.
     *
     * @param id Descriptor's id.
     */
    private _removeDescriptor;
}
/**
 * Fired when top element on {@link module:widget/highlightstack~WidgetHighlightStack} has been changed
 *
 * @eventName ~WidgetHighlightStack#change:top
 */
export type WidgetHighlightStackChangeEvent = {
    name: 'change' | 'change:top';
    args: [WidgetHighlightStackChangeEventData];
};
/**
 * Additional information about the change.
 */
export type WidgetHighlightStackChangeEventData = {
    /**
     * Old highlight descriptor. It will be `undefined` when first descriptor is added to the stack.
     */
    oldDescriptor: DowncastHighlightDescriptor;
    /**
     * New highlight descriptor. It will be `undefined` when last descriptor is removed from the stack.
     */
    newDescriptor: DowncastHighlightDescriptor;
    /**
     * View writer that can be used to modify element.
     */
    writer: ViewDowncastWriter;
};
export {};

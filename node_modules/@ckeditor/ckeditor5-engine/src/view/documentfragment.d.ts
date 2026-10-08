/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/documentfragment
 */
import { ViewTypeCheckable } from './typecheckable.js';
import type { ViewDocument, ViewDocumentChangeType } from './document.js';
import { type ViewItem } from './item.js';
import { type ViewNode } from './node.js';
declare const ViewDocumentFragment_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ViewTypeCheckable, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * Document fragment.
 *
 * To create a new document fragment instance use the
 * {@link module:engine/view/upcastwriter~ViewUpcastWriter#createDocumentFragment `ViewUpcastWriter#createDocumentFragment()`}
 * method.
 */
export declare class ViewDocumentFragment extends /* #__PURE__ */ ViewDocumentFragment_base implements Iterable<ViewNode> {
    /**
     * The document to which this document fragment belongs.
     */
    readonly document: ViewDocument;
    /**
     * Array of child nodes.
     */
    private readonly _children;
    /**
     * Map of custom properties.
     * Custom properties can be added to document fragment instance.
     */
    private readonly _customProperties;
    /**
     * Creates new DocumentFragment instance.
     *
     * @internal
     * @param document The document to which this document fragment belongs.
     * @param children A list of nodes to be inserted into the created document fragment.
     */
    constructor(document: ViewDocument, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Iterable interface.
     *
     * Iterates over nodes added to this document fragment.
     */
    [Symbol.iterator](): Iterator<ViewNode>;
    /**
     * Number of child nodes in this document fragment.
     */
    get childCount(): number;
    /**
     * Is `true` if there are no nodes inside this document fragment, `false` otherwise.
     */
    get isEmpty(): boolean;
    /**
     * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
     */
    get root(): this;
    /**
     * Artificial parent of `DocumentFragment`. Returns `null`. Added for compatibility reasons.
     */
    get parent(): null;
    /**
     * Artificial element name. Returns `undefined`. Added for compatibility reasons.
     */
    get name(): undefined;
    /**
     * Artificial element getFillerOffset. Returns `undefined`. Added for compatibility reasons.
     */
    get getFillerOffset(): undefined;
    /**
     * Returns the custom property value for the given key.
     */
    getCustomProperty(key: string | symbol): unknown;
    /**
     * Returns an iterator which iterates over this document fragment's custom properties.
     * Iterator provides `[ key, value ]` pairs for each stored property.
     */
    getCustomProperties(): Iterable<[string | symbol, unknown]>;
    /**
     * Converts `ViewDocumentFragment` instance to plain object and returns it.
     * Takes care of converting all of this document fragment's children.
     *
     * @returns `ViewDocumentFragment` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * {@link module:engine/view/documentfragment~ViewDocumentFragment#_insertChild Insert} a child node or a list of child nodes at the end
     * and sets the parent of these nodes to this fragment.
     *
     * @internal
     * @param items Items to be inserted.
     * @returns Number of appended nodes.
     */
    _appendChild(items: ViewItem | string | Iterable<ViewItem | string>): number;
    /**
     * Gets child at the given index.
     *
     * @param index Index of child.
     * @returns Child node.
     */
    getChild(index: number): ViewNode;
    /**
     * Gets index of the given child node. Returns `-1` if child node is not found.
     *
     * @param node Child node.
     * @returns Index of the child node.
     */
    getChildIndex(node: ViewNode): number;
    /**
     * Gets child nodes iterator.
     *
     * @returns Child nodes iterator.
     */
    getChildren(): IterableIterator<ViewNode>;
    /**
     * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
     * this fragment.
     *
     * @internal
     * @param index Position where nodes should be inserted.
     * @param items Items to be inserted.
     * @returns Number of inserted nodes.
     */
    _insertChild(index: number, items: ViewItem | string | Iterable<ViewItem | string>): number;
    /**
     * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
     *
     * @internal
     * @param index Number of the first node to remove.
     * @param howMany Number of nodes to remove.
     * @returns The array of removed nodes.
     */
    _removeChildren(index: number, howMany?: number): Array<ViewNode>;
    /**
     * @internal
     * @param type Type of the change.
     * @param node Changed node.
     * @param data Additional data.
     * @fires module:engine/view/node~ViewNode#event:change
     */
    _fireChange(type: ViewDocumentChangeType, node: ViewNode | ViewDocumentFragment, data?: {
        index: number;
    }): void;
    /**
     * Sets a custom property. They can be used to add special data to elements.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setCustomProperty
     * @internal
     */
    _setCustomProperty(key: string | symbol, value: unknown): void;
    /**
     * Removes the custom property stored under the given key.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeCustomProperty
     * @internal
     * @returns Returns true if property was removed.
     */
    _removeCustomProperty(key: string | symbol): boolean;
}
export {};

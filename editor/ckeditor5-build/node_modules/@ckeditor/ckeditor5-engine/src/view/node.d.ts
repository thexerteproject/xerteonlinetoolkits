/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/node
 */
import { ViewTypeCheckable } from './typecheckable.js';
import type { ViewDocument, ViewDocumentChangeType } from './document.js';
import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';
declare const ViewNode_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ViewTypeCheckable, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * Abstract view node class.
 *
 * This is an abstract class. Its constructor should not be used directly.
 * Use the {@link module:engine/view/downcastwriter~ViewDowncastWriter} or {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 * to create new instances of view nodes.
 */
export declare abstract class ViewNode extends /* #__PURE__ */ ViewNode_base {
    /**
     * The document instance to which this node belongs.
     */
    readonly document: ViewDocument;
    /**
     * Parent element. Null by default. Set by {@link module:engine/view/element~ViewElement#_insertChild}.
     */
    readonly parent: ViewElement | ViewDocumentFragment | null;
    /**
     * Creates a tree view node.
     *
     * @param document The document instance to which this node belongs.
     */
    protected constructor(document: ViewDocument);
    /**
     * Index of the node in the parent element or null if the node has no parent.
     *
     * Accessing this property throws an error if this node's parent element does not contain it.
     * This means that view tree got broken.
     */
    get index(): number | null;
    /**
     * Node's next sibling, or `null` if it is the last child.
     */
    get nextSibling(): ViewNode | null;
    /**
     * Node's previous sibling, or `null` if it is the first child.
     */
    get previousSibling(): ViewNode | null;
    /**
     * Top-most ancestor of the node. If the node has no parent it is the root itself.
     */
    get root(): ViewElement | ViewDocumentFragment;
    /**
     * Returns true if the node is in a tree rooted in the document (is a descendant of one of its roots).
     */
    isAttached(): boolean;
    /**
     * Gets a path to the node. The path is an array containing indices of consecutive ancestors of this node,
     * beginning from {@link module:engine/view/node~ViewNode#root root}, down to this node's index.
     *
     * ```ts
     * const abc = downcastWriter.createText( 'abc' );
     * const foo = downcastWriter.createText( 'foo' );
     * const h1 = downcastWriter.createElement( 'h1', null, downcastWriter.createText( 'header' ) );
     * const p = downcastWriter.createElement( 'p', null, [ abc, foo ] );
     * const div = downcastWriter.createElement( 'div', null, [ h1, p ] );
     * foo.getPath(); // Returns [ 1, 3 ]. `foo` is in `p` which is in `div`. `p` starts at offset 1, while `foo` at 3.
     * h1.getPath(); // Returns [ 0 ].
     * div.getPath(); // Returns [].
     * ```
     *
     * @returns The path.
     */
    getPath(): Array<number>;
    /**
     * Returns ancestors array of this node.
     *
     * @param options Options object.
     * @param options.includeSelf When set to `true` this node will be also included in parent's array.
     * @param options.parentFirst When set to `true`, array will be sorted from node's parent to root element,
     * otherwise root element will be the first item in the array.
     * @returns Array with ancestors.
     */
    getAncestors(options?: {
        includeSelf?: boolean;
        parentFirst?: boolean;
    }): Array<ViewNode | ViewDocumentFragment>;
    /**
     * Returns a {@link module:engine/view/element~ViewElement} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
     * which is a common ancestor of both nodes.
     *
     * @param node The second node.
     * @param options Options object.
     * @param options.includeSelf When set to `true` both nodes will be considered "ancestors" too.
     * Which means that if e.g. node A is inside B, then their common ancestor will be B.
     */
    getCommonAncestor(node: ViewNode, options?: {
        includeSelf?: boolean;
    }): ViewElement | ViewDocumentFragment | null;
    /**
     * Returns whether this node is before given node. `false` is returned if nodes are in different trees (for example,
     * in different {@link module:engine/view/documentfragment~ViewDocumentFragment}s).
     *
     * @param node Node to compare with.
     */
    isBefore(node: ViewNode): boolean;
    /**
     * Returns whether this node is after given node. `false` is returned if nodes are in different trees (for example,
     * in different {@link module:engine/view/documentfragment~ViewDocumentFragment}s).
     *
     * @param node Node to compare with.
     */
    isAfter(node: ViewNode): boolean;
    /**
     * Removes node from parent.
     *
     * @internal
     */
    _remove(): void;
    /**
     * @internal
     * @param type Type of the change.
     * @param node Changed node.
     * @param data Additional data.
     * @fires change
     */
    _fireChange(type: ViewDocumentChangeType, node: ViewNode, data?: {
        index: number;
    }): void;
    /**
     * Converts `ViewNode` to plain object and returns it.
     *
     * @returns `ViewNode` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Clones this node.
     *
     * @internal
     * @returns Clone of this node.
     */
    abstract _clone(deep?: boolean): ViewNode;
    /**
     * Checks if provided node is similar to this node.
     *
     * @returns True if nodes are similar.
     */
    abstract isSimilar(other: ViewNode): boolean;
}
/**
 * Fired when list of {@link module:engine/view/element~ViewElement elements} children, attributes or text changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * All change events as the first parameter receive the node that has changed (the node for which children, attributes or text changed).
 *
 * If `change:children` event is fired, there is an additional second parameter, which is an object with additional data related to change.
 *
 * @eventName ~ViewNode#change
 * @eventName ~ViewNode#change:children
 * @eventName ~ViewNode#change:attributes
 * @eventName ~ViewNode#change:text
 */
export type ViewNodeChangeEvent = {
    name: 'change' | `change:${ViewDocumentChangeType}`;
    args: [changedNode: ViewNode, data?: {
        index: number;
    }];
};
export {};

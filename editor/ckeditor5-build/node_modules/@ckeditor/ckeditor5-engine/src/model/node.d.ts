/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/node
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { type ModelDocument } from './document.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelElement } from './element.js';
/**
 * Model node. Most basic structure of model tree.
 *
 * This is an abstract class that is a base for other classes representing different nodes in model.
 *
 * **Note:** If a node is detached from the model tree, you can manipulate it using it's API.
 * However, it is **very important** that nodes already attached to model tree should be only changed through
 * {@link module:engine/model/writer~ModelWriter Writer API}.
 *
 * Changes done by `Node` methods, like {@link module:engine/model/element~ModelElement#_insertChild _insertChild} or
 * {@link module:engine/model/node~ModelNode#_setAttribute _setAttribute}
 * do not generate {@link module:engine/model/operation/operation~Operation operations}
 * which are essential for correct editor work if you modify nodes in {@link module:engine/model/document~ModelDocument document} root.
 *
 * The flow of working on `Node` (and classes that inherits from it) is as such:
 * 1. You can create a `Node` instance, modify it using it's API.
 * 2. Add `Node` to the model using `Batch` API.
 * 3. Change `Node` that was already added to the model using `Batch` API.
 *
 * Similarly, you cannot use `Batch` API on a node that has not been added to the model tree, with the exception
 * of {@link module:engine/model/writer~ModelWriter#insert inserting} that node to the model tree.
 *
 * Be aware that using {@link module:engine/model/writer~ModelWriter#remove remove from Batch API} does not allow to use `Node` API because
 * the information about `Node` is still kept in model document.
 *
 * In case of {@link module:engine/model/element~ModelElement element node}, adding and removing children also counts as changing a node and
 * follows same rules.
 */
export declare abstract class ModelNode extends ModelTypeCheckable {
    /**
     * Parent of this node. It could be {@link module:engine/model/element~ModelElement}
     * or {@link module:engine/model/documentfragment~ModelDocumentFragment}.
     * Equals to `null` if the node has no parent.
     */
    readonly parent: ModelElement | ModelDocumentFragment | null;
    /**
     * Unique root name used to identify this root element by {@link module:engine/model/document~ModelDocument}.
     */
    readonly rootName: string | undefined;
    /**
     * Attributes set on this node.
     */
    private _attrs;
    /**
     * Index of this node in its parent or `null` if the node has no parent.
     *
     * @internal
     */
    _index: number | null;
    /**
     * Offset at which this node starts in its parent or `null` if the node has no parent.
     *
     * @internal
     */
    _startOffset: number | null;
    /**
     * Creates a model node.
     *
     * This is an abstract class, so this constructor should not be used directly.
     *
     * @param attrs Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
     */
    constructor(attrs?: ModelNodeAttributes);
    /**
     * {@link module:engine/model/document~ModelDocument Document} that owns this root element.
     */
    get document(): ModelDocument | null;
    /**
     * Index of this node in its parent or `null` if the node has no parent.
     */
    get index(): number | null;
    /**
     * Offset at which this node starts in its parent. It is equal to the sum of {@link #offsetSize offsetSize}
     * of all its previous siblings. Equals to `null` if node has no parent.
     */
    get startOffset(): number | null;
    /**
     * Offset size of this node.
     *
     * Represents how much "offset space" is occupied by the node in its parent. It is important for
     * {@link module:engine/model/position~ModelPosition position}. When node has `offsetSize` greater
     * than `1`, position can be placed between that node start and end. `offsetSize` greater than `1` is for
     * nodes that represents more than one entity, i.e. a {@link module:engine/model/text~ModelText text node}.
     */
    get offsetSize(): number;
    /**
     * Offset at which this node ends in its parent. It is equal to the sum of this node's
     * {@link module:engine/model/node~ModelNode#startOffset start offset} and {@link #offsetSize offset size}.
     * Equals to `null` if the node has no parent.
     */
    get endOffset(): number | null;
    /**
     * Node's next sibling or `null` if the node is a last child of it's parent or if the node has no parent.
     */
    get nextSibling(): ModelNode | null;
    /**
     * Node's previous sibling or `null` if the node is a first child of it's parent or if the node has no parent.
     */
    get previousSibling(): ModelNode | null;
    /**
     * The top-most ancestor of the node. If node has no parent it is the root itself. If the node is a part
     * of {@link module:engine/model/documentfragment~ModelDocumentFragment}, it's `root` is equal to that `DocumentFragment`.
     */
    get root(): ModelNode | ModelDocumentFragment;
    /**
     * Returns `true` if the node is inside a document root that is attached to the document.
     */
    isAttached(): boolean;
    /**
     * Gets path to the node. The path is an array containing starting offsets of consecutive ancestors of this node,
     * beginning from {@link module:engine/model/node~ModelNode#root root}, down to this node's starting offset. The path can be used to
     * create {@link module:engine/model/position~ModelPosition Position} instance.
     *
     * ```ts
     * const abc = new Text( 'abc' );
     * const foo = new Text( 'foo' );
     * const h1 = new ModelElement( 'h1', null, new Text( 'header' ) );
     * const p = new ModelElement( 'p', null, [ abc, foo ] );
     * const div = new ModelElement( 'div', null, [ h1, p ] );
     * foo.getPath(); // Returns [ 1, 3 ]. `foo` is in `p` which is in `div`. `p` starts at offset 1, while `foo` at 3.
     * h1.getPath(); // Returns [ 0 ].
     * div.getPath(); // Returns [].
     * ```
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
    }): Array<ModelNode | ModelDocumentFragment>;
    /**
     * Returns a {@link module:engine/model/element~ModelElement} or {@link module:engine/model/documentfragment~ModelDocumentFragment}
     * which is a common ancestor of both nodes.
     *
     * @param node The second node.
     * @param options Options object.
     * @param options.includeSelf When set to `true` both nodes will be considered "ancestors" too.
     * Which means that if e.g. node A is inside B, then their common ancestor will be B.
     */
    getCommonAncestor(node: ModelNode, options?: {
        includeSelf?: boolean;
    }): ModelElement | ModelDocumentFragment | null;
    /**
     * Returns whether this node is before given node. `false` is returned if nodes are in different trees (for example,
     * in different {@link module:engine/model/documentfragment~ModelDocumentFragment}s).
     *
     * @param node Node to compare with.
     */
    isBefore(node: ModelNode): boolean;
    /**
     * Returns whether this node is after given node. `false` is returned if nodes are in different trees (for example,
     * in different {@link module:engine/model/documentfragment~ModelDocumentFragment}s).
     *
     * @param node Node to compare with.
     */
    isAfter(node: ModelNode): boolean;
    /**
     * Checks if the node has an attribute with given key.
     *
     * @param key Key of attribute to check.
     * @returns `true` if attribute with given key is set on node, `false` otherwise.
     */
    hasAttribute(key: string): boolean;
    /**
     * Gets an attribute value for given key or `undefined` if that attribute is not set on node.
     *
     * @param key Key of attribute to look for.
     * @returns Attribute value or `undefined`.
     */
    getAttribute(key: string): unknown;
    /**
     * Returns iterator that iterates over this node's attributes.
     *
     * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes(): IterableIterator<[string, unknown]>;
    /**
     * Returns iterator that iterates over this node's attribute keys.
     */
    getAttributeKeys(): IterableIterator<string>;
    /**
     * Converts `Node` to plain object and returns it.
     *
     * @returns `Node` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Creates a copy of this node, that is a node with exactly same attributes, and returns it.
     *
     * @internal
     * @returns Node with same attributes as this node.
     */
    _clone(_deep?: boolean): ModelNode;
    /**
     * Removes this node from its parent.
     *
     * @internal
     * @see module:engine/model/writer~ModelWriter#remove
     */
    _remove(): void;
    /**
     * Sets attribute on the node. If attribute with the same key already is set, it's value is overwritten.
     *
     * @see module:engine/model/writer~ModelWriter#setAttribute
     * @internal
     * @param key Key of attribute to set.
     * @param value Attribute value.
     */
    _setAttribute(key: string, value: unknown): void;
    /**
     * Removes all attributes from the node and sets given attributes.
     *
     * @see module:engine/model/writer~ModelWriter#setAttributes
     * @internal
     * @param attrs Attributes to set. See {@link module:utils/tomap~toMap} for a list of accepted values.
     */
    _setAttributesTo(attrs: ModelNodeAttributes): void;
    /**
     * Removes an attribute with given key from the node.
     *
     * @see module:engine/model/writer~ModelWriter#removeAttribute
     * @internal
     * @param key Key of attribute to remove.
     * @returns `true` if the attribute was set on the element, `false` otherwise.
     */
    _removeAttribute(key: string): boolean;
    /**
     * Removes all attributes from the node.
     *
     * @see module:engine/model/writer~ModelWriter#clearAttributes
     * @internal
     */
    _clearAttributes(): void;
}
/**
 * Represents a set of model node attributes, accepted as either a plain object
 * with string keys or an iterable of `[ key, value ]` pairs (e.g., a `Map`).
 *
 * See {@link module:utils/tomap~toMap} for more details and examples.
 */
export type ModelNodeAttributes = Record<string, unknown> | Iterable<[string, unknown]>;

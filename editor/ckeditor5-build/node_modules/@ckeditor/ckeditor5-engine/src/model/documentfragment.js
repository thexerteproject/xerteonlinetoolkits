/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/documentfragment
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { ModelElement } from './element.js';
import { ModelNodeList } from './nodelist.js';
import { ModelText } from './text.js';
import { ModelTextProxy } from './textproxy.js';
import { isIterable } from '@ckeditor/ckeditor5-utils';
// @if CK_DEBUG_ENGINE // const { stringifyMap } = require( '../dev-utils/utils' );
/**
 * ModelDocumentFragment represents a part of model which does not have a common root but its top-level nodes
 * can be seen as siblings. In other words, it is a detached part of model tree, without a root.
 *
 * ModelDocumentFragment has own {@link module:engine/model/markercollection~MarkerCollection}. Markers from this collection
 * will be set to the {@link module:engine/model/model~Model#markers model markers} by a
 * {@link module:engine/model/writer~ModelWriter#insert} function.
 */
export class ModelDocumentFragment extends ModelTypeCheckable {
    /**
     * ModelDocumentFragment static markers map. This is a list of names and {@link module:engine/model/range~ModelRange ranges}
     * which will be set as Markers to {@link module:engine/model/model~Model#markers model markers collection}
     * when ModelDocumentFragment will be inserted to the document.
     */
    markers = new Map();
    /**
     * List of nodes contained inside the document fragment.
     */
    _children = new ModelNodeList();
    /**
     * Creates an empty `ModelDocumentFragment`.
     *
     * **Note:** Constructor of this class shouldn't be used directly in the code.
     * Use the {@link module:engine/model/writer~ModelWriter#createDocumentFragment} method instead.
     *
     * @internal
     * @param children Nodes to be contained inside the `ModelDocumentFragment`.
     */
    constructor(children) {
        super();
        if (children) {
            this._insertChild(0, children);
        }
    }
    /**
     * Returns an iterator that iterates over all nodes contained inside this document fragment.
     */
    [Symbol.iterator]() {
        return this.getChildren();
    }
    /**
     * Number of this document fragment's children.
     */
    get childCount() {
        return this._children.length;
    }
    /**
     * Sum of {@link module:engine/model/node~ModelNode#offsetSize offset sizes} of all of this document fragment's children.
     */
    get maxOffset() {
        return this._children.maxOffset;
    }
    /**
     * Is `true` if there are no nodes inside this document fragment, `false` otherwise.
     */
    get isEmpty() {
        return this.childCount === 0;
    }
    /**
     * Artificial next sibling. Returns `null`. Added for compatibility reasons.
     */
    get nextSibling() {
        return null;
    }
    /**
     * Artificial previous sibling. Returns `null`. Added for compatibility reasons.
     */
    get previousSibling() {
        return null;
    }
    /**
     * Artificial root of `ModelDocumentFragment`. Returns itself. Added for compatibility reasons.
     */
    get root() {
        return this;
    }
    /**
     * Artificial parent of `ModelDocumentFragment`. Returns `null`. Added for compatibility reasons.
     */
    get parent() {
        return null;
    }
    /**
     * Artificial owner of `ModelDocumentFragment`. Returns `null`. Added for compatibility reasons.
     */
    get document() {
        return null;
    }
    /**
     * Returns `false` as `ModelDocumentFragment` by definition is not attached to a document. Added for compatibility reasons.
     */
    isAttached() {
        return false;
    }
    /**
     * Returns empty array. Added for compatibility reasons.
     */
    getAncestors() {
        return [];
    }
    /**
     * Gets the child at the given index. Returns `null` if incorrect index was passed.
     *
     * @param index Index in this document fragment.
     * @returns Child node.
     */
    getChild(index) {
        return this._children.getNode(index);
    }
    /**
     * Gets the child at the given offset. Returns `null` if incorrect index was passed.
     *
     * @param offset Offset in this document fragment.
     * @returns Child node.
     */
    getChildAtOffset(offset) {
        return this._children.getNodeAtOffset(offset);
    }
    /**
     * Returns an iterator that iterates over all of this document fragment's children.
     */
    getChildren() {
        return this._children[Symbol.iterator]();
    }
    /**
     * Returns an index of the given child node. Returns `null` if given node is not a child of this document fragment.
     *
     * @param node Child node to look for.
     * @returns Child node's index.
     */
    getChildIndex(node) {
        return this._children.getNodeIndex(node);
    }
    /**
     * Returns the starting offset of given child. Starting offset is equal to the sum of
     * {@link module:engine/model/node~ModelNode#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
     * given node is not a child of this document fragment.
     *
     * @param node Child node to look for.
     * @returns Child node's starting offset.
     */
    getChildStartOffset(node) {
        return this._children.getNodeStartOffset(node);
    }
    /**
     * Returns path to a `ModelDocumentFragment`, which is an empty array. Added for compatibility reasons.
     */
    getPath() {
        return [];
    }
    /**
     * Returns a descendant node by its path relative to this element.
     *
     * ```ts
     * // <this>a<b>c</b></this>
     * this.getNodeByPath( [ 0 ] );     // -> "a"
     * this.getNodeByPath( [ 1 ] );     // -> <b>
     * this.getNodeByPath( [ 1, 0 ] );  // -> "c"
     * ```
     *
     * @param relativePath Path of the node to find, relative to this element.
     */
    getNodeByPath(relativePath) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
        let node = this;
        for (const offset of relativePath) {
            node = node.getChildAtOffset(offset);
        }
        return node;
    }
    /**
     * Converts offset "position" to index "position".
     *
     * Returns index of a node that occupies given offset. If given offset is too low, returns `0`. If given offset is
     * too high, returns index after last child.
     *
     * ```ts
     * const textNode = new Text( 'foo' );
     * const pElement = new Element( 'p' );
     * const docFrag = new ModelDocumentFragment( [ textNode, pElement ] );
     * docFrag.offsetToIndex( -1 ); // Returns 0, because offset is too low.
     * docFrag.offsetToIndex( 0 ); // Returns 0, because offset 0 is taken by `textNode` which is at index 0.
     * docFrag.offsetToIndex( 1 ); // Returns 0, because `textNode` has `offsetSize` equal to 3, so it occupies offset 1 too.
     * docFrag.offsetToIndex( 2 ); // Returns 0.
     * docFrag.offsetToIndex( 3 ); // Returns 1.
     * docFrag.offsetToIndex( 4 ); // Returns 2. There are no nodes at offset 4, so last available index is returned.
     * ```
     *
     * @param offset Offset to look for.
     * @returns Index of a node that occupies given offset.
     */
    offsetToIndex(offset) {
        return this._children.offsetToIndex(offset);
    }
    /**
     * Converts `ModelDocumentFragment` instance to plain object and returns it.
     * Takes care of converting all of this document fragment's children.
     *
     * @returns `ModelDocumentFragment` instance converted to plain object.
     */
    toJSON() {
        const json = [];
        for (const node of this._children) {
            json.push(node.toJSON());
        }
        return json;
    }
    /**
     * Creates a `ModelDocumentFragment` instance from given plain object (i.e. parsed JSON string).
     * Converts `ModelDocumentFragment` children to proper nodes.
     *
     * @param json Plain object to be converted to `ModelDocumentFragment`.
     * @returns `ModelDocumentFragment` instance created using given plain object.
     */
    static fromJSON(json) {
        const children = [];
        for (const child of json) {
            if (child.name) {
                // If child has name property, it is an Element.
                children.push(ModelElement.fromJSON(child));
            }
            else {
                // Otherwise, it is a Text node.
                children.push(ModelText.fromJSON(child));
            }
        }
        return new ModelDocumentFragment(children);
    }
    /**
     * {@link #_insertChild Inserts} one or more nodes at the end of this document fragment.
     *
     * @internal
     * @param items Items to be inserted.
     */
    _appendChild(items) {
        this._insertChild(this.childCount, items);
    }
    /**
     * Inserts one or more nodes at the given index and sets {@link module:engine/model/node~ModelNode#parent parent} of these nodes
     * to this document fragment.
     *
     * @internal
     * @param index Index at which nodes should be inserted.
     * @param items Items to be inserted.
     */
    _insertChild(index, items) {
        const nodes = normalize(items);
        for (const node of nodes) {
            // If node that is being added to this element is already inside another element, first remove it from the old parent.
            if (node.parent !== null) {
                node._remove();
            }
            node.parent = this;
        }
        this._children._insertNodes(index, nodes);
    }
    /**
     * Removes one or more nodes starting at the given index
     * and sets {@link module:engine/model/node~ModelNode#parent parent} of these nodes to `null`.
     *
     * @internal
     * @param index Index of the first node to remove.
     * @param howMany Number of nodes to remove.
     * @returns Array containing removed nodes.
     */
    _removeChildren(index, howMany = 1) {
        const nodes = this._children._removeNodes(index, howMany);
        for (const node of nodes) {
            node.parent = null;
        }
        return nodes;
    }
    /**
     * Removes children nodes provided as an array and sets
     * the {@link module:engine/model/node~ModelNode#parent parent} of these nodes to `null`.
     *
     * These nodes do not need to be direct siblings.
     *
     * This method is faster than removing nodes one by one, as it recalculates offsets only once.
     *
     * @internal
     * @param nodes Array of nodes.
     */
    _removeChildrenArray(nodes) {
        this._children._removeNodesArray(nodes);
        for (const node of nodes) {
            node.parent = null;
        }
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelDocumentFragment.prototype.is = function (type) {
    return type === 'documentFragment' || type === 'model:documentFragment';
};
/**
 * Converts strings to Text and non-iterables to arrays.
 */
function normalize(nodes) {
    // Separate condition because string is iterable.
    if (typeof nodes == 'string') {
        return [new ModelText(nodes)];
    }
    if (!isIterable(nodes)) {
        nodes = [nodes];
    }
    // Array.from to enable .map() on non-arrays.
    return Array.from(nodes)
        .map(node => {
        if (typeof node == 'string') {
            return new ModelText(node);
        }
        if (node instanceof ModelTextProxy) {
            return new ModelText(node.data, node.getAttributes());
        }
        return node;
    });
}

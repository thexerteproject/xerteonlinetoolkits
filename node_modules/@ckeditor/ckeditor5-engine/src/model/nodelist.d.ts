/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/nodelist
 */
import { ModelNode } from './node.js';
/**
 * Provides an interface to operate on a list of {@link module:engine/model/node~ModelNode nodes}. `NodeList` is used internally
 * in classes like {@link module:engine/model/element~ModelElement Element}
 * or {@link module:engine/model/documentfragment~ModelDocumentFragment ModelDocumentFragment}.
 */
export declare class ModelNodeList implements Iterable<ModelNode> {
    /**
     * Nodes contained in this node list.
     */
    private _nodes;
    /**
     * This array maps numbers (offsets) to node that is placed at that offset.
     *
     * This array is similar to `_nodes` with the difference that one node may occupy multiple consecutive items in the array.
     *
     * This array is needed to quickly retrieve a node that is placed at given offset.
     */
    private _offsetToNode;
    /**
     * Creates a node list.
     *
     * @internal
     * @param nodes Nodes contained in this node list.
     */
    constructor(nodes?: Iterable<ModelNode>);
    /**
     * Iterable interface.
     *
     * Iterates over all nodes contained inside this node list.
     */
    [Symbol.iterator](): IterableIterator<ModelNode>;
    /**
     * Number of nodes contained inside this node list.
     */
    get length(): number;
    /**
     * Sum of {@link module:engine/model/node~ModelNode#offsetSize offset sizes} of all nodes contained inside this node list.
     */
    get maxOffset(): number;
    /**
     * Gets the node at the given index. Returns `null` if incorrect index was passed.
     */
    getNode(index: number): ModelNode | null;
    /**
     * Gets the node at the given offset. Returns `null` if incorrect offset was passed.
     */
    getNodeAtOffset(offset: number): ModelNode | null;
    /**
     * Returns an index of the given node or `null` if given node does not have a parent.
     *
     * This is an alias to {@link module:engine/model/node~ModelNode#index}.
     */
    getNodeIndex(node: ModelNode): number | null;
    /**
     * Returns the offset at which given node is placed in its parent or `null` if given node does not have a parent.
     *
     * This is an alias to {@link module:engine/model/node~ModelNode#startOffset}.
     */
    getNodeStartOffset(node: ModelNode): number | null;
    /**
     * Converts index to offset in node list.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `model-nodelist-index-out-of-bounds` if given index is less
     * than `0` or more than {@link #length}.
     */
    indexToOffset(index: number): number;
    /**
     * Converts offset in node list to index.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `model-nodelist-offset-out-of-bounds` if given offset is less
     * than `0` or more than {@link #maxOffset}.
     */
    offsetToIndex(offset: number): number;
    /**
     * Inserts given nodes at given index.
     *
     * @internal
     * @param index Index at which nodes should be inserted.
     * @param nodes Nodes to be inserted.
     */
    _insertNodes(index: number, nodes: Iterable<ModelNode>): void;
    /**
     * Removes one or more nodes starting at the given index.
     *
     * @internal
     * @param indexStart Index of the first node to remove.
     * @param howMany Number of nodes to remove.
     * @returns Array containing removed nodes.
     */
    _removeNodes(indexStart: number, howMany?: number): Array<ModelNode>;
    /**
     * Removes children nodes provided as an array. These nodes do not need to be direct siblings.
     *
     * This method is faster than removing nodes one by one, as it recalculates offsets only once.
     *
     * @internal
     * @param nodes Array of nodes.
     */
    _removeNodesArray(nodes: Array<ModelNode>): void;
    /**
     * Converts `NodeList` instance to an array containing nodes that were inserted in the node list. Nodes
     * are also converted to their plain object representation.
     *
     * @returns `NodeList` instance converted to `Array`.
     */
    toJSON(): unknown;
}

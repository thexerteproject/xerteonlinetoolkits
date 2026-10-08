/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/utils
 */
import { ModelNode } from '../node.js';
import { ModelRange } from '../range.js';
import { type ModelDocumentFragment } from '../documentfragment.js';
import { type ModelItem } from '../item.js';
import { type ModelNodeList } from '../nodelist.js';
import { type ModelPosition } from '../position.js';
/**
 * Inserts given nodes at given position.
 *
 * @internal
 * @param position Position at which nodes should be inserted.
 * @param nodes Nodes to insert.
 * @returns Range spanning over inserted elements.
 */
export declare function _insert(position: ModelPosition, nodes: ModelNodeSet): ModelRange;
/**
 * Removed nodes in given range. Only {@link module:engine/model/range~ModelRange#isFlat flat} ranges are accepted.
 *
 * @internal
 * @param range Range containing nodes to remove.
 */
export declare function _remove(this: any, range: ModelRange): Array<ModelNode>;
/**
 * Moves nodes in given range to given target position. Only {@link module:engine/model/range~ModelRange#isFlat flat} ranges are accepted.
 *
 * @internal
 * @param sourceRange Range containing nodes to move.
 * @param targetPosition Position to which nodes should be moved.
 * @returns Range containing moved nodes.
 */
export declare function _move(this: any, sourceRange: ModelRange, targetPosition: ModelPosition): ModelRange;
/**
 * Sets given attribute on nodes in given range. The attributes are only set on top-level nodes of the range, not on its children.
 *
 * @internal
 * @param range Range containing nodes that should have the attribute set. Must be a flat range.
 * @param key Key of attribute to set.
 * @param value Attribute value.
 */
export declare function _setAttribute(range: ModelRange, key: string, value: unknown): void;
/**
 * Normalizes given object or an array of objects to an array of {@link module:engine/model/node~ModelNode nodes}. See
 * {@link ~ModelNodeSet NodeSet} for details on how normalization is performed.
 *
 * @internal
 * @param nodes Objects to normalize.
 * @returns Normalized nodes.
 */
export declare function _normalizeNodes(nodes: ModelNodeSet): Array<ModelNode>;
/**
 * Value that can be normalized to an array of {@link module:engine/model/node~ModelNode nodes}.
 *
 * Non-arrays are normalized as follows:
 * * {@link module:engine/model/node~ModelNode Node} is left as is,
 * * {@link module:engine/model/textproxy~ModelTextProxy TextProxy} and `string` are normalized to
 * {@link module:engine/model/text~ModelText Text},
 * * {@link module:engine/model/nodelist~ModelNodeList NodeList} is normalized to an array containing all nodes that are in that node list,
 * * {@link module:engine/model/documentfragment~ModelDocumentFragment ModelDocumentFragment} is normalized to an array containing all of
 * it's children.
 *
 * Arrays are processed item by item like non-array values and flattened to one array. Normalization always results in
 * a flat array of {@link module:engine/model/node~ModelNode nodes}. Consecutive text nodes (or items normalized to text nodes) will be
 * merged if they have same attributes.
 */
export type ModelNodeSet = ModelItem | string | ModelNodeList | ModelDocumentFragment | Iterable<ModelItem | string | ModelNodeList | ModelDocumentFragment>;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/textproxy
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelElement } from './element.js';
import { type ModelNode } from './node.js';
import { type ModelText } from './text.js';
/**
 * `ModelTextProxy` represents a part of {@link module:engine/model/text~ModelText text node}.
 *
 * Since {@link module:engine/model/position~ModelPosition positions} can be placed between characters of a text node,
 * {@link module:engine/model/range~ModelRange ranges} may contain only parts of text nodes.
 * When {@link module:engine/model/range~ModelRange#getItems getting items}
 * contained in such range, we need to represent a part of that text node, since returning the whole text node would be incorrect.
 * `ModelTextProxy` solves this issue.
 *
 * `ModelTextProxy` has an API similar to {@link module:engine/model/text~ModelText Text} and allows to do
 * most of the common tasks performed on model nodes.
 *
 * **Note:** Some `ModelTextProxy` instances may represent whole text node, not just a part of it.
 * See {@link module:engine/model/textproxy~ModelTextProxy#isPartial}.
 *
 * **Note:** `ModelTextProxy` is not an instance of {@link module:engine/model/node~ModelNode node}. Keep this in mind when using it as a
 * parameter of methods.
 *
 * **Note:** `ModelTextProxy` is a readonly interface. If you want to perform changes on model data represented by a `ModelTextProxy`
 * use {@link module:engine/model/writer~ModelWriter model writer API}.
 *
 * **Note:** `ModelTextProxy` instances are created on the fly, basing on the current state of model. Because of this, it is
 * highly unrecommended to store references to `ModelTextProxy` instances. `ModelTextProxy` instances are not refreshed when
 * model changes, so they might get invalidated. Instead, consider creating {@link module:engine/model/liveposition~ModelLivePosition live
 * position}.
 *
 * `ModelTextProxy` instances are created by {@link module:engine/model/treewalker~ModelTreeWalker model tree walker}.
 * You should not need to create an instance of this class by your own.
 */
export declare class ModelTextProxy extends ModelTypeCheckable {
    /**
     * Text node which part is represented by this text proxy.
     */
    readonly textNode: ModelText;
    /**
     * Text data represented by this text proxy.
     */
    readonly data: string;
    /**
     * Offset in {@link module:engine/model/textproxy~ModelTextProxy#textNode text node} from which the text proxy starts.
     */
    readonly offsetInText: number;
    /**
     * Creates a text proxy.
     *
     * @internal
     * @param textNode Text node which part is represented by this text proxy.
     * @param offsetInText Offset in {@link module:engine/model/textproxy~ModelTextProxy#textNode text node} from which the text proxy
     * starts.
     * @param length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
     */
    constructor(textNode: ModelText, offsetInText: number, length: number);
    /**
     * Offset at which this text proxy starts in it's parent.
     *
     * @see module:engine/model/node~ModelNode#startOffset
     */
    get startOffset(): number | null;
    /**
     * Offset size of this text proxy. Equal to the number of characters represented by the text proxy.
     *
     * @see module:engine/model/node~ModelNode#offsetSize
     */
    get offsetSize(): number;
    /**
     * Offset at which this text proxy ends in it's parent.
     *
     * @see module:engine/model/node~ModelNode#endOffset
     */
    get endOffset(): number | null;
    /**
     * Flag indicating whether `ModelTextProxy` instance covers only part of the original
     * {@link module:engine/model/text~ModelText text node} (`true`) or the whole text node (`false`).
     *
     * This is `false` when text proxy starts at the very beginning of
     * {@link module:engine/model/textproxy~ModelTextProxy#textNode textNode}
     * ({@link module:engine/model/textproxy~ModelTextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
     * text node size.
     */
    get isPartial(): boolean;
    /**
     * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
     */
    get parent(): ModelElement | ModelDocumentFragment | null;
    /**
     * Root of this text proxy, which is same as root of text node represented by this text proxy.
     */
    get root(): ModelNode | ModelDocumentFragment;
    /**
     * Gets path to this text proxy.
     *
     * @see module:engine/model/node~ModelNode#getPath
     */
    getPath(): Array<number>;
    /**
     * Returns ancestors array of this text proxy.
     *
     * @param options Options object.
     * @param options.includeSelf When set to `true` this text proxy will be also included in parent's array.
     * @param options.parentFirst When set to `true`, array will be sorted from text proxy parent to root element,
     * otherwise root element will be the first item in the array.
     * @returns Array with ancestors.
     */
    getAncestors(options?: {
        includeSelf?: boolean;
        parentFirst?: boolean;
    }): Array<ModelTextProxy | ModelElement | ModelDocumentFragment>;
    /**
     * Checks if this text proxy has an attribute for given key.
     *
     * @param key Key of attribute to check.
     * @returns `true` if attribute with given key is set on text proxy, `false` otherwise.
     */
    hasAttribute(key: string): boolean;
    /**
     * Gets an attribute value for given key or `undefined` if that attribute is not set on text proxy.
     *
     * @param key Key of attribute to look for.
     * @returns Attribute value or `undefined`.
     */
    getAttribute(key: string): unknown;
    /**
     * Returns iterator that iterates over this node's attributes. Attributes are returned as arrays containing two
     * items. First one is attribute key and second is attribute value.
     *
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes(): IterableIterator<[string, unknown]>;
    /**
     * Returns iterator that iterates over this node's attribute keys.
     */
    getAttributeKeys(): IterableIterator<string>;
}

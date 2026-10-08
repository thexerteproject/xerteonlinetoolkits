/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/textproxy
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
// @if CK_DEBUG_ENGINE // const { convertMapToStringifiedObject } = require( '../dev-utils/utils' );
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
export class ModelTextProxy extends ModelTypeCheckable {
    /**
     * Text node which part is represented by this text proxy.
     */
    textNode;
    /**
     * Text data represented by this text proxy.
     */
    data;
    /**
     * Offset in {@link module:engine/model/textproxy~ModelTextProxy#textNode text node} from which the text proxy starts.
     */
    offsetInText;
    /**
     * Creates a text proxy.
     *
     * @internal
     * @param textNode Text node which part is represented by this text proxy.
     * @param offsetInText Offset in {@link module:engine/model/textproxy~ModelTextProxy#textNode text node} from which the text proxy
     * starts.
     * @param length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
     */
    constructor(textNode, offsetInText, length) {
        super();
        this.textNode = textNode;
        if (offsetInText < 0 || offsetInText > textNode.offsetSize) {
            /**
             * Given `offsetInText` value is incorrect.
             *
             * @error model-textproxy-wrong-offsetintext
             */
            throw new CKEditorError('model-textproxy-wrong-offsetintext', this);
        }
        if (length < 0 || offsetInText + length > textNode.offsetSize) {
            /**
             * Given `length` value is incorrect.
             *
             * @error model-textproxy-wrong-length
             */
            throw new CKEditorError('model-textproxy-wrong-length', this);
        }
        this.data = textNode.data.substring(offsetInText, offsetInText + length);
        this.offsetInText = offsetInText;
    }
    /**
     * Offset at which this text proxy starts in it's parent.
     *
     * @see module:engine/model/node~ModelNode#startOffset
     */
    get startOffset() {
        return this.textNode.startOffset !== null ? this.textNode.startOffset + this.offsetInText : null;
    }
    /**
     * Offset size of this text proxy. Equal to the number of characters represented by the text proxy.
     *
     * @see module:engine/model/node~ModelNode#offsetSize
     */
    get offsetSize() {
        return this.data.length;
    }
    /**
     * Offset at which this text proxy ends in it's parent.
     *
     * @see module:engine/model/node~ModelNode#endOffset
     */
    get endOffset() {
        return this.startOffset !== null ? this.startOffset + this.offsetSize : null;
    }
    /**
     * Flag indicating whether `ModelTextProxy` instance covers only part of the original
     * {@link module:engine/model/text~ModelText text node} (`true`) or the whole text node (`false`).
     *
     * This is `false` when text proxy starts at the very beginning of
     * {@link module:engine/model/textproxy~ModelTextProxy#textNode textNode}
     * ({@link module:engine/model/textproxy~ModelTextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
     * text node size.
     */
    get isPartial() {
        return this.offsetSize !== this.textNode.offsetSize;
    }
    /**
     * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
     */
    get parent() {
        return this.textNode.parent;
    }
    /**
     * Root of this text proxy, which is same as root of text node represented by this text proxy.
     */
    get root() {
        return this.textNode.root;
    }
    /**
     * Gets path to this text proxy.
     *
     * @see module:engine/model/node~ModelNode#getPath
     */
    getPath() {
        const path = this.textNode.getPath();
        if (path.length > 0) {
            path[path.length - 1] += this.offsetInText;
        }
        return path;
    }
    /**
     * Returns ancestors array of this text proxy.
     *
     * @param options Options object.
     * @param options.includeSelf When set to `true` this text proxy will be also included in parent's array.
     * @param options.parentFirst When set to `true`, array will be sorted from text proxy parent to root element,
     * otherwise root element will be the first item in the array.
     * @returns Array with ancestors.
     */
    getAncestors(options = {}) {
        const ancestors = [];
        let parent = options.includeSelf ? this : this.parent;
        while (parent) {
            ancestors[options.parentFirst ? 'push' : 'unshift'](parent);
            parent = parent.parent;
        }
        return ancestors;
    }
    /**
     * Checks if this text proxy has an attribute for given key.
     *
     * @param key Key of attribute to check.
     * @returns `true` if attribute with given key is set on text proxy, `false` otherwise.
     */
    hasAttribute(key) {
        return this.textNode.hasAttribute(key);
    }
    /**
     * Gets an attribute value for given key or `undefined` if that attribute is not set on text proxy.
     *
     * @param key Key of attribute to look for.
     * @returns Attribute value or `undefined`.
     */
    getAttribute(key) {
        return this.textNode.getAttribute(key);
    }
    /**
     * Returns iterator that iterates over this node's attributes. Attributes are returned as arrays containing two
     * items. First one is attribute key and second is attribute value.
     *
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes() {
        return this.textNode.getAttributes();
    }
    /**
     * Returns iterator that iterates over this node's attribute keys.
     */
    getAttributeKeys() {
        return this.textNode.getAttributeKeys();
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelTextProxy.prototype.is = function (type) {
    return type === '$textProxy' || type === 'model:$textProxy' ||
        // This are legacy values kept for backward compatibility.
        type === 'textProxy' || type === 'model:textProxy';
};

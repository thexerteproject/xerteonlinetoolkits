/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/text
 */
import { ModelNode } from './node.js';
// @if CK_DEBUG_ENGINE // const { convertMapToStringifiedObject } = require( '../dev-utils/utils' );
/**
 * Model text node. Type of {@link module:engine/model/node~ModelNode node} that
 * contains {@link module:engine/model/text~ModelText#data text data}.
 *
 * **Important:** see {@link module:engine/model/node~ModelNode} to read about restrictions using `Text` and `Node` API.
 *
 * **Note:** keep in mind that `Text` instances might indirectly got removed from model tree when model is changed.
 * This happens when {@link module:engine/model/writer~ModelWriter model writer} is used to change model and the text node is merged with
 * another text node. Then, both text nodes are removed and a new text node is inserted into the model. Because of
 * this behavior, keeping references to `Text` is not recommended. Instead, consider creating
 * {@link module:engine/model/liveposition~ModelLivePosition live position} placed before the text node.
 */
export class ModelText extends ModelNode {
    /**
     * Text data contained in this text node.
     *
     * @internal
     */
    _data;
    /**
     * Creates a text node.
     *
     * **Note:** Constructor of this class shouldn't be used directly in the code.
     * Use the {@link module:engine/model/writer~ModelWriter#createText} method instead.
     *
     * @internal
     * @param data Node's text.
     * @param attrs Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
     */
    constructor(data, attrs) {
        super(attrs);
        this._data = data || '';
    }
    /**
     * @inheritDoc
     */
    get offsetSize() {
        return this.data.length;
    }
    /**
     * Returns a text data contained in the node.
     */
    get data() {
        return this._data;
    }
    /**
     * Converts `Text` instance to plain object and returns it.
     *
     * @returns`Text` instance converted to plain object.
     */
    toJSON() {
        const json = super.toJSON();
        json.data = this.data;
        return json;
    }
    /**
     * Creates a copy of this text node and returns it. Created text node has same text data and attributes as original text node.
     *
     * @internal
     * @returns `Text` instance created using given plain object.
     */
    _clone() {
        return new ModelText(this.data, this.getAttributes());
    }
    /**
     * Creates a `Text` instance from given plain object (i.e. parsed JSON string).
     *
     * @param json Plain object to be converted to `Text`.
     * @returns `Text` instance created using given plain object.
     */
    static fromJSON(json) {
        return new ModelText(json.data, json.attributes);
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelText.prototype.is = function (type) {
    return type === '$text' || type === 'model:$text' ||
        // This are legacy values kept for backward compatibility.
        type === 'text' || type === 'model:text' ||
        // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
        type === 'node' || type === 'model:node';
};

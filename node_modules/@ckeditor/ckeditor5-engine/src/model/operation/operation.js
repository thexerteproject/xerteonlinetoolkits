/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Abstract base operation class.
 */
export class Operation {
    /**
     * {@link module:engine/model/document~ModelDocument#version} on which operation can be applied. If you try to
     * {@link module:engine/model/model~Model#applyOperation apply} operation with different base version than the
     * {@link module:engine/model/document~ModelDocument#version document version} the
     * {@link module:utils/ckeditorerror~CKEditorError model-document-applyOperation-wrong-version} error is thrown.
     */
    baseVersion;
    /**
     * Defines whether operation is executed on attached or detached {@link module:engine/model/item~ModelItem items}.
     */
    isDocumentOperation;
    /**
     * {@link module:engine/model/batch~Batch Batch} to which the operation is added or `null` if the operation is not
     * added to any batch yet.
     *
     * Note, that a {@link #isDocumentOperation non-document operation} has this property always set to `null`, and is never added
     * to any batch.
     */
    batch;
    /**
     * Base operation constructor.
     *
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(baseVersion) {
        this.baseVersion = baseVersion;
        this.isDocumentOperation = this.baseVersion !== null;
        this.batch = null;
    }
    /**
     * Checks whether the operation's parameters are correct and the operation can be correctly executed. Throws
     * an error if operation is not valid.
     *
     * @internal
     */
    _validate() {
    }
    /**
     * Custom toJSON method to solve child-parent circular dependencies.
     *
     * @returns Clone of this object with the operation property replaced with string.
     */
    toJSON() {
        // This method creates only a shallow copy, all nested objects should be defined separately.
        // See https://github.com/ckeditor/ckeditor5-engine/issues/1477.
        const json = Object.assign({}, this);
        json.__className = this.constructor.className;
        // Remove reference to the parent `Batch` to avoid circular dependencies.
        delete json.batch;
        // This can be derived from `baseVersion` so we can remove it.
        delete json.isDocumentOperation;
        return json;
    }
    /**
     * Name of the operation class used for serialization.
     */
    static get className() {
        return 'Operation';
    }
    /**
     * Creates `Operation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        return new this(json.baseVersion);
    }
}

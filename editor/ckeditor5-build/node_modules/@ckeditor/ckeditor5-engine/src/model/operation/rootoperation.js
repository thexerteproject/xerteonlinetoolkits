/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/rootoperation
 */
import { Operation } from './operation.js';
/**
 * Operation that creates (or attaches) or detaches a root element.
 */
export class RootOperation extends Operation {
    /**
     * Root name to create or detach.
     */
    rootName;
    /**
     * Root element name.
     */
    elementName;
    /**
     * Specifies whether the operation adds (`true`) or detaches the root (`false`).
     */
    isAdd;
    /**
     * Document which owns the root.
     */
    _document;
    /**
     * Creates an operation that creates or removes a root element.
     *
     * @param rootName Root name to create or detach.
     * @param elementName Root element name.
     * @param isAdd Specifies whether the operation adds (`true`) or detaches the root (`false`).
     * @param document Document which owns the root.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation can be applied.
     */
    constructor(rootName, elementName, isAdd, document, baseVersion) {
        super(baseVersion);
        this.rootName = rootName;
        this.elementName = elementName;
        this.isAdd = isAdd;
        this._document = document;
        // Make sure that the root exists ASAP, this is important for RTC.
        // If the root was dynamically added, there will be more operations that operate on/in this root.
        // These operations will require root element instance (in operation property or in position instance).
        // If the root is not created ahead of time, instantiating such operations may fail.
        if (!this._document.getRoot(this.rootName)) {
            const root = this._document.createRoot(this.elementName, this.rootName);
            root._isAttached = false;
        }
    }
    /**
     * @inheritDoc
     */
    get type() {
        return this.isAdd ? 'addRoot' : 'detachRoot';
    }
    /**
     * @inheritDoc
     */
    get affectedSelectable() {
        return this._document.getRoot(this.rootName);
    }
    /**
     * @inheritDoc
     */
    clone() {
        return new RootOperation(this.rootName, this.elementName, this.isAdd, this._document, this.baseVersion);
    }
    /**
     * @inheritDoc
     */
    getReversed() {
        return new RootOperation(this.rootName, this.elementName, !this.isAdd, this._document, this.baseVersion + 1);
    }
    /**
     * @inheritDoc
     */
    _execute() {
        this._document.getRoot(this.rootName)._isAttached = this.isAdd;
    }
    /**
     * @inheritDoc
     */
    toJSON() {
        const json = super.toJSON();
        delete json._document;
        return json;
    }
    /**
     * @inheritDoc
     */
    static get className() {
        return 'RootOperation';
    }
    /**
     * Creates `RootOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        return new RootOperation(json.rootName, json.elementName, json.isAdd, document, json.baseVersion);
    }
}

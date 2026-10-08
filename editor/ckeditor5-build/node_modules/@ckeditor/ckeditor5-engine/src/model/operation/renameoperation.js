/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/renameoperation
 */
import { Operation } from './operation.js';
import { ModelElement } from '../element.js';
import { ModelPosition } from '../position.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
/**
 * Operation to change element's name.
 *
 * Using this class you can change element's name.
 */
export class RenameOperation extends Operation {
    /**
     * Position before an element to change.
     */
    position;
    /**
     * Current name of the element.
     */
    oldName;
    /**
     * New name for the element.
     */
    newName;
    /**
     * Creates an operation that changes element's name.
     *
     * @param position Position before an element to change.
     * @param oldName Current name of the element.
     * @param newName New name for the element.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(position, oldName, newName, baseVersion) {
        super(baseVersion);
        this.position = position;
        // This position sticks to the next node because it is a position before the node that we want to change.
        this.position.stickiness = 'toNext';
        this.oldName = oldName;
        this.newName = newName;
    }
    /**
     * @inheritDoc
     */
    get type() {
        return 'rename';
    }
    /**
     * @inheritDoc
     */
    get affectedSelectable() {
        return this.position.nodeAfter;
    }
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     *
     * @returns Clone of this operation.
     */
    clone() {
        return new RenameOperation(this.position.clone(), this.oldName, this.newName, this.baseVersion);
    }
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed() {
        return new RenameOperation(this.position.clone(), this.newName, this.oldName, this.baseVersion + 1);
    }
    /**
     * @inheritDoc
     * @internal
     */
    _validate() {
        const element = this.position.nodeAfter;
        if (!(element instanceof ModelElement)) {
            /**
             * Given position is invalid or node after it is not instance of Element.
             *
             * @error rename-operation-wrong-position
             */
            throw new CKEditorError('rename-operation-wrong-position', this);
        }
        else if (this.oldName !== '' && element.name !== this.oldName) {
            /**
             * Element to change has different name than operation's old name.
             *
             * @error rename-operation-wrong-name
             */
            throw new CKEditorError('rename-operation-wrong-name', this);
        }
        this.oldName = element.name;
    }
    /**
     * @inheritDoc
     * @internal
     */
    _execute() {
        const element = this.position.nodeAfter;
        element.name = this.newName;
    }
    /**
     * @inheritDoc
     */
    toJSON() {
        const json = super.toJSON();
        json.position = this.position.toJSON();
        return json;
    }
    /**
     * @inheritDoc
     */
    static get className() {
        return 'RenameOperation';
    }
    /**
     * Creates `RenameOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        return new RenameOperation(ModelPosition.fromJSON(json.position, document), json.oldName, json.newName, json.baseVersion);
    }
}

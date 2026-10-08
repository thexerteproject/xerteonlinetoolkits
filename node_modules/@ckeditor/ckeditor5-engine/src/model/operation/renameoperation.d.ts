/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/renameoperation
 */
import { Operation } from './operation.js';
import { ModelPosition } from '../position.js';
import { type ModelDocument } from '../document.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation to change element's name.
 *
 * Using this class you can change element's name.
 */
export declare class RenameOperation extends Operation {
    /**
     * Position before an element to change.
     */
    position: ModelPosition;
    /**
     * Current name of the element.
     */
    oldName: string;
    /**
     * New name for the element.
     */
    newName: string;
    /**
     * Creates an operation that changes element's name.
     *
     * @param position Position before an element to change.
     * @param oldName Current name of the element.
     * @param newName New name for the element.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(position: ModelPosition, oldName: string, newName: string, baseVersion: number | null);
    /**
     * @inheritDoc
     */
    get type(): 'rename';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     *
     * @returns Clone of this operation.
     */
    clone(): RenameOperation;
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed(): Operation;
    /**
     * @inheritDoc
     * @internal
     */
    _validate(): void;
    /**
     * @inheritDoc
     * @internal
     */
    _execute(): void;
    /**
     * @inheritDoc
     */
    toJSON(): unknown;
    /**
     * @inheritDoc
     */
    static get className(): string;
    /**
     * Creates `RenameOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): RenameOperation;
}

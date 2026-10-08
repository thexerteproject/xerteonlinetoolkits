/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/rootattributeoperation
 */
import { Operation } from './operation.js';
import { type ModelDocument } from '../document.js';
import { type ModelRootElement } from '../rootelement.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation to change root element's attribute. Using this class you can add, remove or change value of the attribute.
 *
 * This operation is needed, because root elements can't be changed through
 * {@link module:engine/model/operation/attributeoperation~AttributeOperation}.
 * It is because {@link module:engine/model/operation/attributeoperation~AttributeOperation}
 * requires a range to change and root element can't
 * be a part of range because every {@link module:engine/model/position~ModelPosition} has to be inside a root.
 * {@link module:engine/model/position~ModelPosition} can't be created before a root element.
 */
export declare class RootAttributeOperation extends Operation {
    /**
     * Root element to change.
     */
    readonly root: ModelRootElement;
    /**
     * Key of an attribute to change or remove.
     */
    readonly key: string;
    /**
     * Old value of the attribute with given key or `null`, if attribute was not set before.
     *
     * @readonly
     */
    oldValue: unknown;
    /**
     * New value of the attribute with given key or `null`, if operation should remove attribute.
     *
     * @readonly
     */
    newValue: unknown;
    /**
     * Creates an operation that changes, removes or adds attributes on root element.
     *
     * @see module:engine/model/operation/attributeoperation~AttributeOperation
     * @param root Root element to change.
     * @param key Key of an attribute to change or remove.
     * @param oldValue Old value of the attribute with given key or `null`, if attribute was not set before.
     * @param newValue New value of the attribute with given key or `null`, if operation should remove attribute.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(root: ModelRootElement, key: string, oldValue: unknown, newValue: unknown, baseVersion: number | null);
    /**
     * @inheritDoc
     */
    get type(): 'addRootAttribute' | 'removeRootAttribute' | 'changeRootAttribute';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     *
     * @returns Clone of this operation.
     */
    clone(): RootAttributeOperation;
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
     * Creates `RootAttributeOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): RootAttributeOperation;
}

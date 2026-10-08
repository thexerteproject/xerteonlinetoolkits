/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/attributeoperation
 */
import { Operation } from './operation.js';
import { ModelRange } from '../range.js';
import { type ModelDocument } from '../document.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation to change nodes' attribute.
 *
 * Using this class you can add, remove or change value of the attribute.
 */
export declare class AttributeOperation extends Operation {
    /**
     * Range on which operation should be applied.
     *
     * @readonly
     */
    range: ModelRange;
    /**
     * Key of an attribute to change or remove.
     *
     * @readonly
     */
    key: string;
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
     * Creates an operation that changes, removes or adds attributes.
     *
     * If only `newValue` is set, attribute will be added on a node. Note that all nodes in operation's range must not
     * have an attribute with the same key as the added attribute.
     *
     * If only `oldValue` is set, then attribute with given key will be removed. Note that all nodes in operation's range
     * must have an attribute with that key added.
     *
     * If both `newValue` and `oldValue` are set, then the operation will change the attribute value. Note that all nodes in
     * operation's ranges must already have an attribute with given key and `oldValue` as value
     *
     * @param range Range on which the operation should be applied. Must be a flat range.
     * @param key Key of an attribute to change or remove.
     * @param oldValue Old value of the attribute with given key or `null`, if attribute was not set before.
     * @param newValue New value of the attribute with given key or `null`, if operation should remove attribute.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(range: ModelRange, key: string, oldValue: unknown, newValue: unknown, baseVersion: number | null);
    /**
     * @inheritDoc
     */
    get type(): 'addAttribute' | 'removeAttribute' | 'changeAttribute';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone(): AttributeOperation;
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed(): Operation;
    /**
     * @inheritDoc
     */
    toJSON(): unknown;
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
    static get className(): string;
    /**
     * Creates `AttributeOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): AttributeOperation;
}

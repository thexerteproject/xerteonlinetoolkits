/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Operation } from './operation.js';
import { type ModelDocument } from '../document.js';
/**
 * A factory class for creating operations.
 */
export declare abstract class OperationFactory {
    /**
     * Creates an operation instance from a JSON object (parsed JSON string).
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): Operation;
}

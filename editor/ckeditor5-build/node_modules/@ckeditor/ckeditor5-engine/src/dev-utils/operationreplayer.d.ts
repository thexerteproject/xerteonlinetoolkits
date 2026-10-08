/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Model } from '../model/model.js';
import { type Operation } from '../model/operation/operation.js';
/**
 * Operation replayer is a development tool created for easy replaying of operations on the document from stringified operations.
 *
 * @internal
 */
export declare class OperationReplayer {
    private _model;
    private _logSeparator;
    private _operationsToReplay;
    /**
     * @param model Data model.
     * @param logSeparator Separator between operations.
     * @param stringifiedOperations Operations to replay.
     */
    constructor(model: Model, logSeparator: string, stringifiedOperations: string);
    /**
     * Parses the given string containing stringified operations and sets parsed operations as operations to replay.
     *
     * @param stringifiedOperations Stringified operations to replay.
     */
    setStringifiedOperations(stringifiedOperations: string): void;
    /**
     * Returns operations to replay.
     */
    getOperationsToReplay(): Array<Operation>;
    /**
     * Applies all operations with a delay between actions.
     *
     * @param timeInterval Time between applying operations.
     */
    play(timeInterval?: number): Promise<void>;
    /**
     * Applies `numberOfOperations` operations, beginning after the last applied operation (or first, if no operations were applied).
     *
     * @param numberOfOperations The number of operations to apply.
     */
    applyOperations(numberOfOperations: number): Promise<void> | undefined;
    /**
     * Applies all operations to replay at once.
     */
    applyAllOperations(): Promise<void>;
    /**
     * Applies the next operation to replay. Returns a promise with the `isFinished` parameter that is `true` if the last
     * operation in the replayer has been applied, `false` otherwise.
     */
    applyNextOperation(): Promise<boolean>;
}

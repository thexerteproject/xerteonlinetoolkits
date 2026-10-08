/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Operation } from './operation/operation.js';
/**
 * @module engine/model/history
 */
/**
 * `History` keeps the track of all the operations applied to the {@link module:engine/model/document~ModelDocument document}.
 */
export declare class History {
    /**
     * Operations added to the history.
     */
    private _operations;
    /**
     * Holds an information which {@link module:engine/model/operation/operation~Operation operation} undoes which
     * {@link module:engine/model/operation/operation~Operation operation}.
     *
     * Keys of the map are "undoing operations", that is operations that undone some other operations. For each key, the
     * value is an operation that has been undone by the "undoing operation".
     */
    private _undoPairs;
    /**
     * Holds all undone operations.
     */
    private _undoneOperations;
    /**
     * A map that allows retrieving the operations fast based on the given base version.
     */
    private _baseVersionToOperationIndex;
    /**
     * The history version.
     */
    private _version;
    /**
     * The gap pairs kept in the <from,to> format.
     *
     * Anytime the `history.version` is set to a version larger than `history.version + 1`,
     * a new <lastHistoryVersion, newHistoryVersion> entry is added to the map.
     */
    private _gaps;
    /**
     * The version of the last operation in the history.
     *
     * The history version is incremented automatically when a new operation is added to the history.
     * Setting the version manually should be done only in rare circumstances when a gap is planned
     * between history versions. When doing so, a gap will be created and the history will accept adding
     * an operation with base version equal to the new history version.
     */
    get version(): number;
    set version(version: number);
    /**
     * The last history operation.
     */
    get lastOperation(): Operation | undefined;
    /**
     * Adds an operation to the history and increments the history version.
     *
     * The operation's base version should be equal to the history version. Otherwise an error is thrown.
     */
    addOperation(operation: Operation): void;
    /**
     * Returns operations from the given range of operation base versions that were added to the history.
     *
     * Note that there may be gaps in operations base versions.
     *
     * @param fromBaseVersion Base version from which operations should be returned (inclusive).
     * @param toBaseVersion Base version up to which operations should be returned (exclusive).
     * @returns History operations for the given range, in chronological order.
     */
    getOperations(fromBaseVersion?: number, toBaseVersion?: number): Array<Operation>;
    /**
     * Returns operation from the history that bases on given `baseVersion`.
     *
     * @param baseVersion Base version of the operation to get.
     * @returns Operation with given base version or `undefined` if there is no such operation in history.
     */
    getOperation(baseVersion: number): Operation | undefined;
    /**
     * Marks in history that one operation is an operation that is undoing the other operation. By marking operation this way,
     * history is keeping more context information about operations, which helps in operational transformation.
     *
     * @param undoneOperation Operation which is undone by `undoingOperation`.
     * @param undoingOperation Operation which undoes `undoneOperation`.
     */
    setOperationAsUndone(undoneOperation: Operation, undoingOperation: Operation): void;
    /**
     * Checks whether given `operation` is undoing any other operation.
     *
     * @param operation Operation to check.
     * @returns `true` if given `operation` is undoing any other operation, `false` otherwise.
     */
    isUndoingOperation(operation: Operation): boolean;
    /**
     * Checks whether given `operation` has been undone by any other operation.
     *
     * @param operation Operation to check.
     * @returns `true` if given `operation` has been undone any other operation, `false` otherwise.
     */
    isUndoneOperation(operation: Operation): boolean;
    /**
     * For given `undoingOperation`, returns the operation which has been undone by it.
     *
     * @returns Operation that has been undone by given `undoingOperation` or `undefined`
     * if given `undoingOperation` is not undoing any other operation.
     */
    getUndoneOperation(undoingOperation: Operation): Operation | undefined;
    /**
     * Resets the history of operations.
     */
    reset(): void;
}

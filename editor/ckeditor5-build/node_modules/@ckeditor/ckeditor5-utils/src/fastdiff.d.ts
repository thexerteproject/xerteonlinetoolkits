/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { DiffResult } from './diff.js';
import type { Change } from './difftochanges.js';
/**
 * @module utils/fastdiff
 */
/**
 * Finds positions of the first and last change in the given string/array and generates a set of changes:
 *
 * ```ts
 * fastDiff( '12a', '12xyza' );
 * // [ { index: 2, type: 'insert', values: [ 'x', 'y', 'z' ] } ]
 *
 * fastDiff( '12a', '12aa' );
 * // [ { index: 3, type: 'insert', values: [ 'a' ] } ]
 *
 * fastDiff( '12xyza', '12a' );
 * // [ { index: 2, type: 'delete', howMany: 3 } ]
 *
 * fastDiff( [ '1', '2', 'a', 'a' ], [ '1', '2', 'a' ] );
 * // [ { index: 3, type: 'delete', howMany: 1 } ]
 *
 * fastDiff( [ '1', '2', 'a', 'b', 'c', '3' ], [ '2', 'a', 'b' ] );
 * // [ { index: 0, type: 'insert', values: [ '2', 'a', 'b' ] }, { index: 3, type: 'delete', howMany: 6 } ]
 * ```
 *
 * Passed arrays can contain any type of data, however to compare them correctly custom comparator function
 * should be passed as a third parameter:
 *
 * ```ts
 * fastDiff( [ { value: 1 }, { value: 2 } ], [ { value: 1 }, { value: 3 } ], ( a, b ) => {
 * 	return a.value === b.value;
 * } );
 * // [ { index: 1, type: 'insert', values: [ { value: 3 } ] }, { index: 2, type: 'delete', howMany: 1 } ]
 * ```
 *
 * The resulted set of changes can be applied to the input in order to transform it into the output, for example:
 *
 * ```ts
 * let input = '12abc3';
 * const output = '2ab';
 * const changes = fastDiff( input, output );
 *
 * changes.forEach( change => {
 * 	if ( change.type == 'insert' ) {
 * 		input = input.substring( 0, change.index ) + change.values.join( '' ) + input.substring( change.index );
 * 	} else if ( change.type == 'delete' ) {
 * 		input = input.substring( 0, change.index ) + input.substring( change.index + change.howMany );
 * 	}
 * } );
 *
 * // input equals output now
 * ```
 *
 * or in case of arrays:
 *
 * ```ts
 * let input = [ '1', '2', 'a', 'b', 'c', '3' ];
 * const output = [ '2', 'a', 'b' ];
 * const changes = fastDiff( input, output );
 *
 * changes.forEach( change => {
 * 	if ( change.type == 'insert' ) {
 * 		input = input.slice( 0, change.index ).concat( change.values, input.slice( change.index ) );
 * 	} else if ( change.type == 'delete' ) {
 * 		input = input.slice( 0, change.index ).concat( input.slice( change.index + change.howMany ) );
 * 	}
 * } );
 *
 * // input equals output now
 * ```
 *
 * By passing `true` as the fourth parameter (`atomicChanges`) the output of this function will become compatible with
 * the {@link module:utils/diff~diff `diff()`} function:
 *
 * ```ts
 * fastDiff( '12a', '12xyza', undefined, true );
 * // [ 'equal', 'equal', 'insert', 'insert', 'insert', 'equal' ]
 * ```
 *
 * The default output format of this function is compatible with the output format of
 * {@link module:utils/difftochanges~diffToChanges `diffToChanges()`}. The `diffToChanges()` input format is, in turn,
 * compatible with the output of {@link module:utils/diff~diff `diff()`}:
 *
 * ```ts
 * const a = '1234';
 * const b = '12xyz34';
 *
 * // Both calls will return the same results (grouped changes format).
 * fastDiff( a, b );
 * diffToChanges( diff( a, b ) );
 *
 * // Again, both calls will return the same results (atomic changes format).
 * fastDiff( a, b, undefined, true );
 * diff( a, b );
 * ```
 *
 * @typeParam T The type of array elements.
 * @typeParam AtomicChanges The type of `atomicChanges` parameter (selects the result type).
 * @param a Input array or string.
 * @param b Input array or string.
 * @param cmp Optional function used to compare array values, by default `===` (strict equal operator) is used.
 * @param atomicChanges Whether an array of `inset|delete|equal` operations should
 * be returned instead of changes set. This makes this function compatible with {@link module:utils/diff~diff `diff()`}.
 * Defaults to `false`.
 * @returns Array of changes. The elements are either {@link module:utils/diff~DiffResult} or {@link module:utils/difftochanges~Change},
 * depending on `atomicChanges` parameter.
 */
export declare function fastDiff<T, AtomicChanges extends boolean = false>(a: ArrayLike<T>, b: ArrayLike<T>, cmp?: (a: T, b: T) => boolean, atomicChanges?: AtomicChanges): Array<AtomicChanges extends true ? DiffResult : Change<T>>;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/comparearrays
 */
/**
 * Compares how given arrays relate to each other. One array can be: same as another array, prefix of another array
 * or completely different. If arrays are different, first index at which they differ is returned. Otherwise,
 * a flag specifying the relation is returned. Flags are negative numbers, so whenever a number >= 0 is returned
 * it means that arrays differ.
 *
 * ```ts
 * compareArrays( [ 0, 2 ], [ 0, 2 ] );		// 'same'
 * compareArrays( [ 0, 2 ], [ 0, 2, 1 ] );		// 'prefix'
 * compareArrays( [ 0, 2 ], [ 0 ] );			// 'extension'
 * compareArrays( [ 0, 2 ], [ 1, 2 ] );		// 0
 * compareArrays( [ 0, 2 ], [ 0, 1 ] );		// 1
 * ```
 *
 * @param a Array that is compared.
 * @param b Array to compare with.
 * @returns How array `a` is related to `b`.
 */
export declare function compareArrays(a: ReadonlyArray<unknown>, b: ReadonlyArray<unknown>): ArrayRelation | number;
/**
 * Array relation.
 */
export type ArrayRelation = 'extension' | 'same' | 'prefix';

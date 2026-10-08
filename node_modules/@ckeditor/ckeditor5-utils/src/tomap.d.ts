/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Transforms object or iterable to map. Iterable needs to be in the format acceptable by the `Map` constructor.
 *
 * ```ts
 * map = toMap( { 'foo': 1, 'bar': 2 } );
 * map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
 * map = toMap( anotherMap );
 * ```
 *
 * @param data Object or iterable to transform.
 * @returns Map created from data.
 */
export declare function toMap<T>(data: {
    readonly [key: string]: T;
} | Iterable<readonly [string, T]> | null | undefined): Map<string, T>;

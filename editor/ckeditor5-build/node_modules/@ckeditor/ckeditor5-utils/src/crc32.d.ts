/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Calculates CRC-32 checksum for a given inputData to verify the integrity of data.
 *
 * @param inputData Accepts a single value (string, number, boolean), an array of strings, or an array of all of the above types.
 * Non-string values are converted to strings before calculating the checksum.
 * The checksum calculation is based on the concatenated string representation of the input values:
 * * `crc32('foo')` is equivalent to `crc32(['foo'])`
 * * `crc32(123)` is equivalent to `crc32(['123'])`
 * * `crc32(true)` is equivalent to `crc32(['true'])`
 * * `crc32(['foo', 123, true])` produces the same result as `crc32('foo123true')`
 * * Nested arrays of strings are flattened, so `crc32([['foo', 'bar'], 'baz'])` is equivalent to `crc32(['foobar', 'baz'])`
 *
 * @returns The CRC-32 checksum, returned as a hexadecimal string.
 */
export declare function crc32(inputData: CRCData): string;
/**
 * The input data for the CRC-32 checksum calculation.
 * Can be a single value (string, number, boolean), an array of strings, or an array of all of the above types.
 */
export type CRCData = CRCValue | Array<CRCValue>;
export type CRCValue = string | number | boolean | Array<string>;

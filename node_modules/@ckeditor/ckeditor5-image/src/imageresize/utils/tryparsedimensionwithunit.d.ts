/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageresize/utils/tryparsedimensionwithunit
 */
/**
 * Parses provided string with dimension value and returns extracted numeric value and unit.
 *
 * 	* If non-string dimension is passed then `null` value is returned.
 * 	* If unit is missing then `null` is returned.
 * 	* If numeric value part of string is not a number then `null` is returned.
 *
 * Example:
 * 	`"222px"` => `{ value: 222, unit: "px" }`
 *	`"99%"` => `{ value: 99, unit: "%" }`

 * @param dimension Unsafe string with dimension.
 * @returns Parsed dimension with extracted numeric value and units.
 * @internal
 */
export declare function tryParseDimensionWithUnit(dimension: string | null | undefined): DimensionWithUnit | null;
/**
 * Converts dimension between `px` -> `%` and `%` -> `px`.
 *
 * @param parentDimensionPx	Dimension of parent element that contains measured element.
 * @param dimension Measured element dimension.
 * @returns Casted dimension.
 * @internal
 */
export declare function tryCastDimensionsToUnit(parentDimensionPx: number, dimension: DimensionWithUnit, targetUnit: string): DimensionWithUnit;
/**
 * @internal
 */
export type DimensionWithUnit = {
    value: number;
    unit: string;
};

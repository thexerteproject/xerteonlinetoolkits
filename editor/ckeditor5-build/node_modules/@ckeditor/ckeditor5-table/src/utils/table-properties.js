/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { isObject } from 'es-toolkit/compat';
/**
 * Returns a string if all four values of box sides are equal.
 *
 * If a string is passed, it is treated as a single value (pass-through).
 *
 * ```ts
 * // Returns 'foo':
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } );
 * getSingleValue( 'foo' );
 *
 * // Returns undefined:
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } );
 * getSingleValue( { top: 'foo', right: 'foo' } );
 * ```
 *
 * @internal
 */
export function getSingleValue(objectOrString) {
    if (!objectOrString || !isObject(objectOrString)) {
        return objectOrString;
    }
    const { top, right, bottom, left } = objectOrString;
    if (top == right && right == bottom && bottom == left) {
        return top;
    }
}
/**
 * Adds a unit to a value if the value is a number or a string representing a number.
 *
 * **Note**: It does nothing to non-numeric values.
 *
 * ```ts
 * getSingleValue( 25, 'px' ); // '25px'
 * getSingleValue( 25, 'em' ); // '25em'
 * getSingleValue( '25em', 'px' ); // '25em'
 * getSingleValue( 'foo', 'px' ); // 'foo'
 * ```
 *
 * @internal
 * @param defaultUnit A default unit added to a numeric value.
 */
export function addDefaultUnitToNumericValue(value, defaultUnit) {
    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue)) {
        return value;
    }
    if (String(numericValue) !== String(value)) {
        return value;
    }
    return `${numericValue}${defaultUnit}`;
}
/**
 * Returns the normalized configuration.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */
export function getNormalizedDefaultProperties(config, options = {}) {
    const normalizedConfig = {
        borderStyle: 'none',
        borderWidth: '',
        borderColor: '',
        backgroundColor: '',
        width: '',
        height: '',
        ...config
    };
    if (options.includeAlignmentProperty && !normalizedConfig.alignment) {
        normalizedConfig.alignment = 'center';
    }
    if (options.includePaddingProperty && !normalizedConfig.padding) {
        normalizedConfig.padding = '';
    }
    if (options.includeVerticalAlignmentProperty && !normalizedConfig.verticalAlignment) {
        normalizedConfig.verticalAlignment = 'middle';
    }
    if (options.includeHorizontalAlignmentProperty && !normalizedConfig.horizontalAlignment) {
        normalizedConfig.horizontalAlignment = options.isRightToLeftContent ? 'right' : 'left';
    }
    return normalizedConfig;
}
/**
 * Returns the normalized default table properties.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */
export function getNormalizedDefaultTableProperties(config, options) {
    return getNormalizedDefaultProperties({
        // It adds support for border none in the table element, keep it in sync with the content styles
        // See more: https://github.com/ckeditor/ckeditor5/issues/6841#issuecomment-1959195608
        borderStyle: 'double',
        borderColor: 'hsl(0, 0%, 70%)',
        borderWidth: '1px',
        ...config
    }, options);
}
/**
 * Returns the normalized default cell properties.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */
export function getNormalizedDefaultCellProperties(config, options) {
    return getNormalizedDefaultProperties({
        // It adds support for border none in the table element, keep it in sync with the content styles
        // See more: https://github.com/ckeditor/ckeditor5/issues/6841#issuecomment-1959195608
        borderStyle: 'solid',
        borderColor: 'hsl(0, 0%, 75%)',
        borderWidth: '1px',
        ...config
    }, options);
}

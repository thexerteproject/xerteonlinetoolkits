/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorpicker/utils
 */
import { default as parse } from 'color-parse';
import convert from 'color-convert';
/**
 * Parses and converts the color string to requested format. Handles variety of color spaces
 * like `hsl`, `hex` or `rgb`.
 *
 * @param color
 * @returns A color string.
 * @internal
 */
export function convertColor(color, outputFormat) {
    if (!color) {
        return '';
    }
    const colorObject = parseColorString(color);
    if (!colorObject) {
        return '';
    }
    if (colorObject.space === outputFormat) {
        return color;
    }
    if (!canConvertParsedColor(colorObject)) {
        return '';
    }
    const fromColorSpace = convert[colorObject.space];
    const toColorSpace = fromColorSpace[outputFormat];
    if (!toColorSpace) {
        return '';
    }
    const convertedColorChannels = toColorSpace(colorObject.space === 'hex' ? colorObject.hexValue : colorObject.values);
    return formatColorOutput(convertedColorChannels, outputFormat);
}
/**
 * Converts a color string to hex format.
 *
 * @param color
 * @returns A color string.
 * @internal
 */
export function convertToHex(color) {
    if (!color) {
        return '';
    }
    const colorObject = parseColorString(color);
    if (!colorObject) {
        return '#000';
    }
    if (colorObject.space === 'hex') {
        return colorObject.hexValue;
    }
    return convertColor(color, 'hex');
}
/**
 * Registers the custom element in the
 * [CustomElementsRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry).
 * @internal
 */
export function registerCustomElement(elementName, constructor) {
    if (customElements.get(elementName) === undefined) {
        customElements.define(elementName, constructor);
    }
}
/**
 * Formats the passed color channels according to the requested format.
 *
 * @param values
 * @param format
 * @returns A color string.
 */
function formatColorOutput(values, format) {
    switch (format) {
        case 'hex': return `#${values}`;
        case 'rgb': return `rgb(${values[0]}, ${values[1]}, ${values[2]})`;
        case 'hsl': return `hsl(${values[0]}, ${values[1]}%, ${values[2]}%)`;
        case 'hwb': return `hwb(${values[0]}, ${values[1]}, ${values[2]})`;
        case 'lab': return `lab(${values[0]}% ${values[1]} ${values[2]})`;
        case 'lch': return `lch(${values[0]}% ${values[1]} ${values[2]})`;
        default: return '';
    }
}
function parseColorString(colorString) {
    // Parser library treats `hex` format as belonging to `rgb` space | which messes up further conversion.
    // Let's parse such strings on our own.
    if (colorString.startsWith('#')) {
        const parsedHex = parse(colorString);
        return {
            space: 'hex',
            values: parsedHex.values,
            hexValue: colorString,
            alpha: parsedHex.alpha
        };
    }
    const parsed = parse(colorString);
    if (!parsed.space) {
        return null;
    }
    return parsed;
}
function canConvertParsedColor(parsedColor) {
    return Object.keys(convert).includes(parsedColor.space);
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Color formats handled by color converter.
 */
export type ColorPickerOutputFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';
/**
 * Configuration of the color picker feature.
 *
 * It can be forced to apply colors in the editor in a particular format.
 *
 * @default `{
 * 	format: 'hsl'
 * }`
 */
export type ColorPickerConfig = {
    format?: ColorPickerOutputFormat;
};
/**
 * Configuration of the color picker view.
 *
 * It can be used to enforce a particular color format or hide the color input.
 */
export type ColorPickerViewConfig = ColorPickerConfig & {
    hideInput?: boolean;
};
/**
 * Parses and converts the color string to requested format. Handles variety of color spaces
 * like `hsl`, `hex` or `rgb`.
 *
 * @param color
 * @returns A color string.
 * @internal
 */
export declare function convertColor(color: string, outputFormat: ColorPickerOutputFormat): string;
/**
 * Converts a color string to hex format.
 *
 * @param color
 * @returns A color string.
 * @internal
 */
export declare function convertToHex(color: string): string;
/**
 * Registers the custom element in the
 * [CustomElementsRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry).
 * @internal
 */
export declare function registerCustomElement(elementName: string, constructor: CustomElementConstructor): void;

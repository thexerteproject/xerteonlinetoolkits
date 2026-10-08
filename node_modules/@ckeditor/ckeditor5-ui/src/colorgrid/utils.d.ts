/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorgrid/utils
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
export type ColorOption = string | {
    color: string;
    label?: string;
    hasBorder?: boolean;
};
export interface NormalizedColorOption {
    model: string;
    label: string;
    hasBorder: boolean;
    view: {
        name: string;
        styles: {
            color: string;
        };
    };
}
/**
 * Returns color configuration options as defined in `editor.config.(fontColor|fontBackgroundColor).colors` or
 * `editor.config.table.(tableProperties|tableCellProperties).(background|border).colors
 * but processed to account for editor localization in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 *
 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
 */
export declare function getLocalizedColorOptions(locale: Locale, options: Array<NormalizedColorOption>): Array<NormalizedColorOption>;
/**
 * Creates a unified color definition object from color configuration options.
 * The object contains the information necessary to both render the UI and initialize the conversion.
 */
export declare function normalizeColorOptions(options: Array<ColorOption>): Array<NormalizedColorOption>;
/**
 * Creates a normalized color definition from the user-defined configuration.
 * The "normalization" means it will create full
 * {@link module:ui/colorgrid/colorgridview~ColorDefinition `ColorDefinition-like`}
 * object for string values, and add a `view` property, for each definition.
 */
export declare function normalizeSingleColorDefinition(color: ColorOption): NormalizedColorOption;

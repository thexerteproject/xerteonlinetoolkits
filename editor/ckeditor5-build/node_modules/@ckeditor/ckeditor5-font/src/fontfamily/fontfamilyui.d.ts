/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontfamily/fontfamilyui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The font family UI plugin. It introduces the `'fontFamily'` dropdown.
 */
export declare class FontFamilyUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FontFamilyUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns options as defined in `config.fontFamily.options` but processed to account for
     * editor localization, i.e. to display {@link module:font/fontconfig~FontFamilyOption}
     * in the correct language.
     *
     * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
     * when the user configuration is defined because the editor does not exist yet.
     */
    private _getLocalizedOptions;
}

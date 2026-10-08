/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontfamily/fontfamilyediting
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
/**
 * The font family editing feature.
 *
 * It introduces the {@link module:font/fontfamily/fontfamilycommand~FontFamilyCommand command} and
 * the `fontFamily` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as an inline `<span>` element (`<span style="font-family: Arial">`),
 * depending on the {@link module:font/fontconfig~FontFamilyConfig configuration}.
 */
export declare class FontFamilyEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FontFamilyEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * These converters enable keeping any value found as `style="font-family: *"` as a value of an attribute on a text even
     * if it is not defined in the plugin configuration.
     */
    private _prepareAnyValueConverters;
    /**
     * Adds support for legacy `<font face="..">` formatting.
     */
    private _prepareCompatibilityConverter;
}

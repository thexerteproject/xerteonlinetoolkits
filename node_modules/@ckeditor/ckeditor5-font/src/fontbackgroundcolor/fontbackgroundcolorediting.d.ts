/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The font background color editing feature.
 *
 * It introduces the {@link module:font/fontbackgroundcolor/fontbackgroundcolorcommand~FontBackgroundColorCommand command} and
 * the `fontBackgroundColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="background-color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */
export declare class FontBackgroundColorEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FontBackgroundColorEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { FontColorUIBase } from '../ui/colorui.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 */
export declare class FontBackgroundColorUI extends FontColorUIBase {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "FontBackgroundColorUI";
}

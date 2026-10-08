/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { FontColorUIBase } from '../ui/colorui.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 */
export declare class FontColorUI extends FontColorUIBase {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "FontColorUI";
}

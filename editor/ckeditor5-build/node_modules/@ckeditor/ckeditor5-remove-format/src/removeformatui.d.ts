/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module remove-format/removeformatui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The remove format UI plugin. It registers the `'removeFormat'` button which can be
 * used in the toolbar.
 */
export declare class RemoveFormatUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "RemoveFormatUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for remove format command to use either in toolbar or in menu bar.
     */
    private _createButton;
}

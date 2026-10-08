/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablelayout/tablelayoutui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The table layout UI plugin. It introduces:
 *
 * * The `'insertTableLayout'` dropdown,
 * * The `'menuBar:insertTableLayout'` menu bar menu.
 */
export declare class TableLayoutUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableLayoutUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecaption
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { TableCaptionEditing } from './tablecaption/tablecaptionediting.js';
import { TableCaptionUI } from './tablecaption/tablecaptionui.js';
import '../theme/tablecaption.css';
/**
 * The table caption plugin.
 */
export declare class TableCaption extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableCaption";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableCaptionEditing, typeof TableCaptionUI];
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablelayout/tablelayoutediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { TableColumnResize } from '../tablecolumnresize.js';
import '../../theme/tablelayout.css';
/**
 * The table layout editing plugin.
 */
export declare class TableLayoutEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableLayoutEditing";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableColumnResize];
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Defines the schema for the table layout feature.
     */
    private _defineSchema;
    /**
     * Defines the converters for the table layout feature.
     */
    private _defineConverters;
    /**
     * Handles the clipboard content insertion events.
     *
     * - If the content is from another editor, do not override the table type.
     * - If the content is from another source, set the table type to 'content'.
     *
     * It handles the scenario when user copies `<table></table>` from Word. We do not want to
     * change the table type to `layout` because it is really `content` table.
     */
    private _defineClipboardPasteHandlers;
    /**
     * Registers a post-fixer that sets the `tableType` attribute to `content` for inserted "default" tables.
     * Also fixes potential issues with the table structure when the `tableType` attribute has been changed.
     */
    private _registerTableTypeAttributePostfixer;
}

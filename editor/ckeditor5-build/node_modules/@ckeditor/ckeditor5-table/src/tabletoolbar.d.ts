/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tabletoolbar
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget.js';
/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for the table cell content).
 *
 * The table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/tableconfig~TableConfig#tableToolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/tableconfig~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 */
export declare class TableToolbar extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof WidgetToolbarRepository];
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableToolbar";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): void;
}

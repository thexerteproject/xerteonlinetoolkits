/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecolumnresize
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { TableColumnResizeEditing } from './tablecolumnresize/tablecolumnresizeediting.js';
import { TableCellWidthEditing } from './tablecellwidth/tablecellwidthediting.js';
import '../theme/tablecolumnresize.css';
/**
 * The table column resize feature.
 *
 * It provides the possibility to set the width of each column in a table using a resize handler.
 */
export declare class TableColumnResize extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableColumnResizeEditing, typeof TableCellWidthEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableColumnResize";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellwidth/tablecellwidthediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { TableEditing } from './../tableediting.js';
/**
 * The table cell width editing feature.
 *
 * Introduces `tableCellWidth` table cell model attribute alongside with its converters
 * and a command.
 */
export declare class TableCellWidthEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableCellWidthEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableEditing];
    /**
     * @inheritDoc
     */
    init(): void;
}

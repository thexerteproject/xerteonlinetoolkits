/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/converters/downcast
 */
import { type Editor } from 'ckeditor5/src/core.js';
import type { ViewElement, ModelElement, DowncastElementCreatorFunction, DowncastConversionApi } from 'ckeditor5/src/engine.js';
import { type TableUtils } from '../tableutils.js';
import type { TableConversionAdditionalSlot } from '../tableediting.js';
/**
 * Model table element to view table element conversion helper.
 *
 * @internal
 */
export declare function downcastTable(tableUtils: TableUtils, options: DowncastTableOptions): DowncastElementCreatorFunction;
/**
 * Model table row element to view `<tr>` element conversion helper.
 *
 * @internal
 * @returns Element creator.
 */
export declare function downcastRow(): DowncastElementCreatorFunction;
/**
 * Model table cell element to view `<td>` or `<th>` element conversion helper.
 *
 * This conversion helper will create proper `<th>` elements for table cells that are in the heading section (heading row or column)
 * and `<td>` otherwise.
 *
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @param options.cellTypeEnabled If returns `true`, the downcast conversion will use the `tableCellType` attribute to determine cell type.
 * @returns Element creator.
 */
export declare function downcastCell(options: {
    asWidget?: boolean;
    cellTypeEnabled: () => boolean;
}): DowncastElementCreatorFunction;
/**
 * Overrides paragraph inside table cell conversion.
 *
 * This converter:
 * * should be used to override default paragraph conversion.
 * * It will only convert `<paragraph>` placed directly inside `<tableCell>`.
 * * For a single paragraph without attributes it returns `<span>` to simulate data table.
 * * For all other cases it returns `<p>` element.
 *
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @returns Element creator.
 */
export declare function convertParagraphInTableCell(options?: {
    asWidget?: boolean;
}): DowncastElementCreatorFunction;
/**
 * Checks if given model `<paragraph>` is an only child of a parent (`<tableCell>`) and if it has any attribute set.
 *
 * The paragraph should be converted in the editing view to:
 *
 * * If returned `true` - to a `<span class="ck-table-bogus-paragraph">`
 * * If returned `false` - to a `<p>`
 *
 * @internal
 */
export declare function isSingleParagraphWithoutAttributes(modelElement: ModelElement): boolean;
/**
 * Downcasts a plain table (also used in the clipboard pipeline).
 */
export declare function convertPlainTable(editor: Editor): DowncastElementCreatorFunction;
/**
 * Downcasts a plain table caption (also used in the clipboard pipeline).
 */
export declare function convertPlainTableCaption(editor: Editor): DowncastElementCreatorFunction;
/**
 * Downcasts a plain table.
 *
 * @param table Table model element.
 * @param conversionApi The conversion API object.
 * @param editor The editor instance.
 * @returns Created element.
 */
export declare function downcastPlainTable(table: ModelElement, conversionApi: DowncastConversionApi, editor: Editor): ViewElement;
/**
 * Registers border and background attributes converters for plain tables or when the clipboard pipeline is used.
 */
export declare function downcastTableBorderAndBackgroundAttributes(editor: Editor): void;
/**
 * Options for the downcast table conversion.
 *
 * @internal
 */
export interface DowncastTableOptions {
    /**
     * If set to `true`, the downcast conversion will produce a widget.
     */
    asWidget?: boolean;
    /**
     * Array of additional slot handlers.
     */
    additionalSlots: Array<TableConversionAdditionalSlot>;
}

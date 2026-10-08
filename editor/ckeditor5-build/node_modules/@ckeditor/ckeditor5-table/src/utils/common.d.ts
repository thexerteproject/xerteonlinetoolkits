/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/utils/common
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { Conversion, ModelElement, ModelItem, ModelPosition, ModelSchema, ModelWriter, ModelDocumentSelection } from 'ckeditor5/src/engine.js';
import { type TableUtils } from '../tableutils.js';
/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @internal
 * @param key An attribute key.
 * @param value The new attribute value.
 * @param item A model item on which the attribute will be set.
 * @param defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export declare function updateNumericAttribute(key: string, value: unknown, item: ModelItem, writer: ModelWriter, defaultValue?: unknown): void;
/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @internal
 * @param writer The model writer.
 * @param insertPosition The position at which the table cell should be inserted.
 * @param attributes The element attributes.
 * @returns Created table cell.
 */
export declare function createEmptyTableCell(writer: ModelWriter, insertPosition: ModelPosition, attributes?: Record<string, unknown>): ModelElement;
/**
 * Checks if a table cell belongs to the heading column section.
 *
 * @internal
 */
export declare function isHeadingColumnCell(tableUtils: TableUtils, tableCell: ModelElement): boolean;
/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @internal
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
export declare function enableProperty(schema: ModelSchema, conversion: Conversion, options: {
    modelAttribute: string;
    styleName: string;
    attributeName?: string;
    attributeType?: 'length' | 'color';
    defaultValue: string;
    reduceBoxSides?: boolean;
}): void;
/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 *
 * @internal
 */
export declare function getSelectionAffectedTable(selection: ModelDocumentSelection): ModelElement;
/**
 * Groups table cells by their parent table.
 *
 * @internal
 */
export declare function groupCellsByTable(tableCells: Array<ModelElement>): Map<ModelElement, Array<ModelElement>>;
/**
 * Checks if all cells in a given row or column are header cells.
 *
 * @internal
 */
export declare function isEntireCellsLineHeader({ table, row, column }: {
    table: ModelElement;
    row?: number;
    column?: number;
}): boolean;
/**
 * Checks whether the `tableCellType` attribute is enabled in the editor schema and the experimental flag is set.
 *
 * @internal
 */
export declare function isTableCellTypeEnabled(editor: Editor): boolean;

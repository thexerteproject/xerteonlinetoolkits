/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { downcastAttributeToStyle, upcastStyleToAttribute } from '../converters/tableproperties.js';
import { TableWalker } from '../tablewalker.js';
/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @internal
 * @param key An attribute key.
 * @param value The new attribute value.
 * @param item A model item on which the attribute will be set.
 * @param defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute(key, value, item, writer, defaultValue = 1) {
    if (value !== undefined && value !== null && defaultValue !== undefined && defaultValue !== null && value > defaultValue) {
        writer.setAttribute(key, value, item);
    }
    else {
        writer.removeAttribute(key, item);
    }
}
/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @internal
 * @param writer The model writer.
 * @param insertPosition The position at which the table cell should be inserted.
 * @param attributes The element attributes.
 * @returns Created table cell.
 */
export function createEmptyTableCell(writer, insertPosition, attributes = {}) {
    const tableCell = writer.createElement('tableCell', attributes);
    writer.insertElement('paragraph', tableCell);
    writer.insert(tableCell, insertPosition);
    return tableCell;
}
/**
 * Checks if a table cell belongs to the heading column section.
 *
 * @internal
 */
export function isHeadingColumnCell(tableUtils, tableCell) {
    const table = tableCell.parent.parent;
    const headingColumns = parseInt(table.getAttribute('headingColumns') || '0');
    const { column } = tableUtils.getCellLocation(tableCell);
    return !!headingColumns && column < headingColumns;
}
/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @internal
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
export function enableProperty(schema, conversion, options) {
    const { modelAttribute } = options;
    schema.extend('tableCell', {
        allowAttributes: [modelAttribute]
    });
    schema.setAttributeProperties(modelAttribute, { isFormatting: true });
    upcastStyleToAttribute(conversion, { viewElement: /^(td|th)$/, ...options });
    downcastAttributeToStyle(conversion, { modelElement: 'tableCell', ...options });
}
/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 *
 * @internal
 */
export function getSelectionAffectedTable(selection) {
    const selectedElement = selection.getSelectedElement();
    // Is the command triggered from the `tableToolbar`?
    if (selectedElement && selectedElement.is('element', 'table')) {
        return selectedElement;
    }
    return selection.getFirstPosition().findAncestor('table');
}
/**
 * Groups table cells by their parent table.
 *
 * @internal
 */
export function groupCellsByTable(tableCells) {
    const tableMap = new Map();
    for (const tableCell of tableCells) {
        const table = tableCell.findAncestor('table');
        if (!tableMap.has(table)) {
            tableMap.set(table, []);
        }
        tableMap.get(table).push(tableCell);
    }
    return tableMap;
}
/**
 * Checks if all cells in a given row or column are header cells.
 *
 * @internal
 */
export function isEntireCellsLineHeader({ table, row, column }) {
    const tableWalker = new TableWalker(table, { row, column });
    for (const { cell } of tableWalker) {
        const cellType = cell.getAttribute('tableCellType');
        if (cellType !== 'header') {
            return false;
        }
    }
    return true;
}
/**
 * Checks whether the `tableCellType` attribute is enabled in the editor schema and the experimental flag is set.
 *
 * @internal
 */
export function isTableCellTypeEnabled(editor) {
    const { model, config } = editor;
    return (model.schema.checkAttribute('tableCell', 'tableCellType') &&
        config.get('experimentalFlags.tableCellTypeSupport') === true);
}

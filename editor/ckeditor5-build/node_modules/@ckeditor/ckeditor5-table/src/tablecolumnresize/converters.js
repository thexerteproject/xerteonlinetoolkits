/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { normalizeColumnWidths, updateColumnElements, getColumnGroupElement, getTableColumnElements, translateColSpanAttribute } from './utils.js';
/**
 * Returns a upcast helper that ensures the number of `<tableColumn>` elements corresponds to the actual number of columns in the table,
 * because the input data might have too few or too many <col> elements.
 *
 * @internal
 */
export function upcastColgroupElement(tableUtilsPlugin) {
    return dispatcher => dispatcher.on('element:colgroup', (evt, data, conversionApi) => {
        const modelTable = data.modelCursor.findAncestor('table');
        const tableColumnGroup = getColumnGroupElement(modelTable);
        if (!tableColumnGroup) {
            return;
        }
        const columnElements = getTableColumnElements(tableColumnGroup);
        const columnsCount = tableUtilsPlugin.getColumns(modelTable);
        let columnWidths = translateColSpanAttribute(tableColumnGroup, conversionApi.writer);
        // Fill the array with 'auto' values if the number of columns is higher than number of declared values.
        columnWidths = Array.from({ length: columnsCount }, (_, index) => columnWidths[index] || 'auto');
        if (columnWidths.length != columnElements.length || columnWidths.includes('auto')) {
            updateColumnElements(columnElements, tableColumnGroup, normalizeColumnWidths(columnWidths), conversionApi.writer);
        }
    }, { priority: 'low' });
}
/**
 * Returns downcast helper for adding `ck-table-resized` class if there is a `<tableColumnGroup>` element inside the table.
 *
 * @internal
 */
export function downcastTableResizedClass() {
    return dispatcher => dispatcher.on('insert:table', (evt, data, conversionApi) => {
        const viewWriter = conversionApi.writer;
        const modelTable = data.item;
        const viewElement = conversionApi.mapper.toViewElement(modelTable);
        const viewTable = viewElement.is('element', 'table') ?
            viewElement :
            Array.from(viewElement.getChildren()).find(viewChild => viewChild.is('element', 'table'));
        const tableColumnGroup = getColumnGroupElement(modelTable);
        if (tableColumnGroup) {
            viewWriter.addClass('ck-table-resized', viewTable);
        }
        else {
            viewWriter.removeClass('ck-table-resized', viewTable);
        }
    }, { priority: 'low' });
}
/**
 * Returns a upcast helper that removes the `ck-table-resized` class from the table element.
 *
 * @internal
 */
export function upcastTableResizedClass() {
    return (dispatcher) => {
        dispatcher.on('element:table', (evt, data, conversionApi) => {
            conversionApi.consumable.consume(data.viewItem, { classes: 'ck-table-resized' });
        });
    };
}

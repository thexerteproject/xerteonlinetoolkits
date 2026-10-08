/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { isWidget } from 'ckeditor5/src/widget.js';
/**
 * Depending on the position of the selection either return the selected table or the table higher in the hierarchy.
 *
 * @internal
 */
export function getSelectionAffectedTableWidget(selection) {
    const selectedTable = getSelectedTableWidget(selection);
    if (selectedTable) {
        return selectedTable;
    }
    return getTableWidgetAncestor(selection);
}
/**
 * Returns a table widget editing view element if one is selected.
 *
 * @internal
 */
export function getSelectedTableWidget(selection) {
    const viewElement = selection.getSelectedElement();
    if (viewElement && isTableWidget(viewElement)) {
        return viewElement;
    }
    return null;
}
/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @internal
 */
export function getTableWidgetAncestor(selection) {
    const selectionPosition = selection.getFirstPosition();
    if (!selectionPosition) {
        return null;
    }
    let parent = selectionPosition.parent;
    while (parent) {
        if (parent.is('element') && isTableWidget(parent)) {
            return parent;
        }
        parent = parent.parent;
    }
    return null;
}
/**
 * Checks if a given view element is a table widget.
 *
 * @internal
 */
export function isTableWidget(viewNode) {
    return viewNode.is('element') && !!viewNode.getCustomProperty('table') && isWidget(viewNode);
}

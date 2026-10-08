/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableselection
 */
import { Plugin } from 'ckeditor5/src/core.js';
import type { ModelElement, ModelDocumentFragment } from 'ckeditor5/src/engine.js';
import { TableUtils } from './tableutils.js';
import '../theme/tableselection.css';
/**
 * This plugin enables the advanced table cells, rows and columns selection.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */
export declare class TableSelection extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableSelection";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableUtils, typeof TableUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns the currently selected table cells or `null` if it is not a table cells selection.
     */
    getSelectedTableCells(): Array<ModelElement> | null;
    /**
     * Returns the selected table fragment as a document fragment.
     */
    getSelectionAsFragment(): ModelDocumentFragment | null;
    /**
     * Sets the model selection based on given anchor and target cells (can be the same cell).
     * Takes care of setting the backward flag.
     *
     * ```ts
     * const modelRoot = editor.model.document.getRoot();
     * const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
     * const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
     *
     * const tableSelection = editor.plugins.get( 'TableSelection' );
     * tableSelection.setCellSelection( firstCell, lastCell );
     * ```
     */
    setCellSelection(anchorCell: ModelElement, targetCell: ModelElement): void;
    /**
     * Returns the focus cell from the current selection.
     */
    getFocusCell(): ModelElement | null;
    /**
     * Returns the anchor cell from the current selection.
     */
    getAnchorCell(): ModelElement | null;
    /**
     * Defines a selection converter which marks the selected cells with a specific class.
     *
     * The real DOM selection is put in the last cell. Since the order of ranges is dependent on whether the
     * selection is backward or not, the last cell will usually be close to the "focus" end of the selection
     * (a selection has anchor and focus).
     *
     * The real DOM selection is then hidden with CSS.
     */
    private _defineSelectionConverter;
    /**
     * Creates a listener that reacts to changes in {@link #isEnabled} and, if the plugin was disabled,
     * it collapses the multi-cell selection to a regular selection placed inside a table cell.
     *
     * This listener helps features that disable the table selection plugin bring the selection
     * to a clear state they can work with (for instance, because they don't support multiple cell selection).
     */
    private _enablePluginDisabling;
    /**
     * Overrides the default `model.deleteContent()` behavior over a selected table fragment.
     *
     * @param args Delete content method arguments.
     */
    private _handleDeleteContent;
    /**
     * This handler makes it possible to remove the content of all selected cells by starting to type.
     * If you take a look at {@link #_defineSelectionConverter} you will find out that despite the multi-cell selection being set
     * in the model, the view selection is collapsed in the last cell (because most browsers are unable to render multi-cell selections;
     * yes, it's a hack).
     *
     * When multiple cells are selected in the model and the user starts to type, the
     * {@link module:engine/view/document~ViewDocument#event:insertText} event carries information provided by the
     * beforeinput DOM  event, that in turn only knows about this collapsed DOM selection in the last cell.
     *
     * As a result, the selected cells have no chance to be cleaned up. To fix this, this listener intercepts
     * the event and injects the custom view selection in the data that translates correctly to the actual state
     * of the multi-cell selection in the model.
     *
     * @param data Insert text event data.
     */
    private _handleInsertTextEvent;
    /**
     * Returns an array of table cells that should be selected based on the
     * given anchor cell and target (focus) cell.
     *
     * The cells are returned in a reverse direction if the selection is backward.
     */
    private _getCellsToSelect;
}

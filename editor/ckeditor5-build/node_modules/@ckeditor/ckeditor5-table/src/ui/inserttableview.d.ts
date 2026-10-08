/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/ui/inserttableview
 */
import { View, ButtonView, type ViewCollection } from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, FocusTracker, type Locale } from 'ckeditor5/src/utils.js';
import './../../theme/inserttable.css';
/**
 * The table size view.
 *
 * It renders a 10x10 grid to choose the inserted table size.
 *
 * @internal
 */
export declare class InsertTableView extends View {
    /**
     * A collection of table size box items.
     */
    readonly items: ViewCollection<ButtonView>;
    /**
     * Listen to `keydown` events fired in this view's main element.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Tracks information about the DOM focus in the grid.
     */
    readonly focusTracker: FocusTracker;
    /**
     * The currently selected number of rows of the new table.
     *
     * @observable
     */
    rows: number;
    /**
     * The currently selected number of columns of the new table.
     *
     * @observable
     */
    columns: number;
    /**
     * The label text displayed under the boxes.
     *
     * @observable
     */
    label: string;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
    render(): void;
    /**
     * Resets the rows and columns selection.
     */
    reset(): void;
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    focusLast(): void;
    /**
     * Highlights grid boxes depending on rows and columns selected.
     */
    private _highlightGridBoxes;
    /**
     * Creates a new Button for the grid.
     *
     * @param locale The locale instance.
     * @param row Row number.
     * @param column Column number.
     * @param label The grid button label.
     */
    private _createGridButton;
    /**
     * @returns A view collection containing boxes to be placed in a table grid.
     */
    private _createGridCollection;
}

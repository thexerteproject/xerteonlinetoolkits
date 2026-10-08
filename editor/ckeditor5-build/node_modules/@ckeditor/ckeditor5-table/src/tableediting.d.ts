/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { ModelPositionOffset, DowncastSlotFilter } from 'ckeditor5/src/engine.js';
import { TableUtils } from '../src/tableutils.js';
import '../theme/tableediting.css';
/**
 * The table editing feature.
 */
export declare class TableEditing extends Plugin {
    /**
     * Handlers for creating additional slots in the table.
     */
    private _additionalSlots;
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableUtils];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Registers downcast handler for the additional table slot.
     */
    registerAdditionalSlot(slotHandler: TableConversionAdditionalSlot): void;
    /**
     * Adds converters for plain table output. These converters are used either when the `PlainTableOutput` plugin is loaded
     * or when content is processed by the clipboard pipeline, ensuring that pasted tables are not wrapped in a <figure> element.
     */
    private _addPlainTableOutputConverters;
}
/**
 * By default, only the `tableRow` elements from the `table` model are downcast inside the `<table>` and
 * all other elements are pushed outside the table. This handler allows creating additional slots inside
 * the table for other elements.
 *
 * Take this model as an example:
 *
 * ```xml
 * <table>
 *   <tableRow>...</tableRow>
 *   <tableRow>...</tableRow>
 *   <tableColumnGroup>...</tableColumnGroup>
 * </table>
 * ```
 *
 * By default, downcasting result will be:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>...</tr>
 *     <tr>...</tr>
 *   </tbody>
 * </table>
 * <colgroup>...</colgroup>
 * ```
 *
 * To allow the `tableColumnGroup` element at the end of the table, use the following configuration:
 *
 * ```ts
 * const additionalSlot = {
 *   filter: element => element.is( 'element', 'tableColumnGroup' ),
 *   positionOffset: 'end'
 * }
 * ```
 *
 * Now, the downcast result will be:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>...</tr>
 *     <tr>...</tr>
 *   </tbody>
 *   <colgroup>...</colgroup>
 * </table>
 * ```
 */
export interface TableConversionAdditionalSlot {
    /**
     * Filter for elements that should be placed inside given slot.
     */
    filter: DowncastSlotFilter;
    /**
     * Position of the slot within the table.
     */
    positionOffset: ModelPositionOffset;
}

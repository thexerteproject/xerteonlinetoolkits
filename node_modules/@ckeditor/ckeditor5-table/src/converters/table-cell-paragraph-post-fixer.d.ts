/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/converters/table-cell-paragraph-post-fixer
 */
import type { Model } from 'ckeditor5/src/engine.js';
/**
 * Injects a table cell post-fixer into the model which inserts a `paragraph` element into empty table cells.
 *
 * A table cell must contain at least one block element as a child. An empty table cell will have an empty `paragraph` as a child.
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * Will be fixed to:
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell><paragraph></paragraph></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * @internal
 */
export declare function injectTableCellParagraphPostFixer(model: Model): void;

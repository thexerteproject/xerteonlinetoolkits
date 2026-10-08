/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/converters/table-cell-refresh-handler
 */
import type { EditingController, Model } from 'ckeditor5/src/engine.js';
/**
 * A table cell refresh handler which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 *
 * @internal
 */
export declare function tableCellRefreshHandler(model: Model, editing: EditingController): void;

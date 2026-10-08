/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/utils/ui/widget
 */
import type { ViewDocumentSelection, ViewElement, ViewNode } from 'ckeditor5/src/engine.js';
/**
 * Depending on the position of the selection either return the selected table or the table higher in the hierarchy.
 *
 * @internal
 */
export declare function getSelectionAffectedTableWidget(selection: ViewDocumentSelection): ViewElement | null;
/**
 * Returns a table widget editing view element if one is selected.
 *
 * @internal
 */
export declare function getSelectedTableWidget(selection: ViewDocumentSelection): ViewElement | null;
/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @internal
 */
export declare function getTableWidgetAncestor(selection: ViewDocumentSelection): ViewElement | null;
/**
 * Checks if a given view element is a table widget.
 *
 * @internal
 */
export declare function isTableWidget(viewNode: ViewNode): boolean;

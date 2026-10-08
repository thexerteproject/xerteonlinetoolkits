/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/table
 */
import { type ViewUpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Applies border none for table and cells without a border specified.
 * Normalizes style length units to px.
 * Handles left block table alignment.
 *
 * @internal
 */
export declare function transformTables(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter, hasTablePropertiesPlugin?: boolean, hasExtendedTableBlockAlignment?: boolean): void;

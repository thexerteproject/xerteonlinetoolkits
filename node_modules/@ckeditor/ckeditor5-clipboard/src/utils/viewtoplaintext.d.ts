/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/utils/viewtoplaintext
 */
import type { ViewDomConverter, ViewDocumentFragment, ViewItem } from '@ckeditor/ckeditor5-engine';
/**
 * Converts {@link module:engine/view/item~ViewItem view item} and all of its children to plain text.
 *
 * @param converter The converter instance.
 * @param viewItem View item to convert.
 * @returns Plain text representation of `viewItem`.
 */
export declare function viewToPlainText(converter: ViewDomConverter, viewItem: ViewItem | ViewDocumentFragment): string;

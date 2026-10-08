/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/removemsattributes
 */
import { type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Cleanup MS attributes like styles, attributes and elements.
 *
 * @param documentFragment element `data.content` obtained from clipboard.
 * @internal
 */
export declare function removeMSAttributes(documentFragment: ViewDocumentFragment): void;

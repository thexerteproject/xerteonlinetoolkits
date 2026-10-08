/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/list
 */
import { ViewUpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Transforms Word specific list-like elements to the semantic HTML lists.
 *
 * Lists in Word are represented by block elements with special attributes like:
 *
 * ```xml
 * <p class=MsoListParagraphCxSpFirst style='mso-list:l1 level1 lfo1'>...</p> // Paragraph based list.
 * <h1 style='mso-list:l0 level1 lfo1'>...</h1> // Heading 1 based list.
 * ```
 *
 * @param documentFragment The view structure to be transformed.
 * @param stylesString Styles from which list-like elements styling will be extracted.
 * @internal
 */
export declare function transformListItemLikeElementsIntoLists(documentFragment: ViewDocumentFragment, stylesString: string, hasMultiLevelListPlugin: boolean): void;
/**
 * Removes paragraph wrapping content inside a list item.
 *
 * @internal
 */
export declare function unwrapParagraphInListItem(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter): void;

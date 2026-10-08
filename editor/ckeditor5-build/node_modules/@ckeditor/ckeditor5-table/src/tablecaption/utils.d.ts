/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecaption/utils
 */
import type { ModelDocumentFragment, ModelDocumentSelection, ModelElement, ViewElement } from 'ckeditor5/src/engine.js';
/**
 * Checks if the provided model element is a `table`.
 *
 * @param modelElement Element to check if it is a table.
 * @internal
 */
export declare function isTable(modelElement: ModelElement | ModelDocumentFragment | null): boolean;
/**
 * Returns the caption model element from a given table element. Returns `null` if no caption is found.
 *
 * @param tableModelElement Table element in which we will try to find a caption element.
 * @internal
 */
export declare function getCaptionFromTableModelElement(tableModelElement: ModelElement): ModelElement | null;
/**
 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
 *
 * @param selection The selection checked for caption presence.
 * @internal
 */
export declare function getCaptionFromModelSelection(selection: ModelDocumentSelection): ModelElement | null;
/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption.
 *
 * There are two possible forms of the valid caption:
 *  - A `<figcaption>` element inside a `<figure class="table">` element.
 *  - A `<caption>` inside a <table>.
 *
 * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element cannot be matched.
 * @internal
 */
export declare function matchTableCaptionViewElement(element: ViewElement): {
    name: true;
} | null;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
/**
 * Adds a visual highlight style to an attribute element in which the selection is anchored.
 * Together with two-step caret movement, they indicate that the user is typing inside the element.
 *
 * Highlight is turned on by adding the given class to the attribute element in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * Usage:
 *
 * ```ts
 * import { inlineHighlight } from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';
 *
 * // Make `ck-link_selected` class be applied on an `a` element
 * // whenever the corresponding `linkHref` attribute element is selected.
 * inlineHighlight( editor, 'linkHref', 'a', 'ck-link_selected' );
 * ```
 *
 * @param editor The editor instance.
 * @param attributeName The attribute name to check.
 * @param tagName The tagName of a view item.
 * @param className The class name to apply in the view.
 */
export declare function inlineHighlight(editor: Editor, attributeName: string, tagName: string, className: string): void;

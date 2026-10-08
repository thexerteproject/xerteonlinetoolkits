/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from '../editor.js';
import type { ElementApi } from './elementapimixin.js';
/**
 * Checks if the editor is initialized on a `<textarea>` element that belongs to a form. If yes, it updates the editor's element
 * content before submitting the form.
 *
 * This helper requires the {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface}.
 *
 * @param editor Editor instance.
 */
export declare function attachToForm(editor: Editor & ElementApi): void;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageresize/utils/getselectedimageeditornodes
 */
import type { ViewElement, ModelElement } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * Finds model, view and DOM element for selected image element. Returns `null` if there is no image selected.
 *
 * @param editor Editor instance.
 * @internal
 */
export declare function getSelectedImageEditorNodes(editor: Editor): ImageEditorNodes | null;
/**
 * @internal;
 */
type ImageEditorNodes = {
    model: ModelElement;
    view: ViewElement;
    dom: HTMLElement;
};
export {};

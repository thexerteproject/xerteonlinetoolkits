/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/editor/utils/elementapimixin
 */
import { type Constructor, type Mixed } from '@ckeditor/ckeditor5-utils';
import { type Editor } from '../editor.js';
/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
 */
export declare function ElementApiMixin<Base extends Constructor<Editor>>(base: Base): Mixed<Base, ElementApi>;
/**
 * Interface describing an editor that replaced a DOM element (was "initialized on an element").
 *
 * Such an editor should provide a method to
 * {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement update the replaced element with the current data}.
 */
export interface ElementApi {
    /**
     * The element on which the editor has been initialized.
     *
     * @readonly
     */
    sourceElement: HTMLElement | undefined;
    /**
     * Updates the {@link #sourceElement editor source element}'s content with the data if the
     * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
     * configuration option is set to `true`.
     *
     * @param data Data that the {@link #sourceElement editor source element} should be updated with.
     */
    updateSourceElement(data?: string): void;
}

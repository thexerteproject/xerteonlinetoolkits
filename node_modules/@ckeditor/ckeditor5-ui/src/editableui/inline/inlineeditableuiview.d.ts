/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editableui/inline/inlineeditableuiview
 */
import { EditableUIView } from '../editableuiview.js';
import type { EditingView } from '@ckeditor/ckeditor5-engine';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The inline editable UI class implementing an inline {@link module:ui/editableui/editableuiview~EditableUIView}.
 */
export declare class InlineEditableUIView extends EditableUIView {
    /**
     * The cached options object passed to the constructor.
     */
    private readonly _options;
    /**
     * Creates an instance of the InlineEditableUIView class.
     *
     * @param locale The locale instance.
     * @param editingView The editing view instance the editable is related to.
     * @param editableElement The editable element. If not specified, the
     * {@link module:ui/editableui/editableuiview~EditableUIView}
     * will create it. Otherwise, the existing element will be used.
     * @param options Additional configuration of the view.
     * @param options.label The label of the editable for assistive technologies. If not provided, a default label is used or,
     * the existing `aria-label` attribute value from the specified `editableElement` is preserved.
     */
    constructor(locale: Locale, editingView: EditingView, editableElement?: HTMLElement, options?: InlineEditableUIViewOptions);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Returns a normalized label for the editable view based on the environment.
     */
    getEditableAriaLabel(): string;
}
export type InlineEditableUIViewOptions = {
    label?: ((view: InlineEditableUIView) => string) | string | Record<string, string>;
};

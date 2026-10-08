/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editableui/editableuiview
 */
import { View } from '../view.js';
import type { EditingView } from '@ckeditor/ckeditor5-engine';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The editable UI view class.
 */
export declare class EditableUIView extends View {
    /**
     * The name of the editable UI view.
     */
    name: string | null;
    /**
     * Controls whether the editable is focused, i.e. the user is typing in it.
     *
     * @observable
     */
    isFocused: boolean;
    /**
     * The editing view instance the editable is related to. Editable uses the editing
     * view to dynamically modify its certain DOM attributes after {@link #render rendering}.
     *
     * **Note**: The DOM attributes are performed by the editing view and not UI
     * {@link module:ui/view~View#bindTemplate template bindings} because once rendered,
     * the editable DOM element must remain under the full control of the engine to work properly.
     */
    protected _editingView: EditingView;
    /**
     * The element which is the main editable element (usually the one with `contentEditable="true"`).
     */
    protected _editableElement: HTMLElement | null | undefined;
    /**
     * Whether an external {@link #_editableElement} was passed into the constructor, which also means
     * the view will not render its {@link #template}.
     */
    private _hasExternalElement;
    /**
     * Creates an instance of EditableUIView class.
     *
     * @param locale The locale instance.
     * @param editingView The editing view instance the editable is related to.
     * @param editableElement The editable element. If not specified, this view
     * should create it. Otherwise, the existing element should be used.
     */
    constructor(locale: Locale, editingView: EditingView, editableElement?: HTMLElement);
    /**
     * Renders the view by either applying the {@link #template} to the existing
     * {@link module:ui/editableui/editableuiview~EditableUIView#_editableElement} or assigning {@link #element}
     * as {@link module:ui/editableui/editableuiview~EditableUIView#_editableElement}.
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Whether an external {@link #_editableElement} was passed into the constructor, which also means
     * the view will not render its {@link #template}.
     */
    get hasExternalElement(): boolean;
    /**
     * Updates the `ck-focused` and `ck-blurred` CSS classes on the {@link #element} according to
     * the {@link #isFocused} property value using the {@link #_editingView editing view} API.
     */
    private _updateIsFocusedClasses;
}

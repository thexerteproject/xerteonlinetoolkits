/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module bookmark/ui/bookmarkformview
 */
import { ButtonView, LabeledFieldView, View, ViewCollection, type InputTextView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../theme/bookmarkform.css';
/**
 * The bookmark form view controller class.
 *
 * See {@link module:bookmark/ui/bookmarkformview~BookmarkFormView}.
 */
export declare class BookmarkFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The ID input view.
     */
    idInputView: LabeledFieldView<InputTextView>;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView: ButtonView;
    /**
     * A button used to submit the form.
     */
    saveButtonView: ButtonView;
    /**
     * A collection of form child views in the form.
     */
    readonly children: ViewCollection;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    private readonly _validators;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param validators  Form validators used by {@link #isValid}.
     */
    constructor(locale: Locale, validators: Array<BookmarkFormValidatorCallback>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus(): void;
    /**
     * Validates the form and returns `false` when some fields are invalid.
     */
    isValid(): boolean;
    /**
     * Cleans up the supplementary error and information text of the {@link #idInputView}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetFormStatus(): void;
    /**
     * Creates a back button view that cancels the form.
     */
    private _createBackButton;
    /**
     * Creates a save button view that saves the bookmark.
     */
    private _createSaveButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
    /**
     * Creates a labeled input view.
     *
     * @returns Labeled field view instance.
     */
    private _createIdInput;
    /**
     * The native DOM `value` of the {@link #idInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get id(): string | null;
}
/**
 * Callback used by {@link ~BookmarkFormView} to check if passed form value is valid.
 *
 * If `undefined` is returned, it is assumed that the form value is correct and there is no error.
 * If string is returned, it is assumed that the form value is incorrect and the returned string is displayed in the error label
 */
export type BookmarkFormValidatorCallback = (form: BookmarkFormView) => string | undefined;
/**
 * Fired when the form view is canceled.
 *
 * @eventName ~BookmarkFormView#cancel
 */
export type BookmarkFormViewCancelEvent = {
    name: 'cancel';
    args: [];
};

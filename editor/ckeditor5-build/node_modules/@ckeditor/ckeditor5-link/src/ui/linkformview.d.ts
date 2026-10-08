/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/ui/linkformview
 */
import { ButtonView, LabeledFieldView, View, ViewCollection, type InputTextView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../theme/linkform.css';
/**
 * The link form view.
 */
export declare class LinkFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView: ButtonView;
    /**
     * The Save button view.
     */
    saveButtonView: ButtonView;
    /**
     * The "Displayed text" input view.
     */
    displayedTextInputView: LabeledFieldView<InputTextView>;
    /**
     * The URL input view.
     */
    urlInputView: LabeledFieldView<InputTextView>;
    /**
     * A collection of child views.
     */
    readonly children: ViewCollection;
    /**
     * A collection of child views in the providers list.
     */
    readonly providersListChildren: ViewCollection<ButtonView>;
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
     * Creates an instance of the {@link module:link/ui/linkformview~LinkFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param validators  Form validators used by {@link #isValid}.
     */
    constructor(locale: Locale, validators: Array<LinkFormValidatorCallback>);
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
     * Cleans up the supplementary error and information text of the {@link #urlInputView}
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
     * Creates a save button view that inserts the link.
     */
    private _createSaveButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
    /**
     * Creates a view for the providers list.
     */
    private _createProvidersListView;
    /**
     * Creates a labeled input view for the "Displayed text" field.
     */
    private _createDisplayedTextInput;
    /**
     * Creates a labeled input view for the URL field.
     *
     * @returns Labeled field view instance.
     */
    private _createUrlInput;
    /**
     * Populates the {@link #children} collection of the form.
     */
    private _createFormChildren;
    /**
     * The native DOM `value` of the {@link #urlInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get url(): string | null;
}
/**
 * Callback used by {@link ~LinkFormView} to check if passed form value is valid.
 *
 * 	* If `undefined` is returned, it is assumed that the form value is correct and there is no error.
 * 	* If string is returned, it is assumed that the form value is incorrect and the returned string is displayed in the error label
 */
export type LinkFormValidatorCallback = (form: LinkFormView) => string | undefined;
/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * for example with a click on {@link ~LinkFormView#saveButtonView}.
 *
 * @eventName ~LinkFormView#submit
 */
export type LinkFormSubmitEvent = {
    name: 'submit';
    args: [];
};
/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkFormView#backButtonView}.
 *
 * @eventName ~LinkFormView#cancel
 */
export type LinkFormCancelEvent = {
    name: 'cancel';
    args: [];
};

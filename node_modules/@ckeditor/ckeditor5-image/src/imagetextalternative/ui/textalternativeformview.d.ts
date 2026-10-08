/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagetextalternative/ui/textalternativeformview
 */
import { ButtonView, FocusCycler, LabeledFieldView, View, ViewCollection, type InputView, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '../../../theme/textalternativeform.css';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
/**
 * The TextAlternativeFormView class.
 *
 * @internal
 */
export declare class TextAlternativeFormView extends View {
    /**
     * Tracks information about the DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * An input with a label.
     */
    labeledInput: LabeledFieldView<InputView>;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView: ButtonView;
    /**
     * A button used to submit the form.
     */
    saveButtonView: ButtonView;
    /**
     * A collection of child views.
     */
    readonly children: ViewCollection;
    /**
     * A collection of views which can be focused in the form.
     */
    protected readonly _focusables: ViewCollection<FocusableView>;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates a back button view that cancels the form.
     */
    private _createBackButton;
    /**
     * Creates a save button view that text alternative the image.
     */
    private _createSaveButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
    /**
     * Creates an input with a label.
     *
     * @returns Labeled field view instance.
     */
    private _createLabeledInputView;
}
/**
 * Fired when the form view is submitted.
 *
 * @eventName ~TextAlternativeFormView#submit
 * @internal
 */
export type TextAlternativeFormViewSubmitEvent = {
    name: 'submit';
    args: [];
};
/**
 * Fired when the form view is canceled.
 *
 * @eventName ~TextAlternativeFormView#cancel
 * @internal
 */
export type TextAlternativeFormViewCancelEvent = {
    name: 'cancel';
    args: [];
};

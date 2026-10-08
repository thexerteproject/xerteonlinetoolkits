/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module bookmark/ui/bookmarkformview
 */
import { ButtonView, FocusCycler, FormRowView, LabeledFieldView, View, ViewCollection, createLabeledInputText, submitHandler, FormHeaderView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';
// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../theme/bookmarkform.css';
/**
 * The bookmark form view controller class.
 *
 * See {@link module:bookmark/ui/bookmarkformview~BookmarkFormView}.
 */
export class BookmarkFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    focusTracker = new FocusTracker();
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes = new KeystrokeHandler();
    /**
     * The ID input view.
     */
    idInputView;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView;
    /**
     * A button used to submit the form.
     */
    saveButtonView;
    /**
     * A collection of form child views in the form.
     */
    children;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    _validators;
    /**
     * A collection of views that can be focused in the form.
     */
    _focusables = new ViewCollection();
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    _focusCycler;
    /**
     * Creates an instance of the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param validators  Form validators used by {@link #isValid}.
     */
    constructor(locale, validators) {
        super(locale);
        this._validators = validators;
        // Create buttons.
        this.backButtonView = this._createBackButton();
        this.saveButtonView = this._createSaveButton();
        // Create input fields.
        this.idInputView = this._createIdInput();
        this.children = this.createCollection([this._createHeaderView()]);
        this.children.add(new FormRowView(locale, {
            children: [
                this.idInputView,
                this.saveButtonView
            ],
            class: [
                'ck-form__row_with-submit',
                'ck-form__row_large-top-padding'
            ]
        }));
        // Close the panel on esc key press when the **form has focus**.
        this.keystrokes.set('Esc', (data, cancel) => {
            this.fire('cancel');
            cancel();
        });
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-bookmark-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        submitHandler({
            view: this
        });
        const childViews = [
            this.backButtonView,
            this.idInputView,
            this.saveButtonView
        ];
        childViews.forEach(v => {
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus() {
        this.idInputView.focus();
    }
    /**
     * Validates the form and returns `false` when some fields are invalid.
     */
    isValid() {
        this.resetFormStatus();
        for (const validator of this._validators) {
            const errorText = validator(this);
            // One error per field is enough.
            if (errorText) {
                // Apply updated error.
                this.idInputView.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
     * Cleans up the supplementary error and information text of the {@link #idInputView}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetFormStatus() {
        this.idInputView.errorText = null;
    }
    /**
     * Creates a back button view that cancels the form.
     */
    _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
     * Creates a save button view that saves the bookmark.
     */
    _createSaveButton() {
        const t = this.locale.t;
        const saveButton = new ButtonView(this.locale);
        saveButton.set({
            label: t('Save'),
            withText: true,
            type: 'submit',
            class: 'ck-button-action ck-button-bold'
        });
        return saveButton;
    }
    /**
     * Creates a header view for the form.
     */
    _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Bookmark')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
    /**
     * Creates a labeled input view.
     *
     * @returns Labeled field view instance.
     */
    _createIdInput() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        labeledInput.label = t('Bookmark name');
        labeledInput.infoText = t('Enter the bookmark name without spaces.');
        labeledInput.class = 'ck-labeled-field-view_full-width';
        return labeledInput;
    }
    /**
     * The native DOM `value` of the {@link #idInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get id() {
        const { element } = this.idInputView.fieldView;
        if (!element) {
            return null;
        }
        return element.value.trim();
    }
}

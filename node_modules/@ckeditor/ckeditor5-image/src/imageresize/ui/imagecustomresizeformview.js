/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageresize/ui/imagecustomresizeformview
 */
import { ButtonView, FocusCycler, FormHeaderView, FormRowView, LabeledFieldView, View, ViewCollection, createLabeledInputNumber, submitHandler } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';
import '../../../theme/imagecustomresizeform.css';
// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
/**
 * The ImageCustomResizeFormView class.
 *
 * @internal
 */
export class ImageCustomResizeFormView extends View {
    /**
     * Tracks information about the DOM focus in the form.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Resize unit shortcut.
     */
    unit;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView;
    /**
     * A button used to submit the form.
     */
    saveButtonView;
    /**
     * An input with a label.
     */
    labeledInput;
    /**
     * A collection of child views.
     */
    children;
    /**
     * A collection of views which can be focused in the form.
     */
    _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    _focusCycler;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    _validators;
    /**
     * @inheritDoc
     */
    constructor(locale, unit, validators) {
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.unit = unit;
        // Create buttons.
        this.backButtonView = this._createBackButton();
        this.saveButtonView = this._createSaveButton();
        // Create input fields.
        this.labeledInput = this._createLabeledInputView();
        this.children = this.createCollection([this._createHeaderView()]);
        this.children.add(new FormRowView(locale, {
            children: [
                this.labeledInput,
                this.saveButtonView
            ],
            class: [
                'ck-form__row_with-submit',
                'ck-form__row_large-top-padding'
            ]
        }));
        this._focusables = new ViewCollection();
        this._validators = validators;
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
                    'ck-image-custom-resize-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-image/issues/40
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
            this.labeledInput,
            this.saveButtonView
        ];
        childViews.forEach(v => {
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
        });
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
     * Creates a save button view that resize the image.
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
            label: t('Image Resize')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
    /**
     * Creates an input with a label.
     *
     * @returns Labeled field view instance.
     */
    _createLabeledInputView() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputNumber);
        labeledInput.label = t('Resize image (in %0)', this.unit);
        labeledInput.class = 'ck-labeled-field-view_full-width';
        labeledInput.fieldView.set({
            step: 0.1
        });
        return labeledInput;
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
                this.labeledInput.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
     * Cleans up the supplementary error and information text of the {@link #labeledInput}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetFormStatus() {
        this.labeledInput.errorText = null;
    }
    /**
     * The native DOM `value` of the input element of {@link #labeledInput}.
     */
    get rawSize() {
        const { element } = this.labeledInput.fieldView;
        if (!element) {
            return null;
        }
        return element.value;
    }
    /**
     * Get numeric value of size. Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
     */
    get parsedSize() {
        const { rawSize } = this;
        if (rawSize === null) {
            return null;
        }
        const parsed = Number.parseFloat(rawSize);
        if (Number.isNaN(parsed)) {
            return null;
        }
        return parsed;
    }
    /**
     * Returns serialized image input size with unit.
     * Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
     */
    get sizeWithUnits() {
        const { parsedSize, unit } = this;
        if (parsedSize === null) {
            return null;
        }
        return `${parsedSize}${unit}`;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module media-embed/ui/mediaformview
 */
import { LabeledFieldView, View, createLabeledInputText, submitHandler } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/mediaform.css';
/**
 * The media form view controller class.
 *
 * See {@link module:media-embed/ui/mediaformview~MediaFormView}.
 */
export class MediaFormView extends View {
    /**
     * Tracks information about the DOM focus in the form.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * The URL input view.
     */
    urlInputView;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    _validators;
    /**
     * The default info text for the {@link #urlInputView}.
     */
    _urlInputViewInfoDefault;
    /**
     * The info text with an additional tip for the {@link #urlInputView},
     * displayed when the input has some value.
     */
    _urlInputViewInfoTip;
    /**
     * @param validators Form validators used by {@link #isValid}.
     * @param locale The localization services instance.
     */
    constructor(validators, locale) {
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.set('mediaURLInputValue', '');
        this.urlInputView = this._createUrlInput();
        this._validators = validators;
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-media-form',
                    'ck-responsive-form'
                ],
                tabindex: '-1'
            },
            children: [
                this.urlInputView
            ]
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
        // Register the view in the focus tracker.
        this.focusTracker.add(this.urlInputView.element);
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
     * Focuses the {@link #urlInputView}.
     */
    focus() {
        this.urlInputView.focus();
    }
    /**
     * The native DOM `value` of the {@link #urlInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get url() {
        return this.urlInputView.fieldView.element.value.trim();
    }
    set url(url) {
        this.urlInputView.fieldView.value = url.trim();
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
                this.urlInputView.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
     * Cleans up the supplementary error and information text of the {@link #urlInputView}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetFormStatus() {
        this.urlInputView.errorText = null;
        this.urlInputView.infoText = this._urlInputViewInfoDefault;
    }
    /**
     * Creates a labeled input view.
     *
     * @returns Labeled input view instance.
     */
    _createUrlInput() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        const inputField = labeledInput.fieldView;
        this._urlInputViewInfoDefault = t('Paste the media URL in the input.');
        this._urlInputViewInfoTip = t('Tip: Paste the URL into the content to embed faster.');
        labeledInput.label = t('Media URL');
        labeledInput.infoText = this._urlInputViewInfoDefault;
        inputField.inputMode = 'url';
        inputField.on('input', () => {
            // Display the tip text only when there is some value. Otherwise fall back to the default info text.
            labeledInput.infoText = inputField.element.value ? this._urlInputViewInfoTip : this._urlInputViewInfoDefault;
            this.mediaURLInputValue = inputField.element.value.trim();
        });
        return labeledInput;
    }
}

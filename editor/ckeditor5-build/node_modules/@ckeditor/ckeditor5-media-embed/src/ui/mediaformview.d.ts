/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module media-embed/ui/mediaformview
 */
import { type InputTextView, LabeledFieldView, View } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/mediaform.css';
/**
 * The media form view controller class.
 *
 * See {@link module:media-embed/ui/mediaformview~MediaFormView}.
 */
export declare class MediaFormView extends View {
    /**
     * Tracks information about the DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The value of the URL input.
     */
    mediaURLInputValue: string;
    /**
     * The URL input view.
     */
    urlInputView: LabeledFieldView<InputTextView>;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    private readonly _validators;
    /**
     * The default info text for the {@link #urlInputView}.
     */
    private _urlInputViewInfoDefault?;
    /**
     * The info text with an additional tip for the {@link #urlInputView},
     * displayed when the input has some value.
     */
    private _urlInputViewInfoTip?;
    /**
     * @param validators Form validators used by {@link #isValid}.
     * @param locale The localization services instance.
     */
    constructor(validators: Array<(v: MediaFormView) => string | undefined>, locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the {@link #urlInputView}.
     */
    focus(): void;
    /**
     * The native DOM `value` of the {@link #urlInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get url(): string;
    set url(url: string);
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
     * Creates a labeled input view.
     *
     * @returns Labeled input view instance.
     */
    private _createUrlInput;
}

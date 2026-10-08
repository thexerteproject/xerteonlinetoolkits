/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert/ui/imageinserturlview
 */
import { View, LabeledFieldView, type InputTextView } from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
/**
 * The insert an image via URL view.
 *
 * See {@link module:image/imageinsert/imageinsertviaurlui~ImageInsertViaUrlUI}.
 *
 * @internal
 */
export declare class ImageInsertUrlView extends View {
    /**
     * The URL input field view.
     */
    urlInputView: LabeledFieldView<InputTextView>;
    /**
     * The value of the URL input.
     *
     * @observable
     */
    imageURLInputValue: string;
    /**
     * Observable property used to alter labels while some image is selected and when it is not.
     *
     * @observable
     */
    isImageSelected: boolean;
    /**
     * Observable property indicating whether the form interactive elements should be enabled.
     *
     * @observable
     */
    isEnabled: boolean;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
     *
     * @param locale The localization services instance.
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
     * Creates the {@link #urlInputView}.
     */
    private _createUrlInputView;
    /**
     * Focuses the view.
     */
    focus(): void;
}

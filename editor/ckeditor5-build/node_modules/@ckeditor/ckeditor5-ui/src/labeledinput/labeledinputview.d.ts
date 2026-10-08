/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/labeledinput/labeledinputview
 */
import { View } from '../view.js';
import { LabelView } from '../label/labelview.js';
import type { InputView } from '../input/inputview.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/labeledinput/labeledinput.css';
/**
 * The labeled input view class.
 */
export declare class LabeledInputView extends View {
    /**
     * The label view.
     */
    readonly labelView: LabelView;
    /**
     * The input view.
     */
    readonly inputView: InputView;
    /**
     * The status view for the {@link #inputView}. It displays {@link #errorText} and
     * {@link #infoText}.
     */
    readonly statusView: View;
    /**
     * The text of the label.
     *
     * @observable
     */
    label: string | undefined;
    /**
     * The value of the input.
     *
     * @observable
     */
    value: string | undefined;
    /**
     * Controls whether the component is in read-only mode.
     *
     * @observable
     */
    isReadOnly: boolean;
    /**
     * The validation error text. When set, it will be displayed
     * next to the {@link #inputView} as a typical validation error message.
     * Set it to `null` to hide the message.
     *
     * **Note:** Setting this property to anything but `null` will automatically
     * make the {@link module:ui/inputtext/inputtextview~InputTextView#hasError `hasError`}
     * of the {@link #inputView} `true`.
     *
     * **Note:** Typing in the {@link #inputView} which fires the
     * {@link module:ui/inputtext/inputtextview~InputTextView#event:input `input` event}
     * resets this property back to `null`, indicating that the input field can be re–validated.
     *
     * @observable
     */
    errorText: string | null;
    /**
     * The additional information text displayed next to the {@link #inputView} which can
     * be used to inform the user about the purpose of the input, provide help or hints.
     *
     * Set it to `null` to hide the message.
     *
     * **Note:** This text will be displayed in the same place as {@link #errorText} but the
     * latter always takes precedence: if the {@link #errorText} is set, it replaces
     * {@link #errorText} for as long as the value of the input is invalid.
     *
     * @observable
     */
    infoText: string | null;
    /**
     * The combined status text made of {@link #errorText} and {@link #infoText}.
     * Note that when present, {@link #errorText} always takes precedence in the
     * status.
     *
     * @see #errorText
     * @see #infoText
     * @see #statusView
     * @private
     * @observable
     */
    _statusText: string | null;
    /**
     * Creates an instance of the labeled input view class.
     *
     * @param locale The locale instance.
     * @param InputView Constructor of the input view.
     */
    constructor(locale: Locale | undefined, InputView: new (locale: Locale | undefined, statusUid: string) => InputView);
    /**
     * Creates label view class instance and bind with view.
     *
     * @param id Unique id to set as labelView#for attribute.
     */
    private _createLabelView;
    /**
     * Creates input view class instance and bind with view.
     *
     * @param InputView Input view constructor.
     * @param inputUid Unique id to set as inputView#id attribute.
     * @param statusUid Unique id of the status for the input's `aria-describedby` attribute.
     */
    private _createInputView;
    /**
     * Creates the status view instance. It displays {@link #errorText} and {@link #infoText}
     * next to the {@link #inputView}. See {@link #_statusText}.
     *
     * @param statusUid Unique id of the status, shared with the input's `aria-describedby` attribute.
     */
    private _createStatusView;
    /**
     * Moves the focus to the input and selects the value.
     */
    select(): void;
    /**
     * Focuses the input.
     */
    focus(): void;
}

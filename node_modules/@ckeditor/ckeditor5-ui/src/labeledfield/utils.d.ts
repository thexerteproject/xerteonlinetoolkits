/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/labeledfield/utils
 */
import { InputTextView } from '../inputtext/inputtextview.js';
import { InputNumberView } from '../inputnumber/inputnumberview.js';
import { TextareaView } from '../textarea/textareaview.js';
import { type DropdownView } from '../dropdown/dropdownview.js';
import type { LabeledFieldViewCreator } from './labeledfieldview.js';
/**
 * A helper for creating labeled inputs.
 *
 * It creates an instance of a {@link module:ui/inputtext/inputtextview~InputTextView input text} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets input's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isReadOnly` to the labeled view.
 * * It binds input's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the input.
 *
 * Usage:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );
 * console.log( labeledInputView.fieldView ); // A text input instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the input.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the input.
 * @returns The input text view instance.
 */
declare const createLabeledInputText: LabeledFieldViewCreator<InputTextView>;
/**
 * A helper for creating labeled number inputs.
 *
 * It creates an instance of a {@link module:ui/inputnumber/inputnumberview~InputNumberView input number} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets input's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isReadOnly` to the labeled view.
 * * It binds input's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the input.
 *
 * Usage:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledInputNumber );
 * console.log( labeledInputView.fieldView ); // A number input instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the input.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the input.
 * @returns The input number view instance.
 */
declare const createLabeledInputNumber: LabeledFieldViewCreator<InputNumberView>;
/**
 * A helper for creating labeled textarea.
 *
 * It creates an instance of a {@link module:ui/textarea/textareaview~TextareaView textarea} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets textarea's `id` and `ariaDescribedById` attributes.
 * * It binds textarea's `isReadOnly` to the labeled view.
 * * It binds textarea's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the textarea.
 *
 * Usage:
 *
 * ```ts
 * const labeledTextarea = new LabeledFieldView( locale, createLabeledTextarea );
 * console.log( labeledTextarea.fieldView ); // A textarea instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view's label} and the textarea.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view's status} and the textarea.
 * @returns The textarea view instance.
 */
declare const createLabeledTextarea: LabeledFieldViewCreator<TextareaView>;
/**
 * A helper for creating labeled dropdowns.
 *
 * It creates an instance of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown} that is
 * logically related to a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled field view}.
 *
 * The helper does the following:
 *
 * * It sets dropdown's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isEnabled` to the labeled view.
 *
 * Usage:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, createLabeledDropdown );
 * console.log( labeledInputView.fieldView ); // A dropdown instance.
 * ```
 *
 * @param labeledFieldView The instance of the labeled field view.
 * @param viewUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#labelView labeled view label} and the dropdown.
 * @param statusUid A UID string that allows DOM logical connection between the
 * {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView#statusView labeled view status} and the dropdown.
 * @returns The dropdown view instance.
 */
declare const createLabeledDropdown: LabeledFieldViewCreator<DropdownView>;
export { createLabeledInputNumber, createLabeledInputText, createLabeledTextarea, createLabeledDropdown };

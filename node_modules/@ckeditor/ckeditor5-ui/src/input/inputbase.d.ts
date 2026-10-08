/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/input/inputbase
 */
import { View } from '../view.js';
import { FocusTracker, type Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The base input view class.
 */
export declare abstract class InputBase<TElement extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends View<TElement> {
    /**
     * Stores information about the editor UI focus and propagates it so various plugins and components
     * are unified as a focus group.
     */
    readonly focusTracker: FocusTracker;
    /**
     * The value of the input.
     *
     * @observable
     */
    value: string | undefined;
    /**
     * The `id` attribute of the input (i.e. to pair with a `<label>` element).
     *
     * @observable
     */
    id: string | undefined;
    /**
     * The `placeholder` attribute of the input.
     *
     * @observable
     */
    placeholder: string | undefined;
    /**
     * The `tabindex` attribute of the input.
     *
     * @observable
     */
    tabIndex: number | undefined;
    /**
     * The `aria-label` attribute of the input.
     *
     * @observable
     */
    ariaLabel: string | undefined;
    /**
     * Controls whether the input view is in read-only mode.
     *
     * @observable
     */
    isReadOnly: boolean;
    /**
     * Set to `true` when the field has some error. Usually controlled via
     * {@link module:ui/labeledinput/labeledinputview~LabeledInputView#errorText}.
     *
     * @observable
     */
    hasError: boolean;
    /**
     * The `id` of the element describing this field, e.g. when it has
     * some error; it helps screen readers read the error text.
     *
     * @observable
     */
    ariaDescribedById: string | undefined;
    /**
     * An observable flag set to `true` when the input is currently focused by the user.
     * Set to `false` otherwise.
     *
     * @readonly
     * @observable
     * @default false
     */
    isFocused: boolean;
    /**
     * An observable flag set to `true` when the input contains no text, i.e.
     * when {@link #value} is `''`, `null`, or `false`.
     *
     * @readonly
     * @observable
     * @default true
     */
    isEmpty: boolean;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Moves the focus to the input and selects the value.
     */
    select(): void;
    /**
     * Focuses the input.
     */
    focus(): void;
    /**
     * Resets the value of the input
     */
    reset(): void;
    /**
     * Updates the {@link #isEmpty} property value on demand.
     */
    protected _updateIsEmpty(): void;
    /**
     * Sets the `value` property of the {@link #element DOM element} on demand.
     */
    private _setDomElementValue;
}

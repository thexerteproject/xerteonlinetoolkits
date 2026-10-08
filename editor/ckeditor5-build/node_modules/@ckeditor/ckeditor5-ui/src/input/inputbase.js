/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/input/inputbase
 */
import { View } from '../view.js';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';
/**
 * The base input view class.
 */
export class InputBase extends View {
    /**
     * Stores information about the editor UI focus and propagates it so various plugins and components
     * are unified as a focus group.
     */
    focusTracker;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.set('value', undefined);
        this.set('id', undefined);
        this.set('placeholder', undefined);
        this.set('tabIndex', undefined);
        this.set('isReadOnly', false);
        this.set('hasError', false);
        this.set('ariaDescribedById', undefined);
        this.set('ariaLabel', undefined);
        this.focusTracker = new FocusTracker();
        this.bind('isFocused').to(this.focusTracker);
        this.set('isEmpty', true);
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'input',
            attributes: {
                class: [
                    'ck',
                    'ck-input',
                    bind.if('isFocused', 'ck-input_focused'),
                    bind.if('isEmpty', 'ck-input-text_empty'),
                    bind.if('hasError', 'ck-error')
                ],
                id: bind.to('id'),
                placeholder: bind.to('placeholder'),
                tabindex: bind.to('tabIndex'),
                readonly: bind.to('isReadOnly'),
                'aria-invalid': bind.if('hasError', true),
                'aria-describedby': bind.to('ariaDescribedById'),
                'aria-label': bind.to('ariaLabel')
            },
            on: {
                input: bind.to((...args) => {
                    this.fire('input', ...args);
                    this._updateIsEmpty();
                }),
                change: bind.to(this._updateIsEmpty.bind(this))
            }
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.focusTracker.add(this.element);
        this._setDomElementValue(this.value);
        this._updateIsEmpty();
        // Bind `this.value` to the DOM element's value.
        // We cannot use `value` DOM attribute because removing it on Edge does not clear the DOM element's value property.
        this.on('change:value', (evt, name, value) => {
            this._setDomElementValue(value);
            this._updateIsEmpty();
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
    }
    /**
     * Moves the focus to the input and selects the value.
     */
    select() {
        this.element.select();
    }
    /**
     * Focuses the input.
     */
    focus() {
        this.element.focus();
    }
    /**
     * Resets the value of the input
     */
    reset() {
        this.value = this.element.value = '';
        this._updateIsEmpty();
    }
    /**
     * Updates the {@link #isEmpty} property value on demand.
     */
    _updateIsEmpty() {
        this.isEmpty = isInputElementEmpty(this.element);
    }
    /**
     * Sets the `value` property of the {@link #element DOM element} on demand.
     */
    _setDomElementValue(value) {
        this.element.value = (!value && value !== 0) ? '' : value;
    }
}
function isInputElementEmpty(domElement) {
    return !domElement.value;
}

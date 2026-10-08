/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/inputnumber/inputnumberview
 */
import { InputView } from '../input/inputview.js';
/**
 * The number input view class.
 */
export class InputNumberView extends InputView {
    /**
     * Creates an instance of the input number view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param options The options of the input.
     * @param options.min The value of the `min` DOM attribute (the lowest accepted value).
     * @param options.max The value of the `max` DOM attribute (the highest accepted value).
     * @param options.step The value of the `step` DOM attribute.
     */
    constructor(locale, { min, max, step } = {}) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('min', min);
        this.set('max', max);
        this.set('step', step);
        this.extendTemplate({
            attributes: {
                type: 'number',
                class: [
                    'ck-input-number'
                ],
                min: bind.to('min'),
                max: bind.to('max'),
                step: bind.to('step')
            }
        });
    }
}

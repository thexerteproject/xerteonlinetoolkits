/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/inputtext/inputtextview
 */
import { InputView } from '../input/inputview.js';
/**
 * The text input view class.
 */
export class InputTextView extends InputView {
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.extendTemplate({
            attributes: {
                type: 'text',
                class: [
                    'ck-input-text'
                ]
            }
        });
    }
}

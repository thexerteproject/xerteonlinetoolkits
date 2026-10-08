/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { InputBase } from './inputbase.js';
import '../../theme/components/input/input.css';
/**
 * The input view class.
 */
export class InputView extends InputBase {
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.set('inputMode', 'text');
        const bind = this.bindTemplate;
        this.extendTemplate({
            attributes: {
                inputmode: bind.to('inputMode')
            }
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { HighlightedTextView } from './highlightedtextview.js';
/**
 * A button label view that can highlight a text fragment.
 */
export class ButtonLabelWithHighlightView extends HighlightedTextView {
    /**
     * @inheritDoc
     */
    constructor() {
        super();
        this.set({
            style: undefined,
            text: undefined,
            id: undefined
        });
        const bind = this.bindTemplate;
        this.extendTemplate({
            attributes: {
                class: [
                    'ck-button__label'
                ],
                style: bind.to('style'),
                id: bind.to('id')
            }
        });
    }
}

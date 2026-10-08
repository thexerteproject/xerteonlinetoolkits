/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dialog/dialogcontentview
 */
import { View } from '../view.js';
/**
 * A dialog content view class.
 */
export class DialogContentView extends View {
    /**
     * A collection of content items.
     */
    children;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.children = this.createCollection();
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-dialog__content']
            },
            children: this.children
        });
    }
    /**
     * Removes all the child views.
     */
    reset() {
        while (this.children.length) {
            this.children.remove(0);
        }
    }
}

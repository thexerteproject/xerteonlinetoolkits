/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/list/listitemview
 */
import { View } from '../view.js';
/**
 * The list item view class.
 */
export class ListItemView extends View {
    /**
     * Collection of the child views inside of the list item {@link #element}.
     */
    children;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('isVisible', true);
        this.children = this.createCollection();
        this.setTemplate({
            tag: 'li',
            attributes: {
                class: [
                    'ck',
                    'ck-list__item',
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ],
                role: 'presentation'
            },
            children: this.children
        });
    }
    /**
     * Focuses the list item.
     */
    focus() {
        if (this.children.first) {
            this.children.first.focus();
        }
    }
}

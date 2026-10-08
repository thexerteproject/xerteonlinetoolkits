/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ListView } from '../../list/listview.js';
/**
 * Represents a dropdown menu list view.
 */
export class DropdownMenuListView extends ListView {
    /**
     * Creates an instance of the dropdown menu list view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.role = 'menu';
        this.set('isVisible', true);
        this.extendTemplate({
            attributes: {
                class: [
                    'ck-dropdown-menu-list',
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ]
            }
        });
    }
}

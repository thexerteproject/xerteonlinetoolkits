/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ButtonView } from '../../button/buttonview.js';
import '../../../theme/components/dropdown/menu/dropdownmenulistitembutton.css';
/**
 * Represents a view for a button in a dropdown menu list item.
 */
export class DropdownMenuListItemButtonView extends ButtonView {
    id;
    constructor(locale, id, label) {
        super(locale);
        this.id = id;
        this.set({
            withText: true,
            withKeystroke: true,
            tooltip: false,
            role: 'menuitem',
            label
        });
        this.extendTemplate({
            attributes: {
                class: [
                    'ck-dropdown-menu-list__nested-menu__item__button'
                ]
            }
        });
    }
}

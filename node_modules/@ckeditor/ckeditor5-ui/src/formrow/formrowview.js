/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/formrow/formrowview
 */
import { View } from '../view.js';
import { toArray } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/formrow/formrow.css';
/**
 * The class representing a single row in a form,
 */
export class FormRowView extends View {
    /**
     * A collection of row items (buttons, dropdowns, etc.).
     */
    children;
    /**
     * Creates an instance of the form row class.
     *
     * @param locale The locale instance.
     * @param options.labelView When passed, the row gets the `group` and `aria-labelledby`
     * DOM attributes and gets described by the label.
     */
    constructor(locale, options = {}) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('class', [
            'ck',
            'ck-form__row',
            ...toArray(options.class || [])
        ]);
        this.children = this.createCollection();
        if (options.children) {
            options.children.forEach(child => this.children.add(child));
        }
        this.set('_role', null);
        this.set('_ariaLabelledBy', null);
        if (options.labelView) {
            this.set({
                _role: 'group',
                _ariaLabelledBy: options.labelView.id
            });
        }
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: bind.to('class', classes => classes.join(' ')),
                role: bind.to('_role'),
                'aria-labelledby': bind.to('_ariaLabelledBy')
            },
            children: this.children
        });
    }
}

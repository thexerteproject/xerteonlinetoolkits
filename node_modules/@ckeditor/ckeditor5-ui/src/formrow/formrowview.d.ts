/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/formrow/formrowview
 */
import { View } from '../view.js';
import { type ViewCollection } from '../viewcollection.js';
import { type LabelView } from '../label/labelview.js';
import { type ArrayOrItem, type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/formrow/formrow.css';
/**
 * The class representing a single row in a form,
 */
export declare class FormRowView extends View {
    /**
     * An additional CSS class added to the {@link #element}.
     *
     * @observable
     */
    class: Array<string>;
    /**
     * A collection of row items (buttons, dropdowns, etc.).
     */
    readonly children: ViewCollection;
    /**
     * The role property reflected by the `role` DOM attribute of the {@link #element}.
     *
     * **Note**: Used only when a `labelView` is passed to constructor `options`.
     *
     * @observable
     * @internal
     */
    _role: string | null;
    /**
     * The ARIA property reflected by the `aria-labelledby` DOM attribute of the {@link #element}.
     *
     * **Note**: Used only when a `labelView` is passed to constructor `options`.
     *
     * @observable
     * @internal
     */
    _ariaLabelledBy: string | null;
    /**
     * Creates an instance of the form row class.
     *
     * @param locale The locale instance.
     * @param options.labelView When passed, the row gets the `group` and `aria-labelledby`
     * DOM attributes and gets described by the label.
     */
    constructor(locale: Locale, options?: {
        children?: Array<View>;
        class?: ArrayOrItem<string>;
        labelView?: LabelView;
    });
}

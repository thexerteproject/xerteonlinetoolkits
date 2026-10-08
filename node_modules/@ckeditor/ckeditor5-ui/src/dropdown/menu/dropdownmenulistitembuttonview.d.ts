/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/dropdownmenulistitembuttonview
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView } from '../../button/buttonview.js';
import '../../../theme/components/dropdown/menu/dropdownmenulistitembutton.css';
/**
 * Represents a view for a button in a dropdown menu list item.
 */
export declare class DropdownMenuListItemButtonView extends ButtonView {
    readonly id: string;
    constructor(locale: Locale, id: string, label: string);
}

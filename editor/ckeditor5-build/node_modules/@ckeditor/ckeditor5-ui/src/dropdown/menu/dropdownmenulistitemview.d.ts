/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/dropdownmenulistitemview
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
import { type DropdownMenuNestedMenuView } from './dropdownmenunestedmenuview.js';
import { ListItemView } from '../../list/listitemview.js';
import { DropdownMenuListItemButtonView } from './dropdownmenulistitembuttonview.js';
import '../../../theme/components/dropdown/menu/dropdownmenulistitem.css';
/**
 * Represents a view for a single item in a dropdown menu list.
 */
export declare class DropdownMenuListItemView extends ListItemView {
    /**
     * The view representing either a flat item or a nested menu in a dropdown menu list item.
     */
    readonly childView: DropdownMenuNestedMenuView | DropdownMenuListItemButtonView;
    constructor(locale: Locale, parentMenuView: DropdownMenuNestedMenuView | null, childView: DropdownMenuNestedMenuView | DropdownMenuListItemButtonView);
}

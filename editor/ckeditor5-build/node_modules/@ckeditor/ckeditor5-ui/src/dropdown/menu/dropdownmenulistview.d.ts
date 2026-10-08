/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
import { ListView } from '../../list/listview.js';
/**
 * Represents a dropdown menu list view.
 */
export declare class DropdownMenuListView extends ListView {
    /**
     * Represents whether the dropdown menu list view is visible or not.
     */
    isVisible: boolean;
    /**
     * Creates an instance of the dropdown menu list view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
}

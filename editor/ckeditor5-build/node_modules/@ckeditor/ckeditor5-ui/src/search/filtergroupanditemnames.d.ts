/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type ViewCollection } from '../viewcollection.js';
import { type ListItemGroupView } from '../list/listitemgroupview.js';
import { type ListItemView } from '../list/listitemview.js';
import { type ListSeparatorView } from '../list/listseparatorview.js';
/**
 * A filter function that returns matching item and group names in the list view.
 */
export declare function filterGroupAndItemNames(regExp: RegExp | null, items: ViewCollection<ListItemGroupView | ListItemView | ListSeparatorView>): {
    resultsCount: number;
    totalItemsCount: number;
};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/list/listitemview
 */
import { View } from '../view.js';
import type { FocusableView } from '../focuscycler.js';
import { type ViewCollection } from '../viewcollection.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The list item view class.
 */
export declare class ListItemView extends View {
    /**
     * Collection of the child views inside of the list item {@link #element}.
     */
    readonly children: ViewCollection<FocusableView>;
    /**
     * Controls whether the item view is visible. Visible by default, list items are hidden
     * using a CSS class.
     *
     * @observable
     * @default true
     */
    isVisible: boolean;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * Focuses the list item.
     */
    focus(): void;
}

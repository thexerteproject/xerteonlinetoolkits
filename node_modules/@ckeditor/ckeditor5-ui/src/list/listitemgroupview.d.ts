/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/list/listitemgroupview
 */
import { View } from '../view.js';
import { type ViewCollection } from '../viewcollection.js';
import { ListView } from './listview.js';
import { LabelView } from '../label/labelview.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The list item group view class.
 */
export declare class ListItemGroupView extends View {
    /**
     * The visible label of the group.
     *
     * @observable
     * @default ''
     */
    label: string;
    /**
     * Label of the group view. Its text is configurable using the {@link #label label attribute}.
     *
     * If a custom label view is not passed in `ListItemGroupView` constructor, the label is an instance
     * of {@link module:ui/label/labelview~LabelView}.
     */
    readonly labelView: LabelView;
    /**
     * Collection of the child list items inside this group.
     */
    readonly items: ListView['items'];
    /**
     * Collection of the child elements of the group.
     */
    readonly children: ViewCollection;
    /**
     * Controls whether the item view is visible. Visible by default, list items are hidden
     * using a CSS class.
     *
     * @observable
     * @default true
     */
    isVisible: boolean;
    /**
     * Creates an instance of the list item group view class.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param labelView The instance of the group's label. If not provided, an instance of
     * {@link module:ui/label/labelview~LabelView} is used.
     */
    constructor(locale?: Locale, labelView?: LabelView);
    /**
     * Focuses the list item (which is not a separator).
     */
    focus(): void;
}

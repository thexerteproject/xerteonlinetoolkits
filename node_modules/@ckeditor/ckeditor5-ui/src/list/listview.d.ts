/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/list/listview
 */
import { View } from '../view.js';
import { type FocusableView } from '../focuscycler.js';
import { ListItemView } from './listitemview.js';
import { ListItemGroupView } from './listitemgroupview.js';
import { type ListSeparatorView } from './listseparatorview.js';
import { type DropdownPanelFocusable } from '../dropdown/dropdownpanelfocusable.js';
import { ViewCollection } from '../viewcollection.js';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/list/list.css';
/**
 * The list view class.
 */
export declare class ListView extends View<HTMLUListElement> implements DropdownPanelFocusable {
    /**
     * The collection of focusable views in the list. It is used to determine accessible navigation
     * between the {@link module:ui/list/listitemview~ListItemView list items} and
     * {@link module:ui/list/listitemgroupview~ListItemGroupView list groups}.
     */
    readonly focusables: ViewCollection<FocusableView>;
    /**
     * Collection of the child list views.
     */
    readonly items: ViewCollection<ListItemView | ListItemGroupView | ListSeparatorView>;
    /**
     * Tracks information about DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Label used by assistive technologies to describe this list element.
     *
     * @observable
     */
    ariaLabel: string | undefined;
    /**
     * (Optional) The ARIA property reflected by the `aria-ariaLabelledBy` DOM attribute used by assistive technologies.
     *
     * @observable
     */
    ariaLabelledBy?: string | undefined;
    /**
     * The property reflected by the `role` DOM attribute to be used by assistive technologies.
     *
     * @observable
     */
    role: string | undefined;
    /**
     * Helps cycling over focusable {@link #items} in the list.
     */
    private readonly _focusCycler;
    /**
     * A cached map of {@link module:ui/list/listitemgroupview~ListItemGroupView} to `change` event listeners for their `items`.
     * Used for accessibility and keyboard navigation purposes.
     */
    private readonly _listItemGroupToChangeListeners;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focus(): void;
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focusFirst(): void;
    /**
     * Focuses the last focusable in {@link #items}.
     */
    focusLast(): void;
    /**
     * Registers a list item view in the focus tracker.
     *
     * @param item The list item view to be registered.
     * @param index Index of the list item view in the {@link #items} collection. If not specified, the item will be added at the end.
     */
    private _registerFocusableListItem;
    /**
     * Removes a list item view from the focus tracker.
     *
     * @param item The list item view to be removed.
     */
    private _deregisterFocusableListItem;
    /**
     * Gets a callback that will be called when the `items` collection of a {@link module:ui/list/listitemgroupview~ListItemGroupView}
     * change.
     *
     * @param groupView The group view for which the callback will be created.
     * @returns The callback function to be used for the items `change` event listener in a group.
     */
    private _getOnGroupItemsChangeCallback;
    /**
     * Registers a list item group view (and its children) in the focus tracker.
     *
     * @param groupView A group view to be registered.
     * @param groupIndex Index of the group view in the {@link #items} collection. If not specified, the group will be added at the end.
     */
    private _registerFocusableItemsGroup;
    /**
     * Removes a list item group view (and its children) from the focus tracker.
     *
     * @param groupView The group view to be removed.
     */
    private _deregisterFocusableItemsGroup;
}

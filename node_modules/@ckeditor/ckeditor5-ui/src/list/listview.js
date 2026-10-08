/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/list/listview
 */
import { View } from '../view.js';
import { FocusCycler } from '../focuscycler.js';
import { ListItemView } from './listitemview.js';
import { ListItemGroupView } from './listitemgroupview.js';
import { ViewCollection } from '../viewcollection.js';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/list/list.css';
/**
 * The list view class.
 */
export class ListView extends View {
    /**
     * The collection of focusable views in the list. It is used to determine accessible navigation
     * between the {@link module:ui/list/listitemview~ListItemView list items} and
     * {@link module:ui/list/listitemgroupview~ListItemGroupView list groups}.
     */
    focusables;
    /**
     * Collection of the child list views.
     */
    items;
    /**
     * Tracks information about DOM focus in the list.
     */
    focusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Helps cycling over focusable {@link #items} in the list.
     */
    _focusCycler;
    /**
     * A cached map of {@link module:ui/list/listitemgroupview~ListItemGroupView} to `change` event listeners for their `items`.
     * Used for accessibility and keyboard navigation purposes.
     */
    _listItemGroupToChangeListeners = new WeakMap();
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.focusables = new ViewCollection();
        this.items = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._focusCycler = new FocusCycler({
            focusables: this.focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate list items backwards using the arrowup key.
                focusPrevious: 'arrowup',
                // Navigate toolbar items forwards using the arrowdown key.
                focusNext: 'arrowdown'
            }
        });
        this.set('ariaLabel', undefined);
        this.set('ariaLabelledBy', undefined);
        this.set('role', undefined);
        this.setTemplate({
            tag: 'ul',
            attributes: {
                class: [
                    'ck',
                    'ck-reset',
                    'ck-list'
                ],
                role: bind.to('role'),
                'aria-label': bind.to('ariaLabel'),
                'aria-labelledby': bind.to('ariaLabelledBy')
            },
            children: this.items
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        // Items added before rendering should be known to the #focusTracker.
        for (const item of this.items) {
            if (item instanceof ListItemGroupView) {
                this._registerFocusableItemsGroup(item);
            }
            else if (item instanceof ListItemView) {
                this._registerFocusableListItem(item);
            }
        }
        this.items.on('change', (evt, data) => {
            for (const removed of data.removed) {
                if (removed instanceof ListItemGroupView) {
                    this._deregisterFocusableItemsGroup(removed);
                }
                else if (removed instanceof ListItemView) {
                    this._deregisterFocusableListItem(removed);
                }
            }
            for (const added of Array.from(data.added).reverse()) {
                if (added instanceof ListItemGroupView) {
                    this._registerFocusableItemsGroup(added, data.index);
                }
                else {
                    this._registerFocusableListItem(added, data.index);
                }
            }
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focusFirst() {
        this._focusCycler.focusFirst();
    }
    /**
     * Focuses the last focusable in {@link #items}.
     */
    focusLast() {
        this._focusCycler.focusLast();
    }
    /**
     * Registers a list item view in the focus tracker.
     *
     * @param item The list item view to be registered.
     * @param index Index of the list item view in the {@link #items} collection. If not specified, the item will be added at the end.
     */
    _registerFocusableListItem(item, index) {
        this.focusTracker.add(item.element);
        this.focusables.add(item, index);
    }
    /**
     * Removes a list item view from the focus tracker.
     *
     * @param item The list item view to be removed.
     */
    _deregisterFocusableListItem(item) {
        this.focusTracker.remove(item.element);
        this.focusables.remove(item);
    }
    /**
     * Gets a callback that will be called when the `items` collection of a {@link module:ui/list/listitemgroupview~ListItemGroupView}
     * change.
     *
     * @param groupView The group view for which the callback will be created.
     * @returns The callback function to be used for the items `change` event listener in a group.
     */
    _getOnGroupItemsChangeCallback(groupView) {
        return (evt, data) => {
            for (const removed of data.removed) {
                this._deregisterFocusableListItem(removed);
            }
            for (const added of Array.from(data.added).reverse()) {
                this._registerFocusableListItem(added, this.items.getIndex(groupView) + data.index);
            }
        };
    }
    /**
     * Registers a list item group view (and its children) in the focus tracker.
     *
     * @param groupView A group view to be registered.
     * @param groupIndex Index of the group view in the {@link #items} collection. If not specified, the group will be added at the end.
     */
    _registerFocusableItemsGroup(groupView, groupIndex) {
        Array.from(groupView.items).forEach((child, childIndex) => {
            const registeredChildIndex = typeof groupIndex !== 'undefined' ? groupIndex + childIndex : undefined;
            this._registerFocusableListItem(child, registeredChildIndex);
        });
        const groupItemsChangeCallback = this._getOnGroupItemsChangeCallback(groupView);
        // Cache the reference to the callback in case the group is removed (see _deregisterFocusableItemsGroup()).
        this._listItemGroupToChangeListeners.set(groupView, groupItemsChangeCallback);
        groupView.items.on('change', groupItemsChangeCallback);
    }
    /**
     * Removes a list item group view (and its children) from the focus tracker.
     *
     * @param groupView The group view to be removed.
     */
    _deregisterFocusableItemsGroup(groupView) {
        for (const child of groupView.items) {
            this._deregisterFocusableListItem(child);
        }
        groupView.items.off('change', this._listItemGroupToChangeListeners.get(groupView));
        this._listItemGroupToChangeListeners.delete(groupView);
    }
}

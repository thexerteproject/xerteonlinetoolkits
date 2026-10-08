/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/dropdownmenunestedmenuview
 */
import { FocusTracker, KeystrokeHandler, type PositioningFunction, type Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../../focuscycler.js';
import { type BodyCollection } from '../../editorui/bodycollection.js';
import { DropdownMenuButtonView } from './dropdownmenubuttonview.js';
import { DropdownMenuListView } from './dropdownmenulistview.js';
import { View } from '../../view.js';
import { DropdownMenuNestedMenuPanelView, type DropdownMenuNestedMenuPanelPosition } from './dropdownmenunestedmenupanelview.js';
import '../../../theme/components/dropdown/menu/dropdownmenu.css';
/**
 * Represents a nested menu view.
 */
export declare class DropdownMenuNestedMenuView extends View implements FocusableView {
    /**
     * An array of delegated events for the dropdown menu definition controller.
     * These events are delegated to the dropdown menu element.
     */
    static readonly DELEGATED_EVENTS: readonly ["mouseenter", "execute", "change:isOpen"];
    readonly id: string;
    /**
     * Button of the menu view.
     */
    readonly buttonView: DropdownMenuButtonView;
    /**
     * Panel of the menu. It hosts children of the menu.
     */
    readonly panelView: DropdownMenuNestedMenuPanelView;
    /**
     * List of nested menu entries.
     */
    readonly listView: DropdownMenuListView;
    /**
     * Tracks information about the DOM focus in the menu.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
     * keystrokes of the menu.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Controls whether the menu is open, i.e. shows or hides the {@link #panelView panel}.
     *
     * @observable
     */
    isOpen: boolean;
    /**
     * Controls whether the menu is enabled, i.e. its {@link #buttonView} can be clicked.
     *
     * @observable
     */
    isEnabled: boolean;
    /**
     * (Optional) The additional CSS class set on the menu {@link #element}.
     *
     * @observable
     */
    class: string | undefined;
    /**
     * The name of the position of the {@link #panelView}, relative to the menu.
     *
     * **Note**: The value is updated each time the panel gets {@link #isOpen open}.
     *
     * @observable
     * @default 'w'
     */
    panelPosition: DropdownMenuNestedMenuPanelPosition;
    /**
     * The parent menu view of the menu. It is `null` for top-level menus.
     *
     * @observable
     * @default null
     */
    readonly parentMenuView: DropdownMenuNestedMenuView | null;
    private _bodyCollection;
    /**
     * Creates a new instance of the DropdownMenuView class.
     *
     * @param locale
     * @param bodyCollection
     * @param id
     * @param label The label for the dropdown menu button.
     * @param parentMenuView The parent dropdown menu view, if any.
     */
    constructor(locale: Locale, bodyCollection: BodyCollection, id: string, label: string, parentMenuView: DropdownMenuNestedMenuView | null);
    /**
     * An array of positioning functions used to determine the position of the dropdown menu panel.
     * The order of the functions in the array determines the priority of the positions to be tried.
     * The first function that returns a valid position will be used.
     *
     * @returns {Array<PositioningFunction>} An array of positioning functions.
     * @internal
     */
    get _panelPositions(): Array<PositioningFunction>;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * @inheritDoc
     */
    focus(): void;
    private _handleParentMenuView;
    /**
     * Attach all keyboard behaviors for the menu view.
     */
    private _attachBehaviors;
    /**
     * Mounts the portal view in the body when the menu is open and removes it when the menu is closed.
     * Binds keystrokes to the portal view when the menu is open.
     */
    private _mountPanelOnOpen;
    /**
     * Removes the panel view from the editor's body and removes it from the focus tracker.
     */
    private _removePanelFromBody;
    /**
     * Adds the panel view to the editor's body and sets up event listeners.
     */
    private _addPanelToBody;
}

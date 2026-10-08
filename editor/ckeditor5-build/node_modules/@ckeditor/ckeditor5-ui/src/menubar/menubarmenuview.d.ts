/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/menubar/menubarmenuview
 */
import { FocusTracker, KeystrokeHandler, type Locale, type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import { MenuBarMenuButtonView } from './menubarmenubuttonview.js';
import type { FocusableView } from '../focuscycler.js';
import { View } from '../view.js';
import { MenuBarMenuPanelView, type MenuBarMenuPanelPosition } from './menubarmenupanelview.js';
import '../../theme/components/menubar/menubarmenu.css';
/**
 * A menu view for the {@link module:ui/menubar/menubarview~MenuBarView}. Menus are building blocks of the menu bar,
 * they host other sub-menus and menu items (buttons) that users can interact with.
 */
export declare class MenuBarMenuView extends View implements FocusableView {
    /**
     * Button of the menu view.
     */
    readonly buttonView: MenuBarMenuButtonView;
    /**
     * Panel of the menu. It hosts children of the menu.
     */
    readonly panelView: MenuBarMenuPanelView;
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
    panelPosition: MenuBarMenuPanelPosition;
    /**
     * The parent menu view of the menu. It is `null` for top-level menus.
     *
     * See {@link module:ui/menubar/menubarview~MenuBarView#registerMenu}.
     */
    parentMenuView: MenuBarMenuView | null;
    /**
     * Creates an instance of the menu view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Attach all keyboard behaviors for the menu bar view.
     *
     * @internal
     */
    _attachBehaviors(): void;
    /**
     * Fires `arrowright` and `arrowleft` events when the user pressed corresponding arrow keys.
     */
    private _propagateArrowKeystrokeEvents;
    /**
     * Sets the position of the panel when the menu opens. The panel is positioned
     * so that it optimally uses the available space in the viewport.
     */
    private _repositionPanelOnOpen;
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * Positioning functions for the {@link #panelView} . They change depending on the role of the menu (top-level vs sub-menu) in
     * the {@link module:ui/menubar/menubarview~MenuBarView menu bar} and the UI language direction.
     */
    get _panelPositions(): Array<PositioningFunction>;
    /**
     * The default position of the panel when the menu is opened.
     * It is used when the optimal position cannot be calculated.
     */
    private get _defaultMenuPositionName();
    /**
     * A function used to calculate the optimal position for the dropdown panel.
     *
     * Referenced for unit testing purposes.
     */
    private static _getOptimalPosition;
}

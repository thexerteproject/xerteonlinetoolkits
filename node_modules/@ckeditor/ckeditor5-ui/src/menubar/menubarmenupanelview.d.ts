/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/menubar/menubarmenupanelview
 */
import { type Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler.js';
import { type ViewCollection } from '../viewcollection.js';
import { View } from '../view.js';
import '../../theme/components/menubar/menubarmenupanel.css';
/**
 * A view representing a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView} of a menu.
 */
export declare class MenuBarMenuPanelView extends View implements FocusableView {
    /**
     * Collection of the child views in this panel.
     */
    readonly children: ViewCollection<FocusableView>;
    /**
     * Controls whether the panel is visible.
     *
     * @observable
     */
    isVisible: boolean;
    /**
     * The name of the position of the panel, relative to the parent.
     *
     * This property is reflected in the CSS class suffix set to {@link #element} that controls
     * the position of the panel.
     *
     * @observable
     * @default 'se'
     */
    position: MenuBarMenuPanelPosition;
    /**
     * Creates an instance of the menu panel view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale?: Locale);
    /**
     * Focuses the first child of the panel (default) or the last one if the `direction` is `-1`.
     */
    focus(direction?: -1 | 1): void;
}
/**
 * The names of the positions of the {@link module:ui/menubar/menubarmenupanelview~MenuBarMenuPanelView}.
 *
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type MenuBarMenuPanelPosition = 'se' | 'sw' | 'ne' | 'nw' | 'w' | 'ws' | 'e' | 'es';

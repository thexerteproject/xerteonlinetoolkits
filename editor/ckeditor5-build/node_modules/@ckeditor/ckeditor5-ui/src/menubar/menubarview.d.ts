/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/menubar/menubarview
 */
import { type BaseEvent, type Locale } from '@ckeditor/ckeditor5-utils';
import { type FocusableView } from '../focuscycler.js';
import { View } from '../view.js';
import { type ViewCollection } from '../viewcollection.js';
import { type ComponentFactory } from '../componentfactory.js';
import { MenuBarMenuView } from './menubarmenuview.js';
import '../../theme/components/menubar/menubar.css';
/**
 * The application menu bar component. It brings a set of top-level menus (and sub-menus) that can be used
 * to organize and access a large number of buttons.
 */
export declare class MenuBarView extends View implements FocusableView {
    /**
     * Collection of the child views inside the {@link #element}.
     */
    children: ViewCollection<MenuBarMenuView>;
    /**
     * Indicates whether any of top-level menus are open in the menu bar. To close
     * the menu bar use the {@link #close} method.
     *
     * @observable
     */
    isOpen: boolean;
    /**
     * Indicates whether the menu bar has been interacted with using the keyboard.
     *
     * It is useful for showing focus outlines while hovering over the menu bar when
     * interaction with the keyboard was detected.
     *
     * @observable
     */
    isFocusBorderEnabled: boolean;
    /**
     * A list of {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} instances registered in the menu bar.
     *
     * @observable
     */
    menus: Array<MenuBarMenuView>;
    /**
     * Creates an instance of the menu bar view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
    /**
     * A utility that expands a plain menu bar configuration into a structure of menus (also: sub-menus)
     * and items using a given {@link module:ui/componentfactory~ComponentFactory component factory}.
     *
     * See the {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar} in the editor
     * configuration reference to learn how to configure the menu bar.
     */
    fillFromConfig(config: NormalizedMenuBarConfigObject, componentFactory: ComponentFactory, extraItems?: Array<MenuBarConfigAddedItem | MenuBarConfigAddedGroup | MenuBarConfigAddedMenu>): void;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the menu bar.
     */
    focus(): void;
    /**
     * Closes all menus in the bar.
     */
    close(): void;
    /**
     * Disables all menus in the bar.
     */
    disable(): void;
    /**
     * Enables all menus in the bar.
     */
    enable(): void;
    /**
     * Registers a menu view in the menu bar. Every {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} instance must be registered
     * in the menu bar to be properly managed.
     */
    registerMenu(menuView: MenuBarMenuView, parentMenuView?: MenuBarMenuView | null): void;
    /**
     * Creates a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} based on the given definition.
     */
    private _createMenu;
    /**
     * Creates a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} items based on the given definition.
     */
    private _createMenuItems;
    /**
     * Uses the component factory to create a content of the menu item (a button or a sub-menu).
     */
    private _createMenuItemContentFromFactory;
    /**
     * Checks component and its children recursively and calls {@link #registerMenu}
     * for each item that is {@link module:ui/menubar/menubarmenuview~MenuBarMenuView}.
     *
     * @internal
     */
    private _registerMenuTree;
    /**
     * Manages the state of the {@link #isOpen} property of the menu bar. Because the state is a sum of individual
     * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
     *
     * Additionally, it prevents from unnecessary changes of `isOpen` when one top-level menu opens and another closes
     * (regardless of in which order), maintaining a stable `isOpen === true` in that situation.
     */
    private _setupIsOpenUpdater;
}
export type MenuBarConfig = MenuBarConfigObject;
export type MenuBarConfigObject = {
    items?: Array<MenuBarMenuDefinition>;
    removeItems?: Array<string>;
    addItems?: Array<MenuBarConfigAddedItem | MenuBarConfigAddedGroup | MenuBarConfigAddedMenu>;
    isVisible?: boolean;
};
export type NormalizedMenuBarConfigObject = Required<MenuBarConfigObject> & {
    isUsingDefaultConfig: boolean;
};
export type MenuBarMenuGroupDefinition = {
    groupId: string;
    items: Array<MenuBarMenuDefinition | string>;
};
export type MenuBarMenuDefinition = {
    menuId: string;
    label: string;
    groups: Array<MenuBarMenuGroupDefinition>;
};
export type MenuBarConfigAddedPosition = `start:${string}` | `end:${string}` | 'start' | 'end' | `after:${string}` | `before:${string}`;
export type MenuBarConfigAddedItem = {
    item: string;
    position: MenuBarConfigAddedPosition;
};
export type MenuBarConfigAddedGroup = {
    group: MenuBarMenuGroupDefinition;
    position: MenuBarConfigAddedPosition;
};
export type MenuBarConfigAddedMenu = {
    menu: MenuBarMenuDefinition;
    position: MenuBarConfigAddedPosition;
};
/**
 * Any namespaced event fired by menu a {@link module:ui/menubar/menubarview~MenuBarView#menus menu view instance} of the
 * {@link module:ui/menubar/menubarview~MenuBarView menu bar}.
 */
export interface MenuBarMenuEvent extends BaseEvent {
    name: `menu:${string}` | `menu:change:${string}`;
}
/**
 * A `mouseenter` event originating from a {@link module:ui/menubar/menubarview~MenuBarView#menus menu view instance} of the
 * {@link module:ui/menubar/menubarview~MenuBarView menu bar}.
 */
export interface MenuBarMenuMouseEnterEvent extends MenuBarMenuEvent {
    name: 'menu:mouseenter';
}
/**
 * An `arrowleft` event originating from a {@link module:ui/menubar/menubarview~MenuBarView#menus menu view instance} of the
 * {@link module:ui/menubar/menubarview~MenuBarView menu bar}.
 */
export interface MenuBarMenuArrowLeftEvent extends MenuBarMenuEvent {
    name: 'menu:arrowleft';
}
/**
 * An `arrowright` event originating from a {@link module:ui/menubar/menubarview~MenuBarView#menus menu view instance} of the
 * {@link module:ui/menubar/menubarview~MenuBarView menu bar}.
 */
export interface MenuBarMenuArrowRightEvent extends MenuBarMenuEvent {
    name: 'menu:arrowright';
}
/**
 * A `change:isOpen` event originating from a {@link module:ui/menubar/menubarview~MenuBarView#menus menu view instance} of the
 * {@link module:ui/menubar/menubarview~MenuBarView menu bar}.
 */
export interface MenuBarMenuChangeIsOpenEvent extends MenuBarMenuEvent {
    name: 'menu:change:isOpen';
    args: [name: string, value: boolean, oldValue: boolean];
}

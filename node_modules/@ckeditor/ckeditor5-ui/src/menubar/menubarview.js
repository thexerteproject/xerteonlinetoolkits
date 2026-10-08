/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/menubar/menubarview
 */
import { logWarning } from '@ckeditor/ckeditor5-utils';
import { View } from '../view.js';
import { isObject } from 'es-toolkit/compat';
import { ListItemView } from '../list/listitemview.js';
import { ListSeparatorView } from '../list/listseparatorview.js';
import { MenuBarMenuView } from './menubarmenuview.js';
import { MenuBarMenuListView } from './menubarmenulistview.js';
import { MenuBarMenuListItemView } from './menubarmenulistitemview.js';
import { MenuBarMenuListItemButtonView } from './menubarmenulistitembuttonview.js';
import { MenuBarMenuListItemFileDialogButtonView } from './menubarmenulistitemfiledialogbuttonview.js';
import { MenuBarBehaviors, processMenuBarConfig } from './utils.js';
const EVENT_NAME_DELEGATES = ['mouseenter', 'arrowleft', 'arrowright', 'change:isOpen'];
import '../../theme/components/menubar/menubar.css';
/**
 * The application menu bar component. It brings a set of top-level menus (and sub-menus) that can be used
 * to organize and access a large number of buttons.
 */
export class MenuBarView extends View {
    /**
     * Collection of the child views inside the {@link #element}.
     */
    children;
    /**
     * A list of {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} instances registered in the menu bar.
     *
     * @observable
     */
    menus = [];
    /**
     * Creates an instance of the menu bar view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        const t = locale.t;
        const bind = this.bindTemplate;
        this.set({
            isOpen: false,
            isFocusBorderEnabled: false
        });
        this._setupIsOpenUpdater();
        this.children = this.createCollection();
        // @if CK_DEBUG_MENU_BAR // // Logs events in the main event bus of the component.
        // @if CK_DEBUG_MENU_BAR // this.on( 'menu', ( evt, data ) => {
        // @if CK_DEBUG_MENU_BAR // 	console.log( `MenuBarView:${ evt.name }`, evt.path.map( view => view.element ) );
        // @if CK_DEBUG_MENU_BAR // } );
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-menu-bar',
                    bind.if('isFocusBorderEnabled', 'ck-menu-bar_focus-border-enabled')
                ],
                'aria-label': t('Editor menu bar'),
                role: 'menubar'
            },
            children: this.children
        });
    }
    /**
     * A utility that expands a plain menu bar configuration into a structure of menus (also: sub-menus)
     * and items using a given {@link module:ui/componentfactory~ComponentFactory component factory}.
     *
     * See the {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar} in the editor
     * configuration reference to learn how to configure the menu bar.
     */
    fillFromConfig(config, componentFactory, extraItems = []) {
        const locale = this.locale;
        const processedConfig = processMenuBarConfig({
            normalizedConfig: config,
            locale,
            componentFactory,
            extraItems
        });
        const topLevelCategoryMenuViews = processedConfig.items.map(menuDefinition => this._createMenu({
            componentFactory,
            menuDefinition
        }));
        this.children.addMany(topLevelCategoryMenuViews);
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        MenuBarBehaviors.toggleMenusAndFocusItemsOnHover(this);
        MenuBarBehaviors.closeMenusWhenTheBarCloses(this);
        MenuBarBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens(this);
        MenuBarBehaviors.focusCycleMenusOnArrows(this);
        MenuBarBehaviors.closeOnClickOutside(this);
        MenuBarBehaviors.enableFocusHighlightOnInteraction(this);
    }
    /**
     * Focuses the menu bar.
     */
    focus() {
        if (this.children.first) {
            this.children.first.focus();
        }
    }
    /**
     * Closes all menus in the bar.
     */
    close() {
        for (const topLevelCategoryMenuView of this.children) {
            topLevelCategoryMenuView.isOpen = false;
        }
    }
    /**
     * Disables all menus in the bar.
     */
    disable() {
        for (const topLevelCategoryMenuView of this.children) {
            topLevelCategoryMenuView.isEnabled = false;
        }
    }
    /**
     * Enables all menus in the bar.
     */
    enable() {
        for (const topLevelCategoryMenuView of this.children) {
            topLevelCategoryMenuView.isEnabled = true;
        }
    }
    /**
     * Registers a menu view in the menu bar. Every {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} instance must be registered
     * in the menu bar to be properly managed.
     */
    registerMenu(menuView, parentMenuView = null) {
        if (parentMenuView) {
            menuView.delegate(...EVENT_NAME_DELEGATES).to(parentMenuView);
            menuView.parentMenuView = parentMenuView;
        }
        else {
            menuView.delegate(...EVENT_NAME_DELEGATES).to(this, name => 'menu:' + name);
        }
        menuView._attachBehaviors();
        this.menus.push(menuView);
    }
    /**
     * Creates a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} based on the given definition.
     */
    _createMenu({ componentFactory, menuDefinition, parentMenuView }) {
        const locale = this.locale;
        const menuView = new MenuBarMenuView(locale);
        this.registerMenu(menuView, parentMenuView);
        menuView.buttonView.set({
            label: menuDefinition.label
        });
        // Defer the creation of the menu structure until it gets open. This is a performance optimization
        // that shortens the time needed to create the editor.
        menuView.once('change:isOpen', () => {
            const listView = new MenuBarMenuListView(locale);
            listView.ariaLabel = menuDefinition.label;
            menuView.panelView.children.add(listView);
            listView.items.addMany(this._createMenuItems({ menuDefinition, parentMenuView: menuView, componentFactory }));
        });
        return menuView;
    }
    /**
     * Creates a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} items based on the given definition.
     */
    _createMenuItems({ menuDefinition, parentMenuView, componentFactory }) {
        const locale = this.locale;
        const items = [];
        for (const menuGroupDefinition of menuDefinition.groups) {
            for (const itemDefinition of menuGroupDefinition.items) {
                const menuItemView = new MenuBarMenuListItemView(locale, parentMenuView);
                if (isObject(itemDefinition)) {
                    menuItemView.children.add(this._createMenu({
                        componentFactory,
                        menuDefinition: itemDefinition,
                        parentMenuView
                    }));
                }
                else {
                    const componentView = this._createMenuItemContentFromFactory({
                        componentName: itemDefinition,
                        componentFactory,
                        parentMenuView
                    });
                    if (!componentView) {
                        continue;
                    }
                    menuItemView.children.add(componentView);
                }
                items.push(menuItemView);
            }
            // Separate groups with a separator.
            if (menuGroupDefinition !== menuDefinition.groups[menuDefinition.groups.length - 1]) {
                items.push(new ListSeparatorView(locale));
            }
        }
        return items;
    }
    /**
     * Uses the component factory to create a content of the menu item (a button or a sub-menu).
     */
    _createMenuItemContentFromFactory({ componentName, parentMenuView, componentFactory }) {
        const componentView = componentFactory.create(componentName);
        if (!(componentView instanceof MenuBarMenuView ||
            componentView instanceof MenuBarMenuListItemButtonView ||
            componentView instanceof MenuBarMenuListItemFileDialogButtonView)) {
            /**
             * Adding unsupported components to the {@link module:ui/menubar/menubarview~MenuBarView} is not possible.
             *
             * A component should be either a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} (sub-menu) or a
             * {@link module:ui/menubar/menubarmenulistitembuttonview~MenuBarMenuListItemButtonView} (button).
             *
             * @error menu-bar-component-unsupported
             * @param {string} componentName A name of the unsupported component used in the configuration.
             * @param {module:ui/view~View} componentView An unsupported component view.
             */
            logWarning('menu-bar-component-unsupported', {
                componentName,
                componentView
            });
            return null;
        }
        this._registerMenuTree(componentView, parentMenuView);
        // Close the whole menu bar when a component is executed.
        componentView.on('execute', () => {
            this.close();
        });
        return componentView;
    }
    /**
     * Checks component and its children recursively and calls {@link #registerMenu}
     * for each item that is {@link module:ui/menubar/menubarmenuview~MenuBarMenuView}.
     *
     * @internal
     */
    _registerMenuTree(componentView, parentMenuView) {
        if (!(componentView instanceof MenuBarMenuView)) {
            componentView.delegate('mouseenter').to(parentMenuView);
            return;
        }
        this.registerMenu(componentView, parentMenuView);
        const menuBarItemsList = componentView.panelView.children
            .filter(child => child instanceof MenuBarMenuListView)[0];
        if (!menuBarItemsList) {
            componentView.delegate('mouseenter').to(parentMenuView);
            return;
        }
        const nonSeparatorItems = menuBarItemsList.items.filter(item => item instanceof ListItemView);
        for (const item of nonSeparatorItems) {
            this._registerMenuTree(item.children.get(0), componentView);
        }
    }
    /**
     * Manages the state of the {@link #isOpen} property of the menu bar. Because the state is a sum of individual
     * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
     *
     * Additionally, it prevents from unnecessary changes of `isOpen` when one top-level menu opens and another closes
     * (regardless of in which order), maintaining a stable `isOpen === true` in that situation.
     */
    _setupIsOpenUpdater() {
        let closeTimeout;
        // TODO: This is not the prettiest approach but at least it's simple.
        this.on('menu:change:isOpen', (evt, name, isOpen) => {
            clearTimeout(closeTimeout);
            if (isOpen) {
                this.isOpen = true;
            }
            else {
                closeTimeout = setTimeout(() => {
                    this.isOpen = Array.from(this.children).some(menuView => menuView.isOpen);
                }, 0);
            }
        });
    }
}

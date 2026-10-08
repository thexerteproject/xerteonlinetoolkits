/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type DropdownMenuNestedMenuView } from './dropdownmenunestedmenuview.js';
import { type DropdownMenuRootListView } from './dropdownmenurootlistview.js';
/**
 * @internal
 */
export declare const DropdownRootMenuBehaviors: {
    /**
     * Move focus to a menu item on mouse hover. If it is a button to open a nested menu, open that menu.
     */
    toggleMenusAndFocusItemsOnHover(rootList: DropdownMenuRootListView): void;
    /**
     * Handles the following case:
     *
     * 1. Hover to open a sub-menu (A). The button has focus.
     * 2. Press arrow up/down to move focus to another sub-menu (B) button.
     * 3. Press arrow right to open the sub-menu (B).
     * 4. The sub-menu (A) should close (if not, there are two open menus).
     */
    closeMenuWhenAnotherOnTheSameLevelOpens(rootList: DropdownMenuRootListView): void;
};
/**
 * @internal
 */
export declare const DropdownMenuBehaviors: {
    /**
     * Open the menu on the right arrow key press (left, in RTL mode). This allows for navigating to sub-menus using the keyboard.
     */
    openOnArrowRightKey(menuView: DropdownMenuNestedMenuView): void;
    /**
     * Opens the menu on its button click as well as enter and space keys press (if the button is focused).
     */
    openOnButtonClick(menuView: DropdownMenuNestedMenuView): void;
    /**
     * Opens the menu and focuses the panel content upon pressing the Enter key.
     */
    openAndFocusOnEnterKeyPress(menuView: DropdownMenuNestedMenuView): void;
    /**
     * Closes the menu on the left key press (right, in RTL mode). This allows for navigating to sub-menus using the keyboard.
     */
    closeOnArrowLeftKey(menuView: DropdownMenuNestedMenuView): void;
    closeOnEscKey(menuView: DropdownMenuNestedMenuView): void;
    /**
     * Closes the menu when its parent menu closes. This prevents from leaving orphaned open menus.
     */
    closeOnParentClose(menuView: DropdownMenuNestedMenuView, parentMenuView: DropdownMenuNestedMenuView): void;
};

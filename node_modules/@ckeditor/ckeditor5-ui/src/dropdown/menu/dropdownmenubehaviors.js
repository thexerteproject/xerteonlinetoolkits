/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { DropdownMenuListItemView } from './dropdownmenulistitemview.js';
/**
 * @internal
 */
export const DropdownRootMenuBehaviors = {
    /**
     * Move focus to a menu item on mouse hover. If it is a button to open a nested menu, open that menu.
     */
    toggleMenusAndFocusItemsOnHover(rootList) {
        rootList.on('menu:mouseenter', evt => {
            const [pathLeaf] = evt.path;
            evt.source.focus();
            for (const menuView of rootList.menus) {
                const isListItemContainingMenu = pathLeaf instanceof DropdownMenuListItemView && pathLeaf.childView === menuView;
                menuView.isOpen = (evt.path.includes(menuView) || isListItemContainingMenu) && menuView.isEnabled;
            }
        });
    },
    /**
     * Handles the following case:
     *
     * 1. Hover to open a sub-menu (A). The button has focus.
     * 2. Press arrow up/down to move focus to another sub-menu (B) button.
     * 3. Press arrow right to open the sub-menu (B).
     * 4. The sub-menu (A) should close (if not, there are two open menus).
     */
    closeMenuWhenAnotherOnTheSameLevelOpens(rootList) {
        rootList.on('menu:change:isOpen', (evt, name, isOpen) => {
            if (!isOpen) {
                return;
            }
            const evtMenu = evt.source;
            for (const menuView of rootList.menus) {
                if (evtMenu.parentMenuView === menuView.parentMenuView && evtMenu !== menuView) {
                    menuView.isOpen = false;
                }
            }
        });
    }
};
/**
 * @internal
 */
export const DropdownMenuBehaviors = {
    /**
     * Open the menu on the right arrow key press (left, in RTL mode). This allows for navigating to sub-menus using the keyboard.
     */
    openOnArrowRightKey(menuView) {
        const keystroke = menuView.locale.uiLanguageDirection === 'rtl' ? 'arrowleft' : 'arrowright';
        menuView.keystrokes.set(keystroke, (data, cancel) => {
            if (menuView.focusTracker.focusedElement !== menuView.buttonView.element || !menuView.isEnabled) {
                return;
            }
            if (!menuView.isOpen) {
                menuView.isOpen = true;
            }
            menuView.panelView.focus();
            cancel();
        });
    },
    /**
     * Opens the menu on its button click as well as enter and space keys press (if the button is focused).
     */
    openOnButtonClick(menuView) {
        menuView.buttonView.on('execute', () => {
            if (menuView.isEnabled) {
                menuView.isOpen = true;
            }
        });
    },
    /**
     * Opens the menu and focuses the panel content upon pressing the Enter key.
     */
    openAndFocusOnEnterKeyPress(menuView) {
        menuView.keystrokes.set('enter', (data, cancel) => {
            // Engage only for Enter key press when the button is focused. The panel can contain
            // other UI components and features that rely on the Enter key press.
            if (menuView.focusTracker.focusedElement !== menuView.buttonView.element) {
                return;
            }
            menuView.isOpen = true;
            menuView.panelView.focus();
            cancel();
        });
    },
    /**
     * Closes the menu on the left key press (right, in RTL mode). This allows for navigating to sub-menus using the keyboard.
     */
    closeOnArrowLeftKey(menuView) {
        const keystroke = menuView.locale.uiLanguageDirection === 'rtl' ? 'arrowright' : 'arrowleft';
        menuView.keystrokes.set(keystroke, (data, cancel) => {
            if (menuView.isOpen) {
                // Focus first, then close the panel. Otherwise, Safari won't send blur events for detached DOM elements, leading to errors.
                menuView.focus();
                menuView.isOpen = false;
                cancel();
            }
        });
    },
    closeOnEscKey(menuView) {
        menuView.keystrokes.set('esc', (data, cancel) => {
            if (menuView.isOpen) {
                // Focus first, then close the panel. Otherwise, Safari won't send blur events for detached DOM elements, leading to errors.
                menuView.focus();
                menuView.isOpen = false;
                cancel();
            }
        });
    },
    /**
     * Closes the menu when its parent menu closes. This prevents from leaving orphaned open menus.
     */
    closeOnParentClose(menuView, parentMenuView) {
        parentMenuView.on('change:isOpen', (evt, name, isOpen) => {
            // TODO: Remove checking `evt.source` if `change:isOpen` is no longer delegated.
            if (!isOpen && evt.source === parentMenuView) {
                menuView.isOpen = false;
            }
        });
    }
};

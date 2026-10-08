/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
const NESTED_PANEL_HORIZONTAL_OFFSET = 5;
/**
 * Contains every positioning function used by {@link module:ui/dropdown/menu/dropdownmenunestedmenuview~DropdownMenuNestedMenuView} that
 * decides where the {@link module:ui/dropdown/menu/dropdownmenunestedmenuview~DropdownMenuNestedMenuView#panelView} should be placed.
 *
 * Positioning functions:
 *
 *	┌──────┬───────────────┐
 *	│      │               │
 *	└──────┤               │
 *	       │               │
 *	       │            ES │
 *	       └───────────────┘
 *
 *	┌───────────────┬──────┐
 *	│               │      │
 *	│               ├──────┘
 *	│               │
 *	│ WS            │
 *	└───────────────┘
 *
 *	       ┌───────────────┐
 *	       │            EN │
 *	       │               │
 *	┌──────┤               │
 *	│      │               │
 *	└──────┴───────────────┘
 *
 *	┌───────────────┐
 *	│ WN            │
 *	│               │
 *	│               ├──────┐
 *	│               │      │
 *	└───────────────┴──────┘
 */
export const DropdownMenuPanelPositioningFunctions = {
    eastSouth: buttonRect => ({
        top: buttonRect.top,
        left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
        name: 'es'
    }),
    eastNorth: (buttonRect, panelRect) => ({
        top: buttonRect.top - panelRect.height + buttonRect.height,
        left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
        name: 'en'
    }),
    westSouth: (buttonRect, panelRect) => ({
        top: buttonRect.top,
        left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
        name: 'ws'
    }),
    westNorth: (buttonRect, panelRect) => ({
        top: buttonRect.top - panelRect.height + buttonRect.height,
        left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
        name: 'wn'
    })
};

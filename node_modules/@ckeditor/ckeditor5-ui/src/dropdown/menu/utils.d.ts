/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/utils
 */
import type { PositioningFunction } from '@ckeditor/ckeditor5-utils';
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
export declare const DropdownMenuPanelPositioningFunctions: Record<string, PositioningFunction>;
/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownNestedMenuDefinition = {
    /**
     * Unique ID for the menu.
     */
    id: string;
    /**
     * The menu name. It is used as a label for the button which opens the menu list.
     */
    menu: string;
    /**
     * The children of the dropdown menu.
     */
    children: DropdownMenuDefinition;
};
/**
 * Represents the definition of a dropdown menu item.
 */
export type DropdownMenuButtonDefinition = {
    /**
     * Unique ID for the button.
     */
    id: string;
    /**
     * The label for the button.
     */
    label: string;
};
/**
 * A definition for a nestable menu component.
 *
 * The menu can be flat and include only top-level items, or it can include multiple levels of nested sub-menus.
 *
 * Example:
 *
 * ```ts
 * [
 * 	{
 * 		id: 'menu_1',
 * 		menu: 'Menu 1',
 * 		children: [
 * 			{
 * 				id: 'menu_1_1',
 * 				menu: 'Nested menu 1',
 * 				children: [
 * 					{
 * 						id: 'item_x',
 * 						label: 'Item X'
 * 					}
 * 				]
 * 			},
 * 			{
 * 				id: 'menu_1_2',
 * 				menu: 'Nested menu 2',
 * 				children: [
 * 					{
 * 						id: 'item_y',
 * 						label: 'Item Y'
 * 					},
 * 					{
 * 						id: 'item_z',
 * 						label: 'Item Z'
 * 					}
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		id: 'top_a',
 * 		label: 'Top Item A'
 * 	},
 * 	{
 * 		id: 'top_b',
 * 		label: 'Top Item B'
 * 	}
 * ];
 * ```
 */
export type DropdownMenuDefinition = Array<DropdownNestedMenuDefinition | DropdownMenuButtonDefinition>;

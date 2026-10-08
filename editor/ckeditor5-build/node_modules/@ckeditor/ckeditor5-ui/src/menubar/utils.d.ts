/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type MenuBarMenuView } from './menubarmenuview.js';
import type { MenuBarView, MenuBarConfig, MenuBarConfigObject, MenuBarConfigAddedGroup, MenuBarConfigAddedMenu, NormalizedMenuBarConfigObject, MenuBarConfigAddedItem } from './menubarview.js';
import { type ComponentFactory } from '../componentfactory.js';
import { type Locale, type PositioningFunction } from '@ckeditor/ckeditor5-utils';
/**
 * Behaviors of the {@link module:ui/menubar/menubarview~MenuBarView} component.
 * @internal
 */
export declare const MenuBarBehaviors: {
    /**
     * When the bar is already open:
     * * Opens the menu when the user hovers over its button.
     * * Closes open menu when another menu's button gets hovered.
     */
    toggleMenusAndFocusItemsOnHover(menuBarView: MenuBarView): void;
    /**
     * Moves between top-level menus using the arrow left and right keys.
     *
     * If the menubar has already been open, the arrow keys move focus between top-level menu buttons and open them.
     * If the menubar is closed, the arrow keys only move focus between top-level menu buttons.
     */
    focusCycleMenusOnArrows(menuBarView: MenuBarView): void;
    /**
     * Closes the entire sub-menu structure when the bar is closed. This prevents sub-menus from being open if the user
     * closes the entire bar, and then re-opens some top-level menu.
     */
    closeMenusWhenTheBarCloses(menuBarView: MenuBarView): void;
    /**
     * Handles the following case:
     * 1. Hover to open a sub-menu (A). The button has focus.
     * 2. Press arrow up/down to move focus to another sub-menu (B) button.
     * 3. Press arrow right to open the sub-menu (B).
     * 4. The sub-menu (A) should close as it would with `toggleMenusAndFocusItemsOnHover()`.
     */
    closeMenuWhenAnotherOnTheSameLevelOpens(menuBarView: MenuBarView): void;
    /**
     * Closes the bar when the user clicked outside of it (page body, editor root, etc.).
     */
    closeOnClickOutside(menuBarView: MenuBarView): void;
    /**
     * Tracks the keyboard focus interaction on the menu bar view. It is used to determine if the nested items
     * of the menu bar should render focus rings after first interaction with the keyboard.
     */
    enableFocusHighlightOnInteraction(menuBarView: MenuBarView): void;
};
/**
 * Behaviors of the {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} component.
 * @internal
 */
export declare const MenuBarMenuBehaviors: {
    /**
     * If the button of the menu is focused, pressing the arrow down key should open the panel and focus it.
     * This is analogous to the {@link module:ui/dropdown/dropdownview~DropdownView}.
     */
    openAndFocusPanelOnArrowDownKey(menuView: MenuBarMenuView): void;
    /**
     * Open the menu on the right arrow key press. This allows for navigating to sub-menus using the keyboard.
     */
    openOnArrowRightKey(menuView: MenuBarMenuView): void;
    /**
     * Opens the menu on its button click. Note that this behavior only opens but never closes the menu (unlike
     * {@link module:ui/dropdown/dropdownview~DropdownView}).
     */
    openOnButtonClick(menuView: MenuBarMenuView): void;
    /**
     * Toggles the menu on its button click. This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
     */
    toggleOnButtonClick(menuView: MenuBarMenuView): void;
    /**
     * Opens the menu and focuses the panel content upon pressing the Enter key.
     */
    openAndFocusOnEnterKeyPress(menuView: MenuBarMenuView): void;
    /**
     * Closes the menu on the right left key press. This allows for navigating to sub-menus using the keyboard.
     */
    closeOnArrowLeftKey(menuView: MenuBarMenuView): void;
    /**
     * Closes the menu on the esc key press. This allows for navigating to sub-menus using the keyboard.
     */
    closeOnEscKey(menuView: MenuBarMenuView): void;
    /**
     * Closes the menu when its parent menu also closed. This prevents from orphaned open menus when the parent menu re-opens.
     */
    closeOnParentClose(menuView: MenuBarMenuView): void;
};
/**
 * Contains every positioning function used by {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} that decides where the
 * {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView} should be placed.
 *
 * Top-level menu positioning functions:
 *
 *	┌──────┐
 *	│      │
 *	├──────┴────────┐
 *	│               │
 *	│               │
 *	│               │
 *	│            SE │
 *	└───────────────┘
 *
 *	         ┌──────┐
 *	         │      │
 *	┌────────┴──────┤
 *	│               │
 *	│               │
 *	│               │
 *	│ SW            │
 *	└───────────────┘
 *
 *	┌───────────────┐
 *	│ NW            │
 *	│               │
 *	│               │
 *	│               │
 *	└────────┬──────┤
 *	         │      │
 *	         └──────┘
 *
 *	┌───────────────┐
 *	│            NE │
 *	│               │
 *	│               │
 *	│               │
 *	├──────┬────────┘
 *	│      │
 *	└──────┘
 *
 * Sub-menu positioning functions:
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
/**
 * @internal
 */
export declare const MenuBarMenuViewPanelPositioningFunctions: Record<string, PositioningFunction>;
/**
 * The default items {@link module:core/editor/editorconfig~EditorConfig#menuBar configuration} of the
 * {@link module:ui/menubar/menubarview~MenuBarView} component. It contains names of all menu bar components
 * registered in the {@link module:ui/componentfactory~ComponentFactory component factory} (available in the project).
 *
 * **Note**: Menu bar component names provided by core editor features are prefixed with `menuBar:` in order to distinguish
 * them from components referenced by the {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}, for instance,
 * `'menuBar:bold'` is a menu bar button but `'bold'` is a toolbar button.
 *
 * Below is the preset menu bar structure (the default value of `config.menuBar.items` property):
 *
 * ```ts
 * [
 * 	{
 * 		menuId: 'file',
 * 		label: 'File',
 * 		groups: [
 * 			{
 * 				groupId: 'export',
 * 				items: [
 * 					'menuBar:exportPdf',
 * 					'menuBar:exportWord'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'import',
 * 				items: [
 * 					'menuBar:importWord'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'revisionHistory',
 * 				items: [
 * 					'menuBar:revisionHistory'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'edit',
 * 		label: 'Edit',
 * 		groups: [
 * 			{
 * 				groupId: 'undo',
 * 				items: [
 * 					'menuBar:undo',
 * 					'menuBar:redo'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'selectAll',
 * 				items: [
 * 					'menuBar:selectAll'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'findAndReplace',
 * 				items: [
 * 					'menuBar:findAndReplace'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'view',
 * 		label: 'View',
 * 		groups: [
 * 			{
 * 				groupId: 'sourceEditingEnhanced',
 * 				items: [
 * 					'menuBar:sourceEditingEnhanced'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'sourceEditing',
 * 				items: [
 * 					'menuBar:sourceEditing'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'showBlocks',
 * 				items: [
 * 					'menuBar:showBlocks'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'previewMergeFields',
 * 				items: [
 * 					'menuBar:previewMergeFields'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'fullscreen',
 * 				items: [
 * 					'menuBar:fullscreen'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'restrictedEditingException',
 * 				items: [
 * 					'menuBar:restrictedEditingException'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'insert',
 * 		label: 'Insert',
 * 		groups: [
 * 			{
 * 				groupId: 'insertMainWidgets',
 * 				items: [
 * 					'menuBar:insertImage',
 * 					'menuBar:ckbox',
 * 					'menuBar:ckfinder',
 * 					'menuBar:insertTable'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertInline',
 * 				items: [
 * 					'menuBar:link',
 * 					'menuBar:insertFootnote',
 * 					'menuBar:bookmark',
 * 					'menuBar:comment',
 * 					'menuBar:insertMergeField',
 * 					'menuBar:emoji'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertMinorWidgets',
 * 				items: [
 * 					'menuBar:mediaEmbed',
 * 					'menuBar:insertTemplate',
 * 					'menuBar:blockQuote',
 * 					'menuBar:codeBlock',
 * 					'menuBar:htmlEmbed'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertStructureWidgets',
 * 				items: [
 * 					'menuBar:horizontalLine',
 * 					'menuBar:pageBreak',
 * 					'menuBar:tableOfContents'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'restrictedEditing',
 * 				items: [
 * 					'menuBar:restrictedEditing'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'format',
 * 		label: 'Format',
 * 		groups: [
 * 			{
 * 				groupId: 'textAndFont',
 * 				items: [
 * 					{
 * 						menuId: 'text',
 * 						label: 'Text',
 * 						groups: [
 * 							{
 * 								groupId: 'basicStyles',
 * 								items: [
 * 									'menuBar:bold',
 * 									'menuBar:italic',
 * 									'menuBar:underline',
 * 									'menuBar:strikethrough',
 * 									'menuBar:superscript',
 * 									'menuBar:subscript',
 * 									'menuBar:code'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'textPartLanguage',
 * 								items: [
 * 									'menuBar:textPartLanguage'
 * 								]
 * 							}
 * 						]
 * 					},
 * 					{
 * 						menuId: 'font',
 * 						label: 'Font',
 * 						groups: [
 * 							{
 * 								groupId: 'fontProperties',
 * 								items: [
 * 									'menuBar:fontSize',
 * 									'menuBar:fontFamily'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'fontColors',
 * 								items: [
 * 									'menuBar:fontColor',
 * 									'menuBar:fontBackgroundColor'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'highlight',
 * 								items: [
 * 									'menuBar:highlight'
 * 								]
 * 							}
 * 						]
 * 					},
 * 					'menuBar:heading'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'list',
 * 				items: [
 * 					'menuBar:bulletedList',
 * 					'menuBar:numberedList',
 * 					'menuBar:multiLevelList',
 * 					'menuBar:todoList'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'indent',
 * 				items: [
 * 					'menuBar:alignment',
 * 					'menuBar:lineHeight',
 * 					'menuBar:indent',
 * 					'menuBar:outdent'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'caseChange',
 * 				items: [
 * 					'menuBar:caseChange'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'removeFormat',
 * 				items: [
 * 					'menuBar:removeFormat'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'tools',
 * 		label: 'Tools',
 * 		groups: [
 * 			{
 * 				groupId: 'aiTools',
 * 				items: [
 * 					'menuBar:aiAssistant',
 * 					'menuBar:aiCommands',
 * 					'menuBar:toggleAi',
 * 					'menuBar:aiQuickActions'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'tools',
 * 				items: [
 * 					'menuBar:trackChanges',
 * 					'menuBar:commentsArchive'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'help',
 * 		label: 'Help',
 * 		groups: [
 * 			{
 * 				groupId: 'help',
 * 				items: [
 * 					'menuBar:accessibilityHelp'
 * 				]
 * 			}
 * 		]
 * 	}
 * ];
 * ```
 *
 * The menu bar can be customized using the `config.menuBar.removeItems` and `config.menuBar.addItems` properties.
 */
export declare const DefaultMenuBarItems: MenuBarConfigObject['items'];
/**
 * Performs a cleanup and normalization of the menu bar configuration.
 */
export declare function normalizeMenuBarConfig(config: Readonly<MenuBarConfig>): NormalizedMenuBarConfigObject;
/**
 * Processes a normalized menu bar config and returns a config clone with the following modifications:
 *
 * * Removed components that are not available in the component factory,
 * * Removed obsolete separators,
 * * Purged empty menus,
 * * Localized top-level menu labels.
 * @internal
 */
export declare function processMenuBarConfig({ normalizedConfig, locale, componentFactory, extraItems }: {
    normalizedConfig: NormalizedMenuBarConfigObject;
    locale: Locale;
    componentFactory: ComponentFactory;
    extraItems: Array<MenuBarConfigAddedItem | MenuBarConfigAddedGroup | MenuBarConfigAddedMenu>;
}): NormalizedMenuBarConfigObject;

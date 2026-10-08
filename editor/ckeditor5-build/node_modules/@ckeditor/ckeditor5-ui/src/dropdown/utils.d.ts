/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { DropdownView } from './dropdownview.js';
import { ViewCollection } from '../viewcollection.js';
import type { View } from '../view.js';
import { type UIModel } from '../model.js';
import { type DropdownButton } from './button/dropdownbutton.js';
import type { FocusableView } from '../focuscycler.js';
import type { FalsyValue } from '../template.js';
import { type BodyCollection } from '../editorui/bodycollection.js';
import { type Collection, type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/dropdown/toolbardropdown.css';
import '../../theme/components/dropdown/listdropdown.css';
import type { DropdownMenuDefinition } from './menu/utils.js';
import type { ButtonLabelView } from '../button/buttonlabelview.js';
/**
 * A helper for creating dropdowns. It creates an instance of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown},
 * with a {@link module:ui/dropdown/button/dropdownbutton~DropdownButton button},
 * {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView panel} and all standard dropdown's behaviors.
 *
 * # Creating dropdowns
 *
 * By default, the default {@link module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView} class is used as
 * definition of the button:
 *
 * ```ts
 * const dropdown = createDropdown( model );
 *
 * // Configure dropdown's button properties:
 * dropdown.buttonView.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.render();
 *
 * // Will render a dropdown labeled "A dropdown" with an empty panel.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * You can also provide other button views (they need to implement the
 * {@link module:ui/dropdown/button/dropdownbutton~DropdownButton} interface). For instance, you can use
 * {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} to create a dropdown with a split button.
 *
 * ```ts
 * const dropdown = createDropdown( locale, SplitButtonView );
 *
 * // Configure dropdown's button properties:
 * dropdown.buttonView.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.buttonView.on( 'execute', () => {
 * 	// Add the behavior of the "action part" of the split button.
 * 	// Split button consists of the "action part" and "arrow part".
 * 	// The arrow opens the dropdown while the action part can have some other behavior.
 * } );
 *
 * dropdown.render();
 *
 * // Will render a dropdown labeled "A dropdown" with an empty panel.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * # Adding content to the dropdown's panel
 *
 * The content of the panel can be inserted directly into the `dropdown.panelView.element`:
 *
 * ```ts
 * dropdown.panelView.element.textContent = 'Content of the panel';
 * ```
 *
 * However, most of the time you will want to add there either a {@link module:ui/list/listview~ListView list of options}
 * or a list of buttons (i.e. a {@link module:ui/toolbar/toolbarview~ToolbarView toolbar}).
 * To simplify the task, you can use, respectively, {@link module:ui/dropdown/utils~addListToDropdown} or
 * {@link module:ui/dropdown/utils~addToolbarToDropdown} utils.
 *
 * @param locale The locale instance.
 * @param ButtonClassOrInstance The dropdown button view class. Needs to implement the
 * {@link module:ui/dropdown/button/dropdownbutton~DropdownButton} interface.
 * @returns The dropdown view instance.
 */
export declare function createDropdown(locale: Locale | undefined, ButtonClassOrInstance?: (new (locale?: Locale) => DropdownButton & FocusableView) | (DropdownButton & FocusableView)): DropdownView;
/**
 * Adds a menu UI component to a dropdown and sets all common behaviors and interactions between the dropdown and the menu.
 *
 * Use this helper to create multi-level dropdown menus that are displayed in a toolbar.
 *
 * Internally, it creates an instance of {@link module:ui/dropdown/menu/dropdownmenurootlistview~DropdownMenuRootListView}.
 *
 * Example:
 *
 * ```ts
 * const definitions = [
 * 	{
 * 		id: 'menu_1',
 * 		menu: 'Menu 1',
 * 		children: [
 * 			{
 * 				id: 'menu_1_a',
 * 				label: 'Item A'
 * 			},
 * 			{
 * 				id: 'menu_1_b',
 * 				label: 'Item B'
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
 *
 * const dropdownView = createDropdown( editor.locale );
 *
 * addMenuToDropdown( dropdownView, editor.ui.view.body, definitions );
 * ```
 *
 * After using this helper, the `dropdown` will fire {@link module:ui/dropdown/dropdownview~DropdownViewEvent `execute`} event when
 * a nested menu button is pressed.
 *
 * The helper will make sure that the `dropdownMenuRootListView` is lazy loaded, i.e., the menu component structure will be initialized
 * and rendered only after the `dropdown` is opened for the first time.
 *
 * @param dropdownView A dropdown instance to which the menu component will be added.
 * @param body Body collection to which floating menu panels will be added.
 * @param definition The menu component definition.
 * @param options.ariaLabel Label used by assistive technologies to describe the top-level menu.
 */
export declare function addMenuToDropdown(dropdownView: DropdownView, body: BodyCollection, definition: DropdownMenuDefinition, options?: {
    ariaLabel?: string;
}): void;
/**
 * Adds an instance of {@link module:ui/toolbar/toolbarview~ToolbarView} to a dropdown.
 *
 * ```ts
 * const buttonsCreator = () => {
 * 	const buttons = [];
 *
 * 	// Either create a new ButtonView instance or create existing.
 * 	buttons.push( new ButtonView() );
 * 	buttons.push( editor.ui.componentFactory.create( 'someButton' ) );
 * };
 *
 * const dropdown = createDropdown( locale );
 *
 * addToolbarToDropdown( dropdown, buttonsCreator, { isVertical: true } );
 *
 * // Will render a vertical button dropdown labeled "A button dropdown"
 * // with a button group in the panel containing two buttons.
 * // Buttons inside the dropdown will be created on first dropdown panel open.
 * dropdown.render()
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * **Note:** To improve the accessibility, you can tell the dropdown to focus the first active button of the toolbar when the dropdown
 * {@link module:ui/dropdown/dropdownview~DropdownView#isOpen gets open}. See the documentation of `options` to learn more.
 *
 * **Note:** Toolbar view will be created on first open of the dropdown.
 *
 * See {@link module:ui/dropdown/utils~createDropdown} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * @param dropdownView A dropdown instance to which `ToolbarView` will be added.
 * @param options.enableActiveItemFocusOnDropdownOpen When set `true`, the focus will automatically move to the first
 * active {@link module:ui/toolbar/toolbarview~ToolbarView#items item} of the toolbar upon
 * {@link module:ui/dropdown/dropdownview~DropdownView#isOpen opening} the dropdown. Active items are those with the `isOn` property set
 * `true` (for instance {@link module:ui/button/buttonview~ButtonView buttons}). If no active items is found, the toolbar will be focused
 * as a whole resulting in the focus moving to its first focusable item (default behavior of
 * {@link module:ui/dropdown/dropdownview~DropdownView}).
 * @param options.ariaLabel Label used by assistive technologies to describe toolbar element.
 * @param options.maxWidth The maximum width of the toolbar element.
 * Details: {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth}.
 * @param options.class An additional CSS class added to the toolbar element.
 * @param options.isCompact When set true, makes the toolbar look compact with toolbar element.
 * @param options.isVertical Controls the orientation of toolbar items.
 */
export declare function addToolbarToDropdown(dropdownView: DropdownView, buttonsOrCallback: Array<View> | ViewCollection | (() => Array<View> | ViewCollection), options?: {
    enableActiveItemFocusOnDropdownOpen?: boolean;
    ariaLabel?: string;
    maxWidth?: string;
    class?: string;
    isCompact?: boolean;
    isVertical?: boolean;
}): void;
/**
 * Adds an instance of {@link module:ui/list/listview~ListView} to a dropdown.
 *
 * ```ts
 * const items = new Collection<ListDropdownItemDefinition>();
 *
 * items.add( {
 * 	type: 'button',
 * 	model: new Model( {
 * 		withText: true,
 * 		label: 'First item',
 * 		labelStyle: 'color: red'
 * 	} )
 * } );
 *
 * items.add( {
 * 	 type: 'button',
 * 	 model: new Model( {
 * 		withText: true,
 * 		label: 'Second item',
 * 		labelStyle: 'color: green',
 * 		class: 'foo'
 * 	} )
 * } );
 *
 * const dropdown = createDropdown( locale );
 *
 * addListToDropdown( dropdown, items );
 *
 * // Will render a dropdown with a list in the panel containing two items.
 * dropdown.render()
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * The `items` collection passed to this methods controls the presence and attributes of respective
 * {@link module:ui/list/listitemview~ListItemView list items}.
 *
 * **Note:** To improve the accessibility, when a list is added to the dropdown using this helper the dropdown will automatically attempt
 * to focus the first active item (a host to a {@link module:ui/button/buttonview~ButtonView} with
 * {@link module:ui/button/buttonview~ButtonView#isOn} set `true`) or the very first item when none are active.
 *
 * **Note:** List view will be created on first open of the dropdown.
 *
 * See {@link module:ui/dropdown/utils~createDropdown} and {@link module:list/list~List}.
 *
 * @param dropdownView A dropdown instance to which `ListVIew` will be added.
 * @param itemsOrCallback A collection of the list item definitions or a callback returning a list item definitions to populate the list.
 * @param options.ariaLabel Label used by assistive technologies to describe list element.
 * @param options.role Will be reflected by the `role` DOM attribute in `ListVIew` and used by assistive technologies.
 */
export declare function addListToDropdown(dropdownView: DropdownView, itemsOrCallback: Collection<ListDropdownItemDefinition> | (() => Collection<ListDropdownItemDefinition>), options?: {
    ariaLabel?: string;
    role?: string;
}): void;
/**
 * A helper to be used on an existing {@link module:ui/dropdown/dropdownview~DropdownView} that focuses
 * a specific child in DOM when the dropdown {@link module:ui/dropdown/dropdownview~DropdownView#isOpen gets open}.
 *
 * @param dropdownView A dropdown instance to which the focus behavior will be added.
 * @param childSelectorCallback A callback executed when the dropdown gets open. It should return a {@link module:ui/view~View}
 * instance (child of {@link module:ui/dropdown/dropdownview~DropdownView#panelView}) that will get focused or a falsy value.
 * If falsy value is returned, a default behavior of the dropdown will engage focusing the first focusable child in
 * the {@link module:ui/dropdown/dropdownview~DropdownView#panelView}.
 */
export declare function focusChildOnDropdownOpen(dropdownView: DropdownView, childSelectorCallback: () => View | FalsyValue): void;
/**
 * A definition of the list item used by the {@link module:ui/dropdown/utils~addListToDropdown}
 * utility.
 */
export type ListDropdownItemDefinition = ListDropdownSeparatorDefinition | ListDropdownButtonDefinition | ListDropdownGroupDefinition;
/**
 * A definition of the 'separator' list item.
 */
export type ListDropdownSeparatorDefinition = {
    type: 'separator';
};
/**
 * A definition of the 'button' or 'switchbutton' list item.
 */
export type ListDropdownButtonDefinition = {
    type: 'button' | 'switchbutton';
    /**
     * Model of the item. Its properties fuel the newly created list item (or its children, depending on the `type`).
     */
    model: UIModel;
    /**
     * A view that will be used as a button body in the list item.
     */
    labelView?: ButtonLabelView;
};
/**
 * A definition of the group inside the list. A group can contain one or more list items (buttons).
 */
export type ListDropdownGroupDefinition = {
    type: 'group';
    /**
     * The visible label of the group.
     */
    label: string;
    /**
     * The collection of the child list items inside this group.
     */
    items: Collection<ListDropdownButtonDefinition>;
};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/dropdownview
 */
import { View } from '../view.js';
import type { DropdownButton } from './button/dropdownbutton.js';
import type { DropdownPanelView, PanelPosition } from './dropdownpanelview.js';
import type { FocusableView } from '../focuscycler.js';
import { type ListView } from '../list/listview.js';
import { type ToolbarView } from '../toolbar/toolbarview.js';
import { type DropdownMenuRootListView } from './menu/dropdownmenurootlistview.js';
import { KeystrokeHandler, FocusTracker, type Locale, type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/dropdown/dropdown.css';
/**
 * The dropdown view class. It manages the dropdown button and dropdown panel.
 *
 * In most cases, the easiest way to create a dropdown is by using the {@link module:ui/dropdown/utils~createDropdown}
 * util:
 *
 * ```ts
 * const dropdown = createDropdown( locale );
 *
 * // Configure dropdown's button properties:
 * dropdown.buttonView.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.render();
 *
 * dropdown.panelView.element.textContent = 'Content of the panel';
 *
 * // Will render a dropdown with a panel containing a "Content of the panel" text.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * If you want to add a richer content to the dropdown panel, you can use the {@link module:ui/dropdown/utils~addListToDropdown}
 * and {@link module:ui/dropdown/utils~addToolbarToDropdown} helpers. See more examples in
 * {@link module:ui/dropdown/utils~createDropdown} documentation.
 *
 * If you want to create a completely custom dropdown, then you can compose it manually:
 *
 * ```ts
 * const button = new DropdownButtonView( locale );
 * const panel = new DropdownPanelView( locale );
 * const dropdown = new DropdownView( locale, button, panel );
 *
 * button.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.render();
 *
 * panel.element.textContent = 'Content of the panel';
 *
 * // Will render a dropdown with a panel containing a "Content of the panel" text.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * However, dropdown created this way will contain little behavior. You will need to implement handlers for actions
 * such as {@link module:ui/bindings/clickoutsidehandler~clickOutsideHandler clicking outside an open dropdown}
 * (which should close it) and support for arrow keys inside the panel. Therefore, unless you really know what
 * you do and you really need to do it, it is recommended to use the {@link module:ui/dropdown/utils~createDropdown} helper.
 */
export declare class DropdownView extends View<HTMLDivElement> {
    /**
     * Button of the dropdown view. Clicking the button opens the {@link #panelView}.
     */
    readonly buttonView: DropdownButton & FocusableView;
    /**
     * Panel of the dropdown. It opens when the {@link #buttonView} is
     * {@link module:ui/button/button~Button#event:execute executed} (i.e. clicked).
     *
     * Child views can be added to the panel's `children` collection:
     *
     * ```ts
     * dropdown.panelView.children.add( childView );
     * ```
     *
     * See {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#children} and
     * {@link module:ui/viewcollection~ViewCollection#add}.
     */
    readonly panelView: DropdownPanelView;
    /**
     * Tracks information about the DOM focus in the dropdown.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
     * keystrokes of the dropdown:
     *
     * * <kbd>▼</kbd> opens the dropdown,
     * * <kbd>◀</kbd> and <kbd>Esc</kbd> closes the dropdown.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A child {@link module:ui/list/listview~ListView list view} of the dropdown located
     * in its {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel}.
     *
     * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addListToDropdown}.
     */
    listView?: ListView;
    /**
     * A child toolbar of the dropdown located in the
     * {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel}.
     *
     * **Note**: Only supported when dropdown has a toolbar added using {@link module:ui/dropdown/utils~addToolbarToDropdown}.
     */
    toolbarView?: ToolbarView;
    /**
     * A child menu component of the dropdown located
     * in its {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel}.
     *
     * **Note**: Only supported when dropdown has a menu added using {@link module:ui/dropdown/utils~addMenuToDropdown}.
     */
    menuView?: DropdownMenuRootListView;
    /**
     * Controls whether the dropdown view is open, i.e. shows or hides the {@link #panelView panel}.
     *
     * **Note**: When the dropdown gets open, it will attempt to call `focus()` on the first child of its {@link #panelView}.
     * See {@link module:ui/dropdown/utils~addToolbarToDropdown}, {@link module:ui/dropdown/utils~addListToDropdown}, and
     * {@link module:ui/dropdown/utils~focusChildOnDropdownOpen} to learn more about focus management in dropdowns.
     *
     * @observable
     */
    isOpen: boolean;
    /**
     * Controls whether the dropdown is enabled, i.e. it can be clicked and execute an action.
     *
     * See {@link module:ui/button/buttonview~ButtonView#isEnabled}.
     *
     * @observable
     */
    isEnabled: boolean;
    /**
     * (Optional) The additional CSS class set on the dropdown {@link #element}.
     *
     * @observable
     */
    class: string | undefined;
    /**
     * (Optional) The `id` attribute of the dropdown (i.e. to pair with a `<label>` element).
     *
     * @observable
     */
    id: string | undefined;
    /**
     * The position of the panel, relative to the dropdown.
     *
     * **Note**: When `'auto'`, the panel will use one of the remaining positions to stay
     * in the viewport, visible to the user. The positions correspond directly to
     * {@link module:ui/dropdown/dropdownview~DropdownView.defaultPanelPositions default panel positions}.
     *
     * **Note**: This value has an impact on the
     * {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#position} property
     * each time the panel becomes {@link #isOpen open}.
     *
     * @observable
     * @default 'auto'
     */
    panelPosition: PanelPosition | 'auto';
    /**
     * @observable
     */
    ariaDescribedById: string | undefined;
    /**
     * Creates an instance of the dropdown.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale | undefined, buttonView: DropdownButton & FocusableView, panelView: DropdownPanelView);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the {@link #buttonView}.
     */
    focus(): void;
    /**
     * Returns {@link #panelView panel} positions to be used by the
     * {@link module:utils/dom/position~getOptimalPosition `getOptimalPosition()`}
     * utility considering the direction of the language the UI of the editor is displayed in.
     */
    private get _panelPositions();
    /**
     * Returns the default position of the dropdown panel based on the direction of the UI language.
     * It is used when the {@link #panelPosition} is set to `'auto'` and the panel has not found a
     * suitable position to fit into the viewport.
     */
    private get _defaultPanelPositionName();
    /**
     * A set of positioning functions used by the dropdown view to determine
     * the optimal position (i.e. fitting into the browser viewport) of its
     * {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel} when
     * {@link module:ui/dropdown/dropdownview~DropdownView#panelPosition} is set to 'auto'`.
     *
     * The available positioning functions are as follow:
     *
     * **South**
     *
     * * `south`
     *
     * ```
     *			[ Button ]
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     * ```
     *
     * * `southEast`
     *
     * ```
     *		[ Button ]
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     * ```
     *
     * * `southWest`
     *
     * ```
     *		         [ Button ]
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     * ```
     *
     * * `southMiddleEast`
     *
     * ```
     *		  [ Button ]
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     * ```
     *
     * * `southMiddleWest`
     *
     * ```
     *		       [ Button ]
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     * ```
     *
     * **North**
     *
     * * `north`
     *
     * ```
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     *		    [ Button ]
     * ```
     *
     * * `northEast`
     *
     * ```
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     *		[ Button ]
     * ```
     *
     * * `northWest`
     *
     * ```
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     *		         [ Button ]
     * ```
     *
     * * `northMiddleEast`
     *
     * ```
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     *		  [ Button ]
     * ```
     *
     * * `northMiddleWest`
     *
     * ```
     *		+-----------------+
     *		|      Panel      |
     *		+-----------------+
     *		       [ Button ]
     * ```
     *
     * Positioning functions are compatible with {@link module:utils/dom/position~DomPoint}.
     *
     * The name that position function returns will be reflected in dropdown panel's class that
     * controls its placement. See {@link module:ui/dropdown/dropdownview~DropdownView#panelPosition}
     * to learn more.
     */
    static defaultPanelPositions: Record<string, PositioningFunction>;
    /**
     * A function used to calculate the optimal position for the dropdown panel.
     */
    private static _getOptimalPosition;
}
/**
 * Fired when an item inside the dropdown is executed.
 *
 * **Note**: Only supported when dropdown was integrated with its child view using one of the helper functions:
 * {@link module:ui/dropdown/utils~addListToDropdown}, {@link module:ui/dropdown/utils~addToolbarToDropdown}, or
 * {@link module:ui/dropdown/utils~addMenuToDropdown}.
 *
 * When integrated with a list, it fires when a child of one of {@link module:ui/list/listitemview~ListItemView}s
 * fired `execute` event.
 *
 * When integrated with a toolbar, it fires when one of the buttons has been {@link module:ui/button/button~Button#event:execute executed}.
 *
 * When integrated with a nested menu, it fires when one of the menu buttons has been executed.
 *
 * In each case, the event is delegated from the component which fired it. It does not have additional parameters and `event.source` is the
 * original component.
 *
 * @eventName ~DropdownView#execute
 */
export type DropdownViewEvent = {
    name: 'execute';
    args: [];
};

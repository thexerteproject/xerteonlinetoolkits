/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/toolbar/toolbarview
 */
import { View } from '../view.js';
import { type FocusableView } from '../focuscycler.js';
import { type ComponentFactory } from '../componentfactory.js';
import { type ViewCollection } from '../viewcollection.js';
import { type DropdownPanelFocusable } from '../dropdown/dropdownpanelfocusable.js';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import type { ToolbarConfig } from '@ckeditor/ckeditor5-core';
import '../../theme/components/toolbar/toolbar.css';
/**
 * @internal
 */
export declare const NESTED_TOOLBAR_ICONS: Record<string, string | undefined>;
/**
 * The toolbar view class.
 */
export declare class ToolbarView extends View implements DropdownPanelFocusable {
    /**
     * A reference to the options object passed to the constructor.
     */
    readonly options: ToolbarOptions;
    /**
     * A collection of toolbar items (buttons, dropdowns, etc.).
     */
    readonly items: ViewCollection;
    /**
     * Tracks information about the DOM focus in the toolbar.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
     * to handle keyboard navigation in the toolbar.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A (child) view containing {@link #items toolbar items}.
     */
    readonly itemsView: ItemsView;
    /**
     * A top–level collection aggregating building blocks of the toolbar.
     *
     *	┌───────────────── ToolbarView ─────────────────┐
     *	| ┌──────────────── #children ────────────────┐ |
     *	| |   ┌──────────── #itemsView ───────────┐   | |
     *	| |   | [ item1 ] [ item2 ] ... [ itemN ] |   | |
     *	| |   └──────────────────────────────────-┘   | |
     *	| └───────────────────────────────────────────┘ |
     *	└───────────────────────────────────────────────┘
     *
     * By default, it contains the {@link #itemsView} but it can be extended with additional
     * UI elements when necessary.
     */
    readonly children: ViewCollection;
    /**
     * A collection of {@link #items} that take part in the focus cycling
     * (i.e. navigation using the keyboard). Usually, it contains a subset of {@link #items} with
     * some optional UI elements that also belong to the toolbar and should be focusable
     * by the user.
     */
    readonly focusables: ViewCollection<FocusableView>;
    locale: Locale;
    /**
     * The property reflected by the `role` DOM attribute to be used by assistive technologies.
     *
     * @observable
     * @default 'toolbar'
     */
    role: string | undefined;
    /**
     * Label used by assistive technologies to describe this toolbar element.
     *
     * @observable
     * @default 'Editor toolbar'
     */
    ariaLabel: string;
    /**
     * The maximum width of the toolbar element.
     *
     * **Note**: When set to a specific value (e.g. `'200px'`), the value will affect the behavior of the
     * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}
     * option by changing the number of {@link #items} that will be displayed in the toolbar at a time.
     *
     * @observable
     * @default 'auto'
     */
    maxWidth: string;
    /**
     * An additional CSS class added to the {@link #element}.
     *
     * @observable
     * @type {String}
     */
    class: string | undefined;
    /**
     * When set true, makes the toolbar look compact with {@link #element}.
     *
     * @observable
     * @default false
     */
    isCompact: boolean;
    /**
     * Controls the orientation of toolbar items. Only available when
     * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull dynamic items grouping}
     * is **disabled**.
     *
     * @observable
     */
    isVertical: boolean;
    /**
     * Indicates whether the toolbar responds to changes in the geometry (e.g. window resize) by grouping excessive items or not.
     */
    isGrouping: boolean;
    /**
     * Helps cycling over {@link #focusables focusable items} in the toolbar.
     */
    private readonly _focusCycler;
    /**
     * An instance of the active toolbar behavior that shapes its look and functionality.
     *
     * See {@link module:ui/toolbar/toolbarview~ToolbarBehavior} to learn more.
     */
    private _behavior;
    /**
     * Creates an instance of the {@link module:ui/toolbar/toolbarview~ToolbarView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param options Configuration options of the toolbar.
     */
    constructor(locale: Locale, options?: ToolbarOptions);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the first focusable in {@link #focusables}.
     */
    focus(): void;
    /**
     * Focuses the last focusable in {@link #focusables}.
     */
    focusLast(): void;
    /**
     * A utility that expands the plain toolbar configuration into
     * {@link module:ui/toolbar/toolbarview~ToolbarView#items} using a given component factory.
     *
     * @param itemsOrConfig The toolbar items or the entire toolbar configuration object.
     * @param factory A factory producing toolbar items.
     * @param removeItems An array of items names to be removed from the configuration. When present, applies
     * to this toolbar and all nested ones as well.
     */
    fillFromConfig(itemsOrConfig: ToolbarConfig | undefined, factory: ComponentFactory, removeItems?: Array<string>): void;
    /**
     * Changes the behavior of toolbar if it does not fit into the available space.
     */
    switchBehavior(newBehaviorType: 'dynamic' | 'static'): void;
    /**
     * A utility that expands the plain toolbar configuration into a list of view items using a given component factory.
     *
     * @param itemsOrConfig The toolbar items or the entire toolbar configuration object.
     * @param factory A factory producing toolbar items.
     * @param removeItems An array of items names to be removed from the configuration. When present, applies
     * to this toolbar and all nested ones as well.
     */
    private _buildItemsFromConfig;
    /**
     * Cleans up the {@link module:ui/toolbar/toolbarview~ToolbarView#items} of the toolbar by removing unwanted items and
     * duplicated (obsolete) separators or line breaks.
     *
     * @param items The toolbar items configuration.
     * @param factory A factory producing toolbar items.
     * @param removeItems An array of items names to be removed from the configuration.
     * @returns Items after the clean-up.
     */
    private _cleanItemsConfiguration;
    /**
     * Remove leading, trailing, and duplicated separators (`-` and `|`).
     *
     * @returns Toolbar items after the separator and line break clean-up.
     */
    private _cleanSeparatorsAndLineBreaks;
    /**
     * Creates a user-defined dropdown containing a toolbar with items.
     *
     * @param definition A definition of the nested toolbar dropdown.
     * @param definition.label A label of the dropdown.
     * @param definition.icon An icon of the drop-down. One of 'bold', 'plus', 'text', 'importExport', 'alignLeft',
     * 'paragraph' or an SVG string. When `false` is passed, no icon will be used.
     * @param definition.withText When set `true`, the label of the dropdown will be visible. See
     * {@link module:ui/button/buttonview~ButtonView#withText} to learn more.
     * @param definition.tooltip A tooltip of the dropdown button. See
     * {@link module:ui/button/buttonview~ButtonView#tooltip} to learn more. Defaults to `true`.
     * @param componentFactory Component factory used to create items
     * of the nested toolbar.
     */
    private _createNestedToolbarDropdown;
}
/**
 * Fired when some toolbar {@link ~ToolbarView#items} were grouped or ungrouped as a result of some change
 * in the toolbar geometry.
 *
 * **Note**: This event is always fired **once** regardless of the number of items that were be
 * grouped or ungrouped at a time.
 *
 * **Note**: This event is fired only if the items grouping functionality was enabled in
 * the first place (see {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}).
 *
 * @eventName ~ToolbarView#groupedItemsUpdate
 */
export type ToolbarViewGroupedItemsUpdateEvent = {
    name: 'groupedItemsUpdate';
    args: [];
};
/**
 * An inner block of the {@link module:ui/toolbar/toolbarview~ToolbarView} hosting its
 * {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
 */
export declare class ItemsView extends View {
    /**
     * A collection of items (buttons, dropdowns, etc.).
     */
    readonly children: ViewCollection;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
}
/**
 * Options passed to the {@link module:ui/toolbar/toolbarview~ToolbarView#constructor} of the toolbar.
 */
export interface ToolbarOptions {
    /**
     * When set to `true`, the toolbar will automatically group {@link module:ui/toolbar/toolbarview~ToolbarView#items} that
     * would normally wrap to the next line when there is not enough space to display them in a single row, for
     * instance, if the parent container of the toolbar is narrow. For toolbars in absolutely positioned containers
     * without width restrictions also the {@link module:ui/toolbar/toolbarview~ToolbarOptions#isFloating} option is required to be `true`.
     *
     * See also: {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth}.
     */
    shouldGroupWhenFull?: boolean;
    /**
     * This option should be enabled for toolbars in absolutely positioned containers without width restrictions
     * to enable automatic {@link module:ui/toolbar/toolbarview~ToolbarView#items} grouping.
     * When this option is set to `true`, the items will stop wrapping to the next line
     * and together with {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull},
     * this will allow grouping them when there is not enough space in a single row.
     */
    isFloating?: boolean;
}
/**
 * A class interface defining the behavior of the {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * Toolbar behaviors extend its look and functionality and have an impact on the
 * {@link module:ui/toolbar/toolbarview~ToolbarView#element} template or
 * {@link module:ui/toolbar/toolbarview~ToolbarView#render rendering}. They can be enabled
 * conditionally, e.g. depending on the configuration of the toolbar.
 * @internal
 */
export interface ToolbarBehavior {
    /**
     * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#render rendered}.
     * It can be used to, for example, customize the behavior of the toolbar when its
     * {@link module:ui/toolbar/toolbarview~ToolbarView#element} is available.
     *
     * @param view An instance of the toolbar being rendered.
     */
    render(view: ToolbarView): void;
    /**
     * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#destroy destroyed}.
     * It allows cleaning up after the toolbar behavior, for instance, this is the right place to detach
     * event listeners, free up references, etc.
     */
    destroy(): void;
    /**
     * Indicates the type of the toolbar behavior. Dynamic toolbar can hide items that do not fit into the available space.
     * Static toolbar does not hide items and does not respond to the changes of the viewport.
     */
    type: 'dynamic' | 'static';
}

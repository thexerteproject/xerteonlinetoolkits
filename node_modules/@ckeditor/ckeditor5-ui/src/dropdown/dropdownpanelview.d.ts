/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/dropdownpanelview
 */
import { View } from '../view.js';
import { type ViewCollection } from '../viewcollection.js';
import { type DropdownPanelFocusable } from './dropdownpanelfocusable.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The dropdown panel view class.
 *
 * See {@link module:ui/dropdown/dropdownview~DropdownView} to learn about the common usage.
 */
export declare class DropdownPanelView extends View implements DropdownPanelFocusable {
    /**
     * Collection of the child views in this panel.
     *
     * A common child type is the {@link module:ui/list/listview~ListView} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
     * See {@link module:ui/dropdown/utils~addListToDropdown} and
     * {@link module:ui/dropdown/utils~addToolbarToDropdown} to learn more about child views of dropdowns.
     */
    readonly children: ViewCollection;
    /**
     * Controls whether the panel is visible.
     *
     * @observable
     */
    isVisible: boolean;
    /**
     * The position of the panel, relative to the parent.
     *
     * This property is reflected in the CSS class set to {@link #element} that controls
     * the position of the panel.
     *
     * @observable
     * @default 'se'
     */
    position: PanelPosition;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * Focuses the first view in the {@link #children} collection.
     *
     * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
     */
    focus(): void;
    /**
     * Focuses the view element or last item in view collection on opening dropdown's panel.
     *
     * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
     */
    focusLast(): void;
}
/**
 * The position of the panel, relative to the parent.
 */
export type PanelPosition = 's' | 'se' | 'sw' | 'sme' | 'smw' | 'n' | 'ne' | 'nw' | 'nme' | 'nmw';

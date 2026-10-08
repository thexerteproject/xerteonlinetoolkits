/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dropdown/menu/dropdownmenunestedmenupanelview
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../../focuscycler.js';
import { BalloonPanelView } from '../../panel/balloon/balloonpanelview.js';
import '../../../theme/components/dropdown/menu/dropdownmenupanel.css';
/**
 * Represents the view for the dropdown menu panel.
 */
export declare class DropdownMenuNestedMenuPanelView extends BalloonPanelView implements FocusableView {
    /**
     * Creates an instance of the menu panel view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale?: Locale);
    /**
     * Focuses the first child of the panel (default) or the last one if the `direction` is `-1`.
     *
     * @param direction The direction to focus. Default is `1`.
     */
    focus(direction?: -1 | 1): void;
}
/**
 * The names of the positions of the {@link module:ui/dropdown/menu/dropdownmenunestedmenupanelview~DropdownMenuNestedMenuPanelView}.
 *
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type DropdownMenuNestedMenuPanelPosition = 'es' | 'ws' | 'en' | 'wn' | 'w' | 'e';

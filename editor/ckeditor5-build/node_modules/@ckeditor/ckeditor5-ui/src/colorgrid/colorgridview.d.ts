/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorgrid/colorgridview
 */
import { View } from '../view.js';
import { ColorTileView } from './colortileview.js';
import { type DropdownPanelFocusable } from '../dropdown/dropdownpanelfocusable.js';
import { type ViewCollection } from '../viewcollection.js';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/colorgrid/colorgrid.css';
/**
 * A grid of {@link module:ui/colorgrid/colortileview~ColorTileView color tiles}.
 */
export declare class ColorGridView extends View implements DropdownPanelFocusable {
    /**
     * A number of columns for the tiles grid.
     */
    readonly columns: number;
    /**
     * Collection of the child tile views.
     */
    readonly items: ViewCollection<ColorTileView>;
    /**
     * Tracks information about DOM focus in the grid.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The color of the currently selected color tile in {@link #items}.
     *
     * @observable
     */
    selectedColor: string | undefined | null;
    /**
     * Creates an instance of a color grid containing {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
     *
     * @fires execute
     * @param locale The localization services instance.
     * @param options Component configuration
     * @param options.colorDefinitions Array with definitions
     * required to create the {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
     * @param options.columns A number of columns to display the tiles.
     */
    constructor(locale?: Locale, options?: {
        colorDefinitions?: Array<ColorDefinition>;
        columns?: number;
    });
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focus(): void;
    /**
     * Focuses the last focusable in {@link #items}.
     */
    focusLast(): void;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
/**
 * A color definition used to create a {@link module:ui/colorgrid/colortileview~ColorTileView}.
 *
 * ```json
 * {
 * 	color: 'hsl(0, 0%, 75%)',
 * 	label: 'Light Grey',
 * 	options: {
 * 		hasBorder: true
 * 	}
 * }
 * ```
 */
export interface ColorDefinition {
    /**
     * String representing a color.
     * It is used as value of background-color style in {@link module:ui/colorgrid/colortileview~ColorTileView}.
     */
    color: string;
    /**
     * String used as label for {@link module:ui/colorgrid/colortileview~ColorTileView}.
     */
    label: string;
    /**
     * Additional options passed to create a {@link module:ui/colorgrid/colortileview~ColorTileView}.
     */
    options: {
        /**
         * A flag that indicates if special a CSS class should be added
         * to {@link module:ui/colorgrid/colortileview~ColorTileView}, which renders a border around it.
         */
        hasBorder: boolean;
    };
}
/**
 * Fired when the `ColorTileView` for the picked item is executed.
 *
 * @eventName ~ColorGridView#execute
 * @param data Additional information about the event.
*/
export type ColorGridViewExecuteEvent = {
    name: 'execute';
    args: [data: ColorGridViewExecuteEventData];
};
/**
 * The data of {@link ~ColorGridViewExecuteEvent execute event}.
 */
export interface ColorGridViewExecuteEventData {
    /**
     * The value of the selected color ({@link module:ui/colorgrid/colorgridview~ColorDefinition#color `color.color`}).
     */
    value: string;
    /**
     * The `hasBorder` property of the selected color
     * ({@link module:ui/colorgrid/colorgridview~ColorDefinition#options `color.options.hasBorder`}).
     */
    hasBorder: boolean;
    /**
     * The label of the selected color ({@link module:ui/colorgrid/colorgridview~ColorDefinition#label `color.label`})
     */
    label: string;
}

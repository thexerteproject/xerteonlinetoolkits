/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/bindings/addkeyboardhandlingforgrid
 */
import type { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { type ViewCollection } from '../viewcollection.js';
/**
 * A helper that adds a keyboard navigation support (arrow up/down/left/right) for grids.
 *
 * @param options Configuration options.
 * @param options.keystrokeHandler Keystroke handler to register navigation with arrow keys.
 * @param options.focusTracker A focus tracker for grid elements.
 * @param options.gridItems A collection of grid items.
 * @param options.numberOfColumns Number of columns in the grid. Can be specified as a function that returns
 * the number (e.g. for responsive grids).
 * @param options.uiLanguageDirection String of ui language direction.
 */
export declare function addKeyboardHandlingForGrid({ keystrokeHandler, focusTracker, gridItems, numberOfColumns, uiLanguageDirection }: {
    keystrokeHandler: KeystrokeHandler;
    focusTracker: FocusTracker;
    gridItems: ViewCollection;
    numberOfColumns: number | (() => number);
    uiLanguageDirection?: string;
}): void;

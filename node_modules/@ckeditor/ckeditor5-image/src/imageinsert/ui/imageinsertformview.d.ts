/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert/ui/imageinsertformview
 */
import { View, ViewCollection, FocusCycler, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '../../../theme/imageinsert.css';
/**
 * The view displayed in the insert image dropdown.
 *
 * See {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
 *
 * @internal
 */
export declare class ImageInsertFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of views that can be focused in the form.
     */
    protected readonly _focusables: ViewCollection<FocusableView>;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * A collection of the defined integrations for inserting the images.
     */
    private readonly children;
    /**
     * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
     *
     * @param locale The localization services instance.
     * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
     */
    constructor(locale: Locale, integrations?: Array<FocusableView>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the first {@link #_focusables focusable} in the form.
     */
    focus(): void;
}

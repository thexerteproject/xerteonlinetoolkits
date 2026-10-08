/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojipickerformview
 */
import { ButtonView, View, ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../theme/emojipickerform.css';
/**
 * The emoji picker form view.
 */
export declare class EmojiPickerFormView extends View {
    /**
     * The Back button view displayed in the header.
     */
    backButtonView: ButtonView;
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of child views.
     */
    readonly children: ViewCollection;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:emoji/ui/emojipickerformview~EmojiPickerFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus(): void;
    /**
     * Creates a back button view that cancels the form.
     */
    private _createBackButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
}
/**
 * Fired when the form view is canceled, for example with a click on {@link ~EmojiPickerFormView#backButtonView}.
 *
 * @eventName ~EmojiPickerFormView#cancel
 */
export type EmojiPickerFormViewCancelEvent = {
    name: 'cancel';
    args: [];
};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/textarea/textareaview
 */
import { type Locale } from '@ckeditor/ckeditor5-utils';
import { InputBase } from '../input/inputbase.js';
import '../../theme/components/input/input.css';
import '../../theme/components/textarea/textarea.css';
/**
 * The textarea view class.
 *
 * ```ts
 * const textareaView = new TextareaView();
 *
 * textareaView.minRows = 2;
 * textareaView.maxRows = 10;
 *
 * textareaView.render();
 *
 * document.body.append( textareaView.element );
 * ```
 */
export declare class TextareaView extends InputBase<HTMLTextAreaElement> {
    /**
     * Specifies the visible height of a text area, in lines.
     *
     * @observable
     * @default 2
     */
    minRows: number;
    /**
     * Specifies the maximum number of rows.
     *
     * @observable
     * @default 5
     */
    maxRows: number;
    /**
     * Specifies the value of HTML attribute that indicates whether the user can resize the element.
     *
     * @observable
     * @default 'none'
    */
    resize: 'both' | 'horizontal' | 'vertical' | 'none';
    /**
     * An internal property that stores the current height of the textarea. Used for the DOM binding.
     *
     * @observable
     * @default null
     * @internal
     */
    _height: number | null;
    /**
     * An instance of the resize observer used to detect when the view is visible or not and update
     * its height if any changes that affect it were made while it was invisible.
     *
     * **Note:** Created in {@link #render}.
     */
    private _resizeObserver;
    /**
     * A flag that indicates whether the {@link #_updateAutoGrowHeight} method should be called when the view becomes
     * visible again. See {@link #_resizeObserver}.
     */
    private _isUpdateAutoGrowHeightPending;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * @inheritDoc
     */
    reset(): void;
    /**
     * Updates the {@link #_height} of the view depending on {@link #minRows}, {@link #maxRows}, and the current content size.
     *
     * **Note**: This method overrides manual resize done by the user using a handle. It's a known bug.
     */
    private _updateAutoGrowHeight;
    /**
     * Validates the {@link #minRows} and {@link #maxRows} properties and warns in the console if the configuration is incorrect.
     */
    private _validateMinMaxRows;
}
/**
 * Fired every time the layout of the {@link module:ui/textarea/textareaview~TextareaView} possibly changed as a result
 * of the user input or the value change via {@link module:ui/textarea/textareaview~TextareaView#value}.
 *
 * @eventName ~TextareaView#update
 */
export type TextareaViewUpdateEvent = {
    name: 'update';
    args: [];
};

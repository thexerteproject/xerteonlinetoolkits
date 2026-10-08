/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ButtonView } from '../../button/buttonview.js';
import { IconView } from '../../icon/iconview.js';
import { LabeledFieldView, type LabeledFieldViewCreator } from '../../labeledfield/labeledfieldview.js';
import { type InputBase } from '../../input/inputbase.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * A search input field for the {@link module:ui/search/text/searchtextview~SearchTextView} component.
 *
 * @internal
 * @extends module:ui/labeledfield/labeledfieldview~LabeledFieldView
 */
export declare class SearchTextQueryView<TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement>> extends LabeledFieldView<TQueryFieldView> {
    /**
     * The loupe icon displayed next to the {@link #fieldView}.
     */
    iconView?: IconView;
    /**
     * The button that clears and focuses the {@link #fieldView}.
     */
    resetButtonView?: ButtonView;
    /**
     * A reference to the view configuration.
     */
    private readonly _viewConfig;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, config: SearchTextQueryViewConfig<TQueryFieldView>);
    /**
     * Resets the search field to its default state.
     */
    reset(): void;
}
/**
 * An event fired when the field is reset using the
 * {@link module:ui/search/text/searchtextqueryview~SearchTextQueryView#resetButtonView}.
 *
 * @eventName ~SearchTextQueryView#reset
 */
export type SearchTextQueryViewResetEvent = {
    name: 'reset';
    args: [];
};
/**
 * The configuration of the {@link module:ui/search/text/searchtextqueryview~SearchTextQueryView} view.
 */
export interface SearchTextQueryViewConfig<TConfigSearchField extends InputBase<HTMLInputElement | HTMLTextAreaElement>> {
    /**
     * The human-readable label of the search field.
     */
    label: string;
    /**
     * Determines whether the button that resets the search should be visible.
     *
     * @default true
     */
    showResetButton?: boolean;
    /**
     * Determines whether the loupe icon should be visible.
     *
     * @default true
     */
    showIcon?: boolean;
    /**
     * The function that creates the search field input view. By default, a plain
     * {@link module:ui/inputtext/inputtextview~InputTextView} is used for this purpose.
     */
    creator?: LabeledFieldViewCreator<TConfigSearchField>;
}

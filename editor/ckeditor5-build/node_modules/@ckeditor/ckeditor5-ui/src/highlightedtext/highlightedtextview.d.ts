/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/highlightedtext/highlightedtextview
 */
import { View } from '../view.js';
import '../../theme/components/highlightedtext/highlightedtext.css';
/**
 * A class representing a view that displays a text which subset can be highlighted using the
 * {@link #highlightText} method.
 */
export declare class HighlightedTextView extends View {
    /**
     * The text that can be highlighted using the {@link #highlightText} method.
     *
     * **Note:** When this property changes, the previous highlighting is removed.
     *
     * @observable
     */
    text: string | undefined;
    /**
     * @inheritDoc
     */
    constructor();
    /**
     * Highlights view's {@link #text} according to the specified `RegExp`. If the passed RegExp is `null`, the
     * highlighting is removed
     *
     * @param regExp
     */
    highlightText(regExp: RegExp | null): void;
    /**
     * Updates element's `innerHTML` with the passed content.
     */
    private _updateInnerHTML;
}

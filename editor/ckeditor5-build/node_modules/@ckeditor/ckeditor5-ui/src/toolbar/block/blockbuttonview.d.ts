/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/toolbar/block/blockbuttonview
 */
import { ButtonView } from '../../button/buttonview.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
import '../../../theme/components/toolbar/blocktoolbar.css';
/**
 * The block button view class.
 *
 * This view represents a button attached next to block element where the selection is anchored.
 *
 * See {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}.
 */
export declare class BlockButtonView extends ButtonView {
    /**
     * Top offset.
     *
     * @observable
     */
    top: number;
    /**
     * Left offset.
     *
     * @observable
     */
    left: number;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
}

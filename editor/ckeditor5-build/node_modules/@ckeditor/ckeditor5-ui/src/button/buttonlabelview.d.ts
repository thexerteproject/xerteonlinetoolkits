/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/buttonlabelview
 */
import { View } from '../view.js';
import { type ButtonLabel } from './buttonlabel.js';
/**
 * A default implementation of the button view's label. It comes with a dynamic text support
 * via {@link module:ui/button/buttonlabelview~ButtonLabelView#text} property.
 */
export declare class ButtonLabelView extends View implements ButtonLabel {
    /**
     * @inheritDoc
     */
    id: string | undefined;
    /**
     * @inheritDoc
     */
    style: string | undefined;
    /**
     * @inheritDoc
     */
    text: string | undefined;
    /**
     * @inheritDoc
     */
    constructor();
}

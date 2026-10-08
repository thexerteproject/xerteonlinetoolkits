/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/spinner/spinnerview
 */
import { View } from '../view.js';
import '../../theme/components/spinner/spinner.css';
/**
 * The spinner view class.
 */
export declare class SpinnerView extends View {
    /**
     * Controls whether the spinner is visible.
     *
     * @observable
     * @default false
     */
    isVisible: boolean;
    /**
     * @inheritDoc
     */
    constructor();
}

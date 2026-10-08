/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/label/labelview
 */
import { View } from '../view.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/label/label.css';
/**
 * The label view class.
 */
export declare class LabelView extends View {
    /**
     * An unique id of the label. It can be used by other UI components to reference
     * the label, for instance, using the `aria-describedby` DOM attribute.
     */
    readonly id: string;
    /**
     * The text of the label.
     *
     * @observable
     */
    text: string | undefined;
    /**
     * The `for` attribute of the label (i.e. to pair with an `<input>` element).
     *
     * @observable
     */
    for: string | undefined;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgetresize/sizeview
 */
import { View } from '@ckeditor/ckeditor5-ui';
import type { WidgetResizerOptions } from '../widgetresize.js';
import { type WidgetResizeState } from './resizerstate.js';
/**
 * A view displaying the proposed new element size during the resizing.
 *
 * @internal
 */
export declare class SizeView extends View {
    /**
     * The visibility of the view defined based on the existence of the host proposed dimensions.
     *
     * @internal
     * @observable
     * @readonly
     */
    _isVisible: boolean;
    /**
     * The text that will be displayed in the `SizeView` child.
     * It can be formatted as the pixel values (e.g. 10x20) or the percentage value (e.g. 10%).
     *
     * @internal
     * @observable
     * @readonly
     */
    _label: string;
    /**
     * The position of the view defined based on the host size and active handle position.
     *
     * @internal
     * @observable
     * @readonly
     */
    _viewPosition: string;
    constructor();
    /**
     * A method used for binding the `SizeView` instance properties to the `ResizeState` instance observable properties.
     *
     * @internal
     * @param options An object defining the resizer options, used for setting the proper size label.
     * @param resizeState The `ResizeState` class instance, used for keeping the `SizeView` state up to date.
     */
    _bindToState(options: WidgetResizerOptions, resizeState: WidgetResizeState): void;
    /**
     * A method used for cleaning up. It removes the bindings and hides the view.
     *
     * @internal
     */
    _dismiss(): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/lineview
 */
import { View } from '@ckeditor/ckeditor5-ui';
/**
 * The horizontal drop target line view.
 *
 * @internal
 */
export declare class LineView extends View {
    /**
     * Controls whether the line is visible.
     *
     * @observable
     * @default false
     */
    isVisible: boolean;
    /**
     * Controls the line position x coordinate.
     *
     * @observable
     * @default null
     */
    left: number | null;
    /**
     * Controls the line width.
     *
     * @observable
     * @default null
     */
    width: number | null;
    /**
     * Controls the line position y coordinate.
     *
     * @observable
     * @default null
     */
    top: number | null;
    /**
     * @inheritDoc
     */
    constructor();
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagesizeattributes
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ImageUtils } from './imageutils.js';
/**
 * This plugin enables `width` and `height` attributes in inline and block image elements.
 */
export declare class ImageSizeAttributes extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageSizeAttributes";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Registers the `width` and `height` attributes for inline and block images.
     */
    private _registerSchema;
    /**
     * Registers converters for `width` and `height` attributes.
     */
    private _registerConverters;
}

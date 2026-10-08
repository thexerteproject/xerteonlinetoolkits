/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagecaption/imagecaptionui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ImageCaptionUtils } from './imagecaptionutils.js';
/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 */
export declare class ImageCaptionUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageCaptionUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageCaptionUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/image/imageediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ImageUtils } from '../imageutils.js';
/**
 * The image engine plugin. This module loads common code shared between
 * {@link module:image/image/imageinlineediting~ImageInlineEditing} and
 * {@link module:image/image/imageblockediting~ImageBlockEditing} plugins.
 *
 * This plugin registers the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command.
 */
export declare class ImageEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

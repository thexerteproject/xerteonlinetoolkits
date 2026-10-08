/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagestyle/imagestyleediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ImageUtils } from '../imageutils.js';
import type { ImageStyleOptionDefinition } from '../imageconfig.js';
/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 */
export declare class ImageStyleEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageStyleEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * It contains a list of the normalized and validated style options.
     *
     * * Each option contains a complete icon markup.
     * * The style options not supported by any of the loaded image editing plugins (
     * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} or
     * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`}) are filtered out.
     *
     * @internal
     * @readonly
     */
    normalizedStyles?: Array<ImageStyleOptionDefinition>;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Sets the editor conversion taking the presence of
     * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`}
     * and {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugins into consideration.
     */
    private _setupConversion;
    /**
     * Registers a post-fixer that will make sure that the style attribute value is correct for a specific image type (block vs inline).
     */
    private _setupPostFixer;
}

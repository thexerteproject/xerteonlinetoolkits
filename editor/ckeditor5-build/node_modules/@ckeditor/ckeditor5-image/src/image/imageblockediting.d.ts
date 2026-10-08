/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/image/imageblockediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
import { ImageEditing } from './imageediting.js';
import { ImageSizeAttributes } from '../imagesizeattributes.js';
import { ImageUtils } from '../imageutils.js';
import { ImagePlaceholder } from './imageplaceholder.js';
/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<imageBlock>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeBlock'`} command that converts inline images into
 * block images.
 */
export declare class ImageBlockEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageEditing, typeof ImageSizeAttributes, typeof ImageUtils, typeof ImagePlaceholder, typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageBlockEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * block images (block image widgets) and their attributes.
     */
    private _setupConversion;
    /**
     * Integrates the plugin with the clipboard pipeline.
     *
     * Idea is that the feature should recognize the user's intent when an **inline** image is
     * pasted or dropped. If such an image is pasted/dropped:
     *
     * * into an empty block (e.g. an empty paragraph),
     * * on another object (e.g. some block widget).
     *
     * it gets converted into a block image on the fly. We assume this is the user's intent
     * if they decided to put their image there.
     *
     * See the `ImageInlineEditing` for the similar integration that works in the opposite direction.
     *
     * The feature also sets image `width` and `height` attributes on paste.
     */
    private _setupClipboardIntegration;
}

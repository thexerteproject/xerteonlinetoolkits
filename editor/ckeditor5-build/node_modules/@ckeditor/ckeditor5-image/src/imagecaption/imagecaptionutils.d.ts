/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagecaption/imagecaptionutils
 */
import type { ModelDocumentSelection, ModelElement, ModelSelection, ViewElement, Match } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { ImageUtils } from '../imageutils.js';
/**
 * The image caption utilities plugin.
 */
export declare class ImageCaptionUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageCaptionUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils];
    /**
     * Returns the caption model element from a given image element. Returns `null` if no caption is found.
     */
    getCaptionFromImageModelElement(imageModelElement: ModelElement): ModelElement | null;
    /**
     * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
     */
    getCaptionFromModelSelection(selection: ModelSelection | ModelDocumentSelection): ModelElement | null;
    /**
     * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
     * inside the image `<figure>` element.
     * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
     * cannot be matched.
     */
    matchImageCaptionViewElement(element: ViewElement): Match | null;
}

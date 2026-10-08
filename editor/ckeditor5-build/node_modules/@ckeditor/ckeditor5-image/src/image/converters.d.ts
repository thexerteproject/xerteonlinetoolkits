/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/image/converters
 */
import type { DowncastDispatcher, UpcastDispatcher } from 'ckeditor5/src/engine.js';
import { type ImageUtils } from '../imageutils.js';
/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <figure class="image"><img src="..." alt="..."></img></figure>
 * ```
 *
 * to the model representation:
 *
 * ```html
 * <imageBlock src="..." alt="..."></imageBlock>
 * ```
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<imageBlock>` model element.
 *
 * @internal
 */
export declare function upcastImageFigure(imageUtils: ImageUtils): (dispatcher: UpcastDispatcher) => void;
/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <picture><source ... /><source ... />...<img ... /></picture>
 * ```
 *
 * to the model representation as the `sources` attribute:
 *
 * ```html
 * <image[Block|Inline] ... sources="..."></image[Block|Inline]>
 * ```
 *
 * @internal
 */
export declare function upcastPicture(imageUtils: ImageUtils): (dispatcher: UpcastDispatcher) => void;
/**
 * Converter used to convert the `srcset` model image attribute to the `srcset` and `sizes` attributes in the view.
 *
 * @internal
 * @param imageType The type of the image.
 */
export declare function downcastSrcsetAttribute(imageUtils: ImageUtils, imageType: 'imageBlock' | 'imageInline'): (dispatcher: DowncastDispatcher) => void;
/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @internal
 */
export declare function downcastSourcesAttribute(imageUtils: ImageUtils): (dispatcher: DowncastDispatcher) => void;
/**
 * Converter used to convert a given image attribute from the model to the view.
 *
 * @internal
 * @param imageType The type of the image.
 * @param attributeKey The name of the attribute to convert.
 */
export declare function downcastImageAttribute(imageUtils: ImageUtils, imageType: 'imageBlock' | 'imageInline', attributeKey: string): (dispatcher: DowncastDispatcher) => void;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/image/utils
 */
import type { ModelDocumentSelection, MatcherPattern, ModelSchema, ModelSelection, ViewContainerElement, ViewDowncastWriter, ViewElement } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * Creates a view element representing the inline image.
 *
 * ```html
 * <span class="image-inline"><img></img></span>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */
export declare function createInlineImageViewElement(writer: ViewDowncastWriter): ViewContainerElement;
/**
 * Creates a view element representing the block image.
 *
 * ```html
 * <figure class="image"><img></img></figure>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */
export declare function createBlockImageViewElement(writer: ViewDowncastWriter): ViewContainerElement;
/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @internal
 * @param matchImageType The type of created image.
 */
export declare function getImgViewElementMatcher(editor: Editor, matchImageType: 'imageBlock' | 'imageInline'): MatcherPattern;
/**
 * Considering the current model selection, it returns the name of the model image element
 * (`'imageBlock'` or `'imageInline'`) that will make most sense from the UX perspective if a new
 * image was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting images into empty blocks or on other block widgets should
 * produce block images. Inline images should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @internal
 */
export declare function determineImageTypeForInsertionAtSelection(schema: ModelSchema, selection: ModelSelection | ModelDocumentSelection): 'imageBlock' | 'imageInline';
/**
 * Returns parsed value of the size, but only if it contains unit: px.
 *
 * @internal
 */
export declare function getSizeValueIfInPx(size: string | undefined): number | null;
/**
 * Returns true if both styles (width and height) are set.
 *
 * If both image styles: width & height are set, they will override the image width & height attributes in the
 * browser. In this case, the image looks the same as if these styles were applied to attributes instead of styles.
 * That's why we can upcast these styles to width & height attributes instead of resizedWidth and resizedHeight.
 *
 * @internal
 */
export declare function widthAndHeightStylesAreBothSet(viewElement: ViewElement): boolean;

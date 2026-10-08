/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageutils
 */
import type { ModelElement, ViewElement, ModelDocumentSelection, ViewDocumentSelection, ModelSelection, ViewSelection, ViewDowncastWriter, ModelPosition, ViewContainerElement } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * A set of helpers related to images.
 */
export declare class ImageUtils extends Plugin {
    /**
     * DOM Emitter.
     */
    private _domEmitter;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Checks if the provided model element is an `image` or `imageInline`.
     */
    isImage(modelElement?: ModelElement | null): modelElement is ModelElement & {
        name: 'imageInline' | 'imageBlock';
    };
    /**
     * Checks if the provided view element represents an inline image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     */
    isInlineImageView(element?: ViewElement | null): boolean;
    /**
     * Checks if the provided view element represents a block image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     */
    isBlockImageView(element?: ViewElement | null): boolean;
    /**
     * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange}
     * method.
     *
     * ```ts
     * const imageUtils = editor.plugins.get( 'ImageUtils' );
     *
     * imageUtils.insertImage( { src: 'path/to/image.jpg' } );
     * ```
     *
     * @param attributes Attributes of the inserted image.
     * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~ModelSchema}.
     * @param selectable Place to insert the image. If not specified,
     * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
     * and `model.document.selection` for the inline images.
     *
     * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
     * and apply them to the new image. In this case, make sure all selection attributes are passed in `attributes`.
     *
     * @param imageType Image type of inserted image. If not specified,
     * it will be determined automatically depending of editor config or place of the insertion.
     * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
     * The default is `true`.
     * @return The inserted model image element.
     */
    insertImage(attributes?: Record<string, unknown>, selectable?: ModelSelection | ModelPosition | null, imageType?: ('imageBlock' | 'imageInline' | null), options?: {
        setImageSizes?: boolean;
    }): ModelElement | null;
    /**
     * Reads original image sizes and sets them as `width` and `height`.
     *
     * The `src` attribute may not be available if the user is using an upload adapter. In such a case,
     * this method is called again after the upload process is complete and the `src` attribute is available.
     */
    setImageNaturalSizeAttributes(imageElement: ModelElement): void;
    /**
     * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
     */
    getClosestSelectedImageWidget(selection: ViewSelection | ViewDocumentSelection): ViewElement | null;
    /**
     * Returns a image model element if one is selected or is among the selection's ancestors.
     */
    getClosestSelectedImageElement(selection: ModelSelection | ModelDocumentSelection): ModelElement | null;
    /**
     * Returns an image widget editing view based on the passed image view.
     */
    getImageWidgetFromImageView(imageView: ViewElement): ViewContainerElement | null;
    /**
     * Checks if image can be inserted at current model selection.
     *
     * @internal
     */
    isImageAllowed(): boolean;
    /**
     * Converts a given {@link module:engine/view/element~ViewElement} to an image widget:
     * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property} allowing to recognize the image widget
     * element.
     * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
     *
     * @param writer An instance of the view writer.
     * @param label The element's label. It will be concatenated with the image `alt` attribute if one is present.
     */
    toImageWidget(viewElement: ViewElement, writer: ViewDowncastWriter, label: string): ViewElement;
    /**
     * Checks if a given view element is an image widget.
     */
    protected isImageWidget(viewElement: ViewElement): boolean;
    /**
     * Checks if the provided model element is an `image`.
     */
    isBlockImage(modelElement?: ModelElement | null): boolean;
    /**
     * Checks if the provided model element is an `imageInline`.
     */
    isInlineImage(modelElement?: ModelElement | null): boolean;
    /**
     * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
     *
     * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
     */
    findViewImgElement(figureView: ViewElement): ViewElement | undefined;
    /**
     * @inheritDoc
     */
    destroy(): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagecaption/imagecaptionediting
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { ModelElement } from 'ckeditor5/src/engine.js';
import { ImageUtils } from '../imageutils.js';
import { ImageCaptionUtils } from './imagecaptionutils.js';
/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `toggleImageCaption`} command.
 */
export declare class ImageCaptionEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUtils, typeof ImageCaptionUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageCaptionEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * A map that keeps saved JSONified image captions and image model elements they are
     * associated with.
     *
     * To learn more about this system, see {@link #_saveCaption}.
     */
    private _savedCaptionsMap;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * image captions.
     */
    private _setupConversion;
    /**
     * Integrates with {@link module:image/image/imagetypecommand~ImageTypeCommand image type commands}
     * to make sure the caption is preserved when the type of an image changes so it can be restored
     * in the future if the user decides they want their caption back.
     */
    private _setupImageTypeCommandsIntegration;
    /**
     * Returns the saved {@link module:engine/model/element~ModelElement#toJSON JSONified} caption
     * of an image model element.
     *
     * See {@link #_saveCaption}.
     *
     * @internal
     * @param imageModelElement The model element the caption should be returned for.
     * @returns The model caption element or `null` if there is none.
     */
    _getSavedCaption(imageModelElement: ModelElement): ModelElement | null;
    /**
     * Saves a {@link module:engine/model/element~ModelElement#toJSON JSONified} caption for
     * an image element to allow restoring it in the future.
     *
     * A caption is saved every time it gets hidden and/or the type of an image changes. The
     * user should be able to restore it on demand.
     *
     * **Note**: The caption cannot be stored in the image model element attribute because,
     * for instance, when the model state propagates to collaborators, the attribute would get
     * lost (mainly because it does not convert to anything when the caption is hidden) and
     * the states of collaborators' models would de-synchronize causing numerous issues.
     *
     * See {@link #_getSavedCaption}.
     *
     * @internal
     * @param imageModelElement The model element the caption is saved for.
     * @param caption The caption model element to be saved.
     */
    _saveCaption(imageModelElement: ModelElement, caption: ModelElement): void;
    /**
     * Reconverts image caption when image alt attribute changes.
     * The change of alt attribute is reflected in caption's aria-label attribute.
     */
    private _registerCaptionReconversion;
}

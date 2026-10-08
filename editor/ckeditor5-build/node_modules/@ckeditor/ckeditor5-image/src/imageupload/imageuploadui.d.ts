/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageupload/imageuploadui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'uploadImage'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageUpload` button as an alias for backward compatibility.
 *
 * Adds the `'menuBar:uploadImage'` menu button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are the default components
 * through which image upload is available.
 */
export declare class ImageUploadUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageUploadUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates the base for various kinds of the button component provided by this feature.
     */
    private _createButton;
    /**
     * Creates a simple toolbar button, with an icon and a tooltip.
     */
    private _createToolbarButton;
    /**
     * Creates a button for the dropdown view, with an icon, text and no tooltip.
     */
    private _createDropdownButton;
    /**
     * Creates a button for the menu bar.
     */
    private _createMenuBarButton;
}

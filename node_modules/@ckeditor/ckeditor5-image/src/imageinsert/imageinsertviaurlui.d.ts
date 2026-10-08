/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert/imageinsertviaurlui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Dialog } from 'ckeditor5/src/ui.js';
import { ImageInsertUI } from './imageinsertui.js';
/**
 * The image insert via URL plugin (UI part).
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'insertImageViaUrl'` toolbar button,
 * * the `'menuBar:insertImageViaUrl'` menu bar component.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are default components
 * through which inserting image via URL is available.
 */
export declare class ImageInsertViaUrlUI extends Plugin {
    private _imageInsertUI;
    private _formView?;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageInsertViaUrlUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageInsertUI, typeof Dialog];
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Creates the base for various kinds of the button component provided by this feature.
     */
    private _createInsertUrlButton;
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
    /**
     * Creates the form view used to submit the image URL.
     */
    private _createInsertUrlView;
    /**
     * Shows the insert image via URL form view in a modal.
     */
    private _showModal;
    /**
     * Executes appropriate command depending on selection and form value.
     */
    private _handleSave;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageupload/imageuploadprogress
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import '../../theme/imageuploadprogress.css';
import '../../theme/imageuploadicon.css';
import '../../theme/imageuploadloader.css';
/**
 * The image upload progress plugin.
 * It shows a placeholder when the image is read from the disk and a progress bar while the image is uploading.
 */
export declare class ImageUploadProgress extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageUploadProgress";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * The image placeholder that is displayed before real image data can be accessed.
     *
     * For the record, this image is a 1x1 px GIF with an aspect ratio set by CSS.
     */
    private placeholder;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * This method is called each time the image `uploadStatus` attribute is changed.
     *
     * @param evt An object containing information about the fired event.
     * @param data Additional information about the change.
     */
    private uploadStatusChange;
}

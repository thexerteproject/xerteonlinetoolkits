/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module adapter-ckfinder/uploadadapter
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { FileRepository } from 'ckeditor5/src/upload.js';
/**
 * A plugin that enables file uploads in CKEditor 5 using the CKFinder server–side connector.
 *
 * See the {@glink features/file-management/ckfinder "CKFinder file manager integration"} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckfinder/ckfinder~CKFinder} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} guide to learn
 * about other ways to upload images into CKEditor 5.
 */
export declare class CKFinderUploadAdapter extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FileRepository];
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKFinderUploadAdapter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

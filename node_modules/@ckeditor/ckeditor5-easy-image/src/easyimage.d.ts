/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module easy-image/easyimage
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { CloudServicesUploadAdapter } from './cloudservicesuploadadapter.js';
/**
 * The Easy Image feature, which makes the image upload in CKEditor 5 possible with virtually zero
 * server setup. A part of the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/)
 * family.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter}.
 *
 * This plugin requires plugin to be present in the editor configuration:
 *
 * * {@link module:image/image~Image},
 * * {@link module:image/imageupload~ImageUpload},
 *
 * See the [Easy Image Quick Start guide](https://ckeditor.com/docs/cs/latest/guides/easy-image/quick-start.html) to learn how to configure
 * and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload" guide} to learn about
 * other ways to upload images into CKEditor 5.
 *
 * **Note**: After enabling the Easy Image plugin you need to configure the
 * [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/)
 * integration through {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudServices`}.
 */
export declare class EasyImage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "EasyImage";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof CloudServicesUploadAdapter, "ImageUpload"];
    /**
     * @inheritDoc
     */
    init(): void;
}

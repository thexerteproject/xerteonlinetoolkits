/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboxuploadadapter
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { FileRepository } from 'ckeditor5/src/upload.js';
import { CKBoxEditing } from './ckboxediting.js';
/**
 * A plugin that enables file uploads in CKEditor 5 using the CKBox server–side connector.
 * See the {@glink features/file-management/ckbox CKBox file manager integration} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckbox/ckbox~CKBox} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 */
export declare class CKBoxUploadAdapter extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["ImageUploadEditing", "ImageUploadProgress", typeof FileRepository, typeof CKBoxEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKBoxUploadAdapter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): Promise<void>;
}

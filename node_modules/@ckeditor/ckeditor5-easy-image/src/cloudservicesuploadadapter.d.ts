/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
* @module easy-image/cloudservicesuploadadapter
*/
import { Plugin } from 'ckeditor5/src/core.js';
import { FileRepository } from 'ckeditor5/src/upload.js';
/**
 * A plugin that enables upload to [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/).
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the CKEditor Cloud Services integration through
 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudServices`}.
 */
export declare class CloudServicesUploadAdapter extends Plugin {
    private _uploadGateway?;
    /**
     * @inheritDoc
     */
    static get pluginName(): "CloudServicesUploadAdapter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["CloudServices", typeof FileRepository];
    /**
     * @inheritDoc
     */
    init(): void;
}

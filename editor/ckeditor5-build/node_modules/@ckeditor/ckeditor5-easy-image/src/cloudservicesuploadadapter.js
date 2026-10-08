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
export class CloudServicesUploadAdapter extends Plugin {
    _uploadGateway;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CloudServicesUploadAdapter';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return ['CloudServices', FileRepository];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const cloudServices = editor.plugins.get('CloudServices');
        const token = cloudServices.token;
        const uploadUrl = cloudServices.uploadUrl;
        if (!token) {
            return;
        }
        const cloudServicesCore = editor.plugins.get('CloudServicesCore');
        this._uploadGateway = cloudServicesCore.createUploadGateway(token, uploadUrl);
        editor.plugins.get(FileRepository).createUploadAdapter = loader => {
            return new Adapter(this._uploadGateway, loader);
        };
    }
}
class Adapter {
    uploadGateway;
    loader;
    fileUploader;
    constructor(uploadGateway, loader) {
        this.uploadGateway = uploadGateway;
        this.loader = loader;
    }
    upload() {
        return this.loader.file.then(file => {
            this.fileUploader = this.uploadGateway.upload(file);
            this.fileUploader.on('progress', (evt, data) => {
                this.loader.uploadTotal = data.total;
                this.loader.uploaded = data.uploaded;
            });
            return this.fileUploader.send();
        });
    }
    abort() {
        this.fileUploader.abort();
    }
}

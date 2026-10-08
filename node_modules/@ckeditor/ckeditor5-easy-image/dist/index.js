/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { logWarning } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload/dist/index.js';

/**
 * A plugin that enables upload to [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/).
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the CKEditor Cloud Services integration through
 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudServices`}.
 */ class CloudServicesUploadAdapter extends Plugin {
    _uploadGateway;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CloudServicesUploadAdapter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            'CloudServices',
            FileRepository
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const cloudServices = editor.plugins.get('CloudServices');
        const token = cloudServices.token;
        const uploadUrl = cloudServices.uploadUrl;
        if (!token) {
            return;
        }
        const cloudServicesCore = editor.plugins.get('CloudServicesCore');
        this._uploadGateway = cloudServicesCore.createUploadGateway(token, uploadUrl);
        editor.plugins.get(FileRepository).createUploadAdapter = (loader)=>{
            return new Adapter(this._uploadGateway, loader);
        };
    }
}
class Adapter {
    uploadGateway;
    loader;
    fileUploader;
    constructor(uploadGateway, loader){
        this.uploadGateway = uploadGateway;
        this.loader = loader;
    }
    upload() {
        return this.loader.file.then((file)=>{
            this.fileUploader = this.uploadGateway.upload(file);
            this.fileUploader.on('progress', (evt, data)=>{
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
 */ class EasyImage extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EasyImage';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            CloudServicesUploadAdapter,
            'ImageUpload'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('ImageBlockEditing') && !editor.plugins.has('ImageInlineEditing')) {
            /**
			 * The Easy Image feature requires one of the following plugins to be loaded to work correctly:
			 *
			 * * {@link module:image/imageblock~ImageBlock},
			 * * {@link module:image/imageinline~ImageInline},
			 * * {@link module:image/image~Image} (loads both `ImageBlock` and `ImageInline`)
			 *
			 * Please make sure your editor configuration is correct.
			 *
			 * @error easy-image-image-feature-missing
			 * @param {module:core/editor/editor~Editor} editor The editor instance.
			 */ logWarning('easy-image-image-feature-missing', editor);
        }
    }
}

export { CloudServicesUploadAdapter, EasyImage };
//# sourceMappingURL=index.js.map

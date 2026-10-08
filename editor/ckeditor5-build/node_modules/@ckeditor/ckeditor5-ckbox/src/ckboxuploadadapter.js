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
import { getImageUrls, sendHttpRequest } from './utils.js';
import { CKBoxUtils } from './ckboxutils.js';
/**
 * A plugin that enables file uploads in CKEditor 5 using the CKBox server–side connector.
 * See the {@glink features/file-management/ckbox CKBox file manager integration} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckbox/ckbox~CKBox} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 */
export class CKBoxUploadAdapter extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return ['ImageUploadEditing', 'ImageUploadProgress', FileRepository, CKBoxEditing];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CKBoxUploadAdapter';
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
    async afterInit() {
        const editor = this.editor;
        const hasConfiguration = !!editor.config.get('ckbox');
        const isLibraryLoaded = !!window.CKBox;
        // Editor supports only one upload adapter. Register the CKBox upload adapter (and potentially overwrite other one) only when the
        // integrator intentionally wants to use the CKBox plugin, i.e. when the `config.ckbox` exists or the CKBox JavaScript library is
        // loaded.
        if (!hasConfiguration && !isLibraryLoaded) {
            return;
        }
        const fileRepository = editor.plugins.get(FileRepository);
        const ckboxUtils = editor.plugins.get(CKBoxUtils);
        fileRepository.createUploadAdapter = loader => new Adapter(loader, editor, ckboxUtils);
        const shouldInsertDataId = !editor.config.get('ckbox.ignoreDataId');
        const imageUploadEditing = editor.plugins.get('ImageUploadEditing');
        // Mark uploaded assets with the `ckboxImageId` attribute. Its value represents an ID in CKBox.
        if (shouldInsertDataId) {
            imageUploadEditing.on('uploadComplete', (evt, { imageElement, data }) => {
                editor.model.change(writer => {
                    writer.setAttribute('ckboxImageId', data.ckboxImageId, imageElement);
                });
            });
        }
    }
}
/**
 * Upload adapter for CKBox.
 */
class Adapter {
    /**
     * FileLoader instance to use during the upload.
     */
    loader;
    /**
     * CKEditor Cloud Services access token.
     */
    token;
    /**
     * The editor instance.
     */
    editor;
    /**
     * The abort controller for aborting asynchronous processes.
     */
    controller;
    /**
     * The base URL where all requests should be sent.
     */
    serviceOrigin;
    /**
     * The reference to CKBoxUtils plugin.
     */
    ckboxUtils;
    /**
     * Creates a new adapter instance.
     */
    constructor(loader, editor, ckboxUtils) {
        this.loader = loader;
        this.token = ckboxUtils.getToken();
        this.ckboxUtils = ckboxUtils;
        this.editor = editor;
        this.controller = new AbortController();
        this.serviceOrigin = editor.config.get('ckbox.serviceOrigin');
    }
    /**
     * Starts the upload process.
     *
     * @see module:upload/filerepository~UploadAdapter#upload
     */
    async upload() {
        const ckboxUtils = this.ckboxUtils;
        const t = this.editor.t;
        const file = (await this.loader.file);
        const category = await ckboxUtils.getCategoryIdForFile(file, { signal: this.controller.signal });
        const uploadUrl = new URL('assets', this.serviceOrigin);
        const formData = new FormData();
        uploadUrl.searchParams.set('workspaceId', await ckboxUtils.getWorkspaceId());
        formData.append('categoryId', category);
        formData.append('file', file);
        const requestConfig = {
            method: 'POST',
            url: uploadUrl,
            data: formData,
            onUploadProgress: (evt) => {
                /* istanbul ignore else -- @preserve */
                if (evt.lengthComputable) {
                    this.loader.uploadTotal = evt.total;
                    this.loader.uploaded = evt.loaded;
                }
            },
            signal: this.controller.signal,
            authorization: (await this.token).value
        };
        return sendHttpRequest(requestConfig)
            .then(async (data) => {
            const imageUrls = getImageUrls(data.imageUrls);
            return {
                ckboxImageId: data.id,
                default: imageUrls.imageFallbackUrl,
                sources: imageUrls.imageSources
            };
        })
            .catch(() => {
            const genericError = t('Cannot upload file:') + ` ${file.name}.`;
            return Promise.reject(genericError);
        });
    }
    /**
     * Aborts the upload process.
     *
     * @see module:upload/filerepository~UploadAdapter#abort
     */
    abort() {
        this.controller.abort();
    }
}

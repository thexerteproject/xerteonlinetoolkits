/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module upload/adapters/base64uploadadapter
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { FileRepository } from '../filerepository.js';
/**
 * A plugin that converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64)
 * in the {@glink getting-started/setup/getting-and-setting-data editor output}.
 *
 * This kind of image upload does not require server processing – images are stored with the rest of the text and
 * displayed by the web browser without additional requests.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 */
export class Base64UploadAdapter extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [FileRepository];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Base64UploadAdapter';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'B64A';
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
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new Adapter(loader);
    }
}
/**
 * The upload adapter that converts images inserted into the editor into Base64 strings.
 */
class Adapter {
    /**
     * `FileLoader` instance to use during the upload.
     */
    loader;
    reader;
    /**
     * Creates a new adapter instance.
     */
    constructor(loader) {
        this.loader = loader;
    }
    /**
     * Starts the upload process.
     *
     * @see module:upload/filerepository~UploadAdapter#upload
     */
    upload() {
        return new Promise((resolve, reject) => {
            const reader = this.reader = new window.FileReader();
            reader.addEventListener('load', () => {
                resolve({ default: reader.result });
            });
            reader.addEventListener('error', err => {
                reject(err);
            });
            reader.addEventListener('abort', () => {
                reject();
            });
            this.loader.file.then(file => {
                reader.readAsDataURL(file);
            });
        });
    }
    /**
     * Aborts the upload process.
     *
     * @see module:upload/filerepository~UploadAdapter#abort
     */
    abort() {
        this.reader.abort();
    }
}

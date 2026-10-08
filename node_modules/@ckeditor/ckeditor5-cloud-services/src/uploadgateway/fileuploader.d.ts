/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module cloud-services/uploadgateway/fileuploader
 */
import type { UploadResponse } from 'ckeditor5/src/upload.js';
import type { InitializedToken } from '../token/token.js';
declare const FileUploader_base: {
    new (): import("ckeditor5/src/utils.js").Emitter;
    prototype: import("ckeditor5/src/utils.js").Emitter;
};
/**
 * FileUploader class used to upload single file.
 */
export declare class FileUploader extends /* #__PURE__ */ FileUploader_base {
    /**
     * A file that is being uploaded.
     */
    readonly file: Blob;
    xhr?: XMLHttpRequest;
    /**
     * CKEditor Cloud Services access token.
     */
    private readonly _token;
    /**
     * CKEditor Cloud Services API address.
     */
    private readonly _apiAddress;
    /**
     * Creates `FileUploader` instance.
     *
     * @param fileOrData A blob object or a data string encoded with Base64.
     * @param token Token used for authentication.
     * @param apiAddress API address.
     */
    constructor(fileOrData: string | Blob, token: InitializedToken, apiAddress: string);
    /**
     * Registers callback on `progress` event.
     */
    onProgress(callback: (status: {
        total: number;
        uploaded: number;
    }) => void): this;
    /**
     * Registers callback on `error` event. Event is called once when error occurs.
     */
    onError(callback: (error: string) => void): this;
    /**
     * Aborts upload process.
     */
    abort(): void;
    /**
     * Sends XHR request to API.
     */
    send(): Promise<UploadResponse>;
    /**
     * Prepares XHR request.
     */
    private _prepareRequest;
    /**
     * Attaches listeners to the XHR.
     */
    private _attachXHRListeners;
    /**
     * Sends XHR request.
     */
    private _sendRequest;
}
/**
 * Fired when error occurs.
 *
 * @eventName ~FileUploader#error
 * @param error Error message
 */
export type CloudServicesFileUploaderErrorEvent = {
    name: 'error';
    args: [error: string];
};
/**
 * Fired on upload progress.
 *
 * @eventName ~FileUploader#progress
 * @param status Total and uploaded status
 */
export type CloudServicesFileUploaderProgressErrorEvent = {
    name: 'progress';
    args: [status: {
        total: number;
        uploaded: number;
    }];
};
export {};

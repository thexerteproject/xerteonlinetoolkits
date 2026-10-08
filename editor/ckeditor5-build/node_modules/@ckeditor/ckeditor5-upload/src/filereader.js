/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module upload/filereader
 */
import { ObservableMixin } from '@ckeditor/ckeditor5-utils';
/**
 * Wrapper over the native `FileReader`.
 */
export class FileReader extends /* #__PURE__ */ ObservableMixin() {
    total;
    /**
     * Instance of native FileReader.
     */
    _reader;
    /**
     * Holds the data of an already loaded file. The file must be first loaded
     * by using {@link module:upload/filereader~FileReader#read `read()`}.
     */
    _data;
    /**
     * Creates an instance of the FileReader.
     */
    constructor() {
        super();
        const reader = new window.FileReader();
        this._reader = reader;
        this._data = undefined;
        this.set('loaded', 0);
        reader.onprogress = evt => {
            this.loaded = evt.loaded;
        };
    }
    /**
     * Returns error that occurred during file reading.
     */
    get error() {
        return this._reader.error;
    }
    /**
     * Holds the data of an already loaded file. The file must be first loaded
     * by using {@link module:upload/filereader~FileReader#read `read()`}.
     */
    get data() {
        return this._data;
    }
    /**
     * Reads the provided file.
     *
     * @param file Native File object.
     * @returns Returns a promise that will be resolved with file's content.
     * The promise will be rejected in case of an error or when the reading process is aborted.
     */
    read(file) {
        const reader = this._reader;
        this.total = file.size;
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                const result = reader.result;
                this._data = result;
                resolve(result);
            };
            reader.onerror = () => {
                reject('error');
            };
            reader.onabort = () => {
                reject('aborted');
            };
            this._reader.readAsDataURL(file);
        });
    }
    /**
     * Aborts file reader.
     */
    abort() {
        this._reader.abort();
    }
}

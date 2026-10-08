/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload/dist/index.js';

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module adapter-ckfinder/utils
 */ const TOKEN_COOKIE_NAME = 'ckCsrfToken';
const TOKEN_LENGTH = 40;
const tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';
/**
 * Returns the CSRF token value. The value is a hash stored in `document.cookie`
 * under the `ckCsrfToken` key. The CSRF token can be used to secure the communication
 * between the web browser and the CKFinder server.
 *
 * @internal
 */ function getCsrfToken() {
    let token = getCookie(TOKEN_COOKIE_NAME);
    if (!token || token.length != TOKEN_LENGTH) {
        token = generateToken(TOKEN_LENGTH);
        setCookie(TOKEN_COOKIE_NAME, token);
    }
    return token;
}
/**
 * Returns the value of the cookie with a given name or `null` if the cookie is not found.
 *
 * @internal
 */ function getCookie(name) {
    name = name.toLowerCase();
    const parts = document.cookie.split(';');
    for (const part of parts){
        const pair = part.split('=');
        const key = decodeURIComponent(pair[0].trim().toLowerCase());
        if (key === name) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}
/**
 * Sets the value of the cookie with a given name.
 *
 * @internal
 */ function setCookie(name, value) {
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';path=/';
}
/**
 * Generates the CSRF token with the given length.
 */ function generateToken(length) {
    let result = '';
    const randValues = new Uint8Array(length);
    window.crypto.getRandomValues(randValues);
    for(let j = 0; j < randValues.length; j++){
        const character = tokenCharset.charAt(randValues[j] % tokenCharset.length);
        result += Math.random() > 0.5 ? character.toUpperCase() : character;
    }
    return result;
}

/**
 * A plugin that enables file uploads in CKEditor 5 using the CKFinder server–side connector.
 *
 * See the {@glink features/file-management/ckfinder "CKFinder file manager integration"} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckfinder/ckfinder~CKFinder} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} guide to learn
 * about other ways to upload images into CKEditor 5.
 */ class CKFinderUploadAdapter extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FileRepository
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKFinderUploadAdapter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const url = this.editor.config.get('ckfinder.uploadUrl');
        if (!url) {
            return;
        }
        // Register CKFinderAdapter
        this.editor.plugins.get(FileRepository).createUploadAdapter = (loader)=>new UploadAdapter(loader, url, this.editor.t);
    }
}
/**
 * Upload adapter for CKFinder.
 */ class UploadAdapter {
    /**
	 * FileLoader instance to use during the upload.
	 */ loader;
    /**
	 * Upload URL.
	 */ url;
    /**
	 * Locale translation method.
	 */ t;
    xhr;
    /**
	 * Creates a new adapter instance.
	 */ constructor(loader, url, t){
        this.loader = loader;
        this.url = url;
        this.t = t;
    }
    /**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */ upload() {
        return this.loader.file.then((file)=>{
            return new Promise((resolve, reject)=>{
                this._initRequest();
                this._initListeners(resolve, reject, file);
                this._sendRequest(file);
            });
        });
    }
    /**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */ abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }
    /**
	 * Initializes the XMLHttpRequest object.
	 */ _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();
        xhr.open('POST', this.url, true);
        xhr.responseType = 'json';
    }
    /**
	 * Initializes XMLHttpRequest listeners.
	 *
	 * @param resolve Callback function to be called when the request is successful.
	 * @param reject Callback function to be called when the request cannot be completed.
	 * @param file File instance to be uploaded.
	 */ _initListeners(resolve, reject, file) {
        const xhr = this.xhr;
        const loader = this.loader;
        const t = this.t;
        const genericError = t('Cannot upload file:') + ` ${file.name}.`;
        xhr.addEventListener('error', ()=>reject(genericError));
        xhr.addEventListener('abort', ()=>reject());
        xhr.addEventListener('load', ()=>{
            const response = xhr.response;
            if (!response || !response.uploaded) {
                return reject(response && response.error && response.error.message ? response.error.message : genericError);
            }
            resolve({
                default: response.url
            });
        });
        // Upload progress when it's supported.
        /* istanbul ignore else -- @preserve */ if (xhr.upload) {
            xhr.upload.addEventListener('progress', (evt)=>{
                if (evt.lengthComputable) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            });
        }
    }
    /**
	 * Prepares the data and sends the request.
	 *
	 * @param file File instance to be uploaded.
	 */ _sendRequest(file) {
        // Prepare form data.
        const data = new FormData();
        data.append('upload', file);
        data.append('ckCsrfToken', getCsrfToken());
        // Send request.
        this.xhr.send(data);
    }
}

export { CKFinderUploadAdapter, getCookie as _getCKFinderCookie, getCsrfToken as _getCKFinderCsrfToken, setCookie as _setCKFinderCookie };
//# sourceMappingURL=index.js.map

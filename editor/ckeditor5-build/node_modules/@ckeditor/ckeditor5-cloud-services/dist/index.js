/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ContextPlugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ObservableMixin, CKEditorError, logWarning, EmitterMixin } from '@ckeditor/ckeditor5-utils/dist/index.js';

const DEFAULT_OPTIONS = {
    autoRefresh: true
};
const DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME = 3600000; // 1 hour
const TOKEN_FAILED_REFRESH_TIMEOUT_TIME = 5000; // 5 seconds
/**
 * The class representing the token used for communication with CKEditor Cloud Services.
 * The value of the token is retrieved from the specified URL and refreshed every 1 hour by default.
 * If the token retrieval fails, the token will automatically retry in 5 seconds intervals.
 */ class Token extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * Base refreshing function.
	 */ _refresh;
    /**
	 * Cached token options.
	 */ _options;
    /**
	 * `setTimeout()` id for a token refresh when {@link module:cloud-services/token/token~CloudServicesTokenOptions auto refresh}
	 * is enabled.
	 */ _tokenRefreshTimeout;
    /**
	 * Flag indicating whether the token has been destroyed.
	 */ _isDestroyed = false;
    /**
	 * Creates `Token` instance.
	 * Method `init` should be called after using the constructor or use `create` method instead.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 */ constructor(tokenUrlOrRefreshToken, options = {}){
        super();
        if (!tokenUrlOrRefreshToken) {
            /**
			 * A `tokenUrl` must be provided as the first constructor argument.
			 *
			 * @error token-missing-token-url
			 */ throw new CKEditorError('token-missing-token-url', this);
        }
        if (options.initValue) {
            this._validateTokenValue(options.initValue);
        }
        this.set('value', options.initValue);
        if (typeof tokenUrlOrRefreshToken === 'function') {
            this._refresh = tokenUrlOrRefreshToken;
        } else {
            this._refresh = ()=>defaultRefreshToken(tokenUrlOrRefreshToken);
        }
        this._options = {
            ...DEFAULT_OPTIONS,
            ...options
        };
    }
    /**
	 * Initializes the token.
	 */ init() {
        return new Promise((resolve, reject)=>{
            if (!this.value) {
                this.refreshToken().then(resolve).catch(reject);
                return;
            }
            if (this._options.autoRefresh) {
                this._registerRefreshTokenTimeout();
            }
            resolve(this);
        });
    }
    /**
	 * Refresh token method. Useful in a method form as it can be overridden in tests.
	 *
	 * This method will be invoked periodically based on the token expiry date after first call to keep the token up-to-date
	 * (requires {@link module:cloud-services/token/token~CloudServicesTokenOptions auto refresh option} to be set).
	 *
	 * If the token refresh fails, the method will retry in 5 seconds intervals until success or the token gets
	 * {@link #destroy destroyed}.
	 */ refreshToken() {
        const autoRefresh = this._options.autoRefresh;
        return this._refresh().then((value)=>{
            this._validateTokenValue(value);
            this.set('value', value);
            if (autoRefresh) {
                this._registerRefreshTokenTimeout();
            }
            return this;
        }).catch((err)=>{
            /**
				 * You will see this warning when the CKEditor {@link module:cloud-services/token/token~Token token} could not be refreshed.
				 * This may be a result of a network error, a token endpoint (server) error, or an invalid
				 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl token URL configuration}.
				 *
				 * If this warning repeats, please make sure that the configuration is correct and that the token
				 * endpoint is up and running. {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl Learn more}
				 * about token configuration.
				 *
				 * **Note:** If the token's {@link module:cloud-services/token/token~CloudServicesTokenOptions auto refresh option}
				 * is enabled, attempts to refresh will be made until success or token's
				 * {@link module:cloud-services/token/token~Token#destroy destruction}.
				 *
				 * @error token-refresh-failed
				 * @param {boolean} autoRefresh Whether the token will keep auto refreshing.
				 */ logWarning('token-refresh-failed', {
                autoRefresh
            });
            // If the refresh failed, keep trying to refresh the token. Failing to do so will eventually
            // lead to the disconnection from the RTC service and the editing session (and potential data loss
            // if the user keeps editing).
            if (autoRefresh) {
                this._registerRefreshTokenTimeout(TOKEN_FAILED_REFRESH_TIMEOUT_TIME);
            }
            throw err;
        });
    }
    /**
	 * Destroys token instance. Stops refreshing.
	 */ destroy() {
        this._isDestroyed = true;
        clearTimeout(this._tokenRefreshTimeout);
    }
    /**
	 * Checks whether the provided token follows the JSON Web Tokens (JWT) format.
	 *
	 * @param tokenValue The token to validate.
	 */ _validateTokenValue(tokenValue) {
        // The token must be a string.
        const isString = typeof tokenValue === 'string';
        // The token must be a plain string without quotes ("").
        const isPlainString = !/^".*"$/.test(tokenValue);
        // JWT token contains 3 parts: header, payload, and signature.
        // Each part is separated by a dot.
        const isJWTFormat = isString && tokenValue.split('.').length === 3;
        if (!(isPlainString && isJWTFormat)) {
            /**
			 * The provided token must follow the [JSON Web Tokens](https://jwt.io/introduction/) format.
			 *
			 * @error token-not-in-jwt-format
			 */ throw new CKEditorError('token-not-in-jwt-format', this);
        }
    }
    /**
	 * Registers a refresh token timeout for the time taken from token.
	 */ _registerRefreshTokenTimeout(timeoutTime) {
        clearTimeout(this._tokenRefreshTimeout);
        if (this._isDestroyed) {
            return;
        }
        const tokenRefreshTimeoutTime = timeoutTime || this._getTokenRefreshTimeoutTime();
        this._tokenRefreshTimeout = setTimeout(()=>{
            this.refreshToken();
        }, tokenRefreshTimeoutTime);
    }
    /**
	 * Returns token refresh timeout time calculated from expire time in the token payload.
	 *
	 * If the token parse fails or the token payload doesn't contain, the default DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME is returned.
	 */ _getTokenRefreshTimeoutTime() {
        try {
            const [, binaryTokenPayload] = this.value.split('.');
            const { exp: tokenExpireTime } = JSON.parse(atob(binaryTokenPayload));
            if (!tokenExpireTime) {
                return DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME;
            }
            // Check if the token expire time exceeds 32-bit integer range
            // It could happen if the token expire time is provided in milliseconds instead of seconds.
            if (tokenExpireTime > 2147483647) {
                console.warn('Token expiration time exceeds 32-bit integer range. This might cause unpredictable token refresh timing. ' + 'Token expiration time should always be provided in seconds.', {
                    tokenExpireTime
                });
            }
            const tokenRefreshTimeoutTime = Math.floor((tokenExpireTime * 1000 - Date.now()) / 2);
            return tokenRefreshTimeoutTime;
        } catch  {
            return DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME;
        }
    }
    /**
	 * Creates a initialized {@link module:cloud-services/token/token~Token} instance.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 */ static create(tokenUrlOrRefreshToken, options = {}) {
        const token = new Token(tokenUrlOrRefreshToken, options);
        return token.init();
    }
}
/**
 * This function is called in a defined interval by the {@link ~Token} class. It also can be invoked manually.
 * It should return a promise, which resolves with the new token value.
 * If any error occurs it should return a rejected promise with an error message.
 */ function defaultRefreshToken(tokenUrl) {
    return new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('GET', tokenUrl);
        xhr.addEventListener('load', ()=>{
            const statusCode = xhr.status;
            const xhrResponse = xhr.response;
            if (statusCode < 200 || statusCode > 299) {
                /**
				 * Cannot download new token from the provided url.
				 *
				 * @error token-cannot-download-new-token
				 */ return reject(new CKEditorError('token-cannot-download-new-token', null));
            }
            return resolve(xhrResponse);
        });
        xhr.addEventListener('error', ()=>reject(new Error('Network Error')));
        xhr.addEventListener('abort', ()=>reject(new Error('Abort')));
        xhr.send();
    });
}

const BASE64_HEADER_REG_EXP = /^data:(\S*?);base64,/;
/**
 * FileUploader class used to upload single file.
 */ class FileUploader extends /* #__PURE__ */ EmitterMixin() {
    /**
	 * A file that is being uploaded.
	 */ file;
    xhr;
    /**
	 * CKEditor Cloud Services access token.
	 */ _token;
    /**
	 * CKEditor Cloud Services API address.
	 */ _apiAddress;
    /**
	 * Creates `FileUploader` instance.
	 *
	 * @param fileOrData A blob object or a data string encoded with Base64.
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */ constructor(fileOrData, token, apiAddress){
        super();
        if (!fileOrData) {
            /**
			 * File must be provided as the first argument.
			 *
			 * @error fileuploader-missing-file
			 */ throw new CKEditorError('fileuploader-missing-file', null);
        }
        if (!token) {
            /**
			 * Token must be provided as the second argument.
			 *
			 * @error fileuploader-missing-token
			 */ throw new CKEditorError('fileuploader-missing-token', null);
        }
        if (!apiAddress) {
            /**
			 * Api address must be provided as the third argument.
			 *
			 * @error fileuploader-missing-api-address
			 */ throw new CKEditorError('fileuploader-missing-api-address', null);
        }
        this.file = _isBase64(fileOrData) ? _base64ToBlob(fileOrData) : fileOrData;
        this._token = token;
        this._apiAddress = apiAddress;
    }
    /**
	 * Registers callback on `progress` event.
	 */ onProgress(callback) {
        this.on('progress', (event, data)=>callback(data));
        return this;
    }
    /**
	 * Registers callback on `error` event. Event is called once when error occurs.
	 */ onError(callback) {
        this.once('error', (event, data)=>callback(data));
        return this;
    }
    /**
	 * Aborts upload process.
	 */ abort() {
        this.xhr.abort();
    }
    /**
	 * Sends XHR request to API.
	 */ send() {
        this._prepareRequest();
        this._attachXHRListeners();
        return this._sendRequest();
    }
    /**
	 * Prepares XHR request.
	 */ _prepareRequest() {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this._apiAddress);
        xhr.setRequestHeader('Authorization', this._token.value);
        xhr.responseType = 'json';
        this.xhr = xhr;
    }
    /**
	 * Attaches listeners to the XHR.
	 */ _attachXHRListeners() {
        const xhr = this.xhr;
        const onError = (message)=>{
            return ()=>this.fire('error', message);
        };
        xhr.addEventListener('error', onError('Network Error'));
        xhr.addEventListener('abort', onError('Abort'));
        /* istanbul ignore else -- @preserve */ if (xhr.upload) {
            xhr.upload.addEventListener('progress', (event)=>{
                if (event.lengthComputable) {
                    this.fire('progress', {
                        total: event.total,
                        uploaded: event.loaded
                    });
                }
            });
        }
        xhr.addEventListener('load', ()=>{
            const statusCode = xhr.status;
            const xhrResponse = xhr.response;
            if (statusCode < 200 || statusCode > 299) {
                return this.fire('error', xhrResponse.message || xhrResponse.error);
            }
        });
    }
    /**
	 * Sends XHR request.
	 */ _sendRequest() {
        const formData = new FormData();
        const xhr = this.xhr;
        formData.append('file', this.file);
        return new Promise((resolve, reject)=>{
            xhr.addEventListener('load', ()=>{
                const statusCode = xhr.status;
                const xhrResponse = xhr.response;
                if (statusCode < 200 || statusCode > 299) {
                    if (xhrResponse.message) {
                        /**
						 * Uploading file failed.
						 *
						 * @error fileuploader-uploading-data-failed
						 */ return reject(new CKEditorError('fileuploader-uploading-data-failed', this, {
                            message: xhrResponse.message
                        }));
                    }
                    return reject(xhrResponse.error);
                }
                return resolve(xhrResponse);
            });
            xhr.addEventListener('error', ()=>reject(new Error('Network Error')));
            xhr.addEventListener('abort', ()=>reject(new Error('Abort')));
            xhr.send(formData);
        });
    }
}
/**
 * Transforms Base64 string data into file.
 *
 * @param base64 String data.
 */ function _base64ToBlob(base64, sliceSize = 512) {
    try {
        const contentType = base64.match(BASE64_HEADER_REG_EXP)[1];
        const base64Data = atob(base64.replace(BASE64_HEADER_REG_EXP, ''));
        const byteArrays = [];
        for(let offset = 0; offset < base64Data.length; offset += sliceSize){
            const slice = base64Data.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for(let i = 0; i < slice.length; i++){
                byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        return new Blob(byteArrays, {
            type: contentType
        });
    } catch  {
        /**
		 * Problem with decoding Base64 image data.
		 *
		 * @error fileuploader-decoding-image-data-error
		 */ throw new CKEditorError('fileuploader-decoding-image-data-error', null);
    }
}
/**
 * Checks that string is Base64.
 */ function _isBase64(string) {
    if (typeof string !== 'string') {
        return false;
    }
    return !!string.match(BASE64_HEADER_REG_EXP)?.length;
}

/**
 * UploadGateway abstracts file uploads to CKEditor Cloud Services.
 */ class UploadGateway {
    /**
	 * CKEditor Cloud Services access token.
	 */ _token;
    /**
	 * CKEditor Cloud Services API address.
	 */ _apiAddress;
    /**
	 * Creates `UploadGateway` instance.
	 *
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */ constructor(token, apiAddress){
        if (!token) {
            /**
			 * Token must be provided.
			 *
			 * @error uploadgateway-missing-token
			 */ throw new CKEditorError('uploadgateway-missing-token', null);
        }
        if (!apiAddress) {
            /**
			 * Api address must be provided.
			 *
			 * @error uploadgateway-missing-api-address
			 */ throw new CKEditorError('uploadgateway-missing-api-address', null);
        }
        this._token = token;
        this._apiAddress = apiAddress;
    }
    /**
	 * Creates a {@link module:cloud-services/uploadgateway/fileuploader~FileUploader} instance that wraps
	 * file upload process. The file is being sent at a time when the
	 * {@link module:cloud-services/uploadgateway/fileuploader~FileUploader#send} method is called.
	 *
	 * ```ts
	 * const token = await Token.create( 'https://token-endpoint' );
	 * new UploadGateway( token, 'https://example.org' )
	 * 	.upload( 'FILE' )
	 * 	.onProgress( ( data ) => console.log( data ) )
	 * 	.send()
	 * 	.then( ( response ) => console.log( response ) );
	 * ```
	 *
	 * @param {Blob|String} fileOrData A blob object or a data string encoded with Base64.
	 * @returns {module:cloud-services/uploadgateway/fileuploader~FileUploader} Returns `FileUploader` instance.
	 */ upload(fileOrData) {
        return new FileUploader(fileOrData, this._token, this._apiAddress);
    }
}

/**
 * The `CloudServicesCore` plugin exposes the base API for communication with CKEditor Cloud Services.
 */ class CloudServicesCore extends ContextPlugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CloudServicesCore';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Creates the {@link module:cloud-services/token/token~Token} instance.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 * @param options.initValue Initial value of the token.
	 * @param options.autoRefresh Specifies whether to start the refresh automatically.
	 */ createToken(tokenUrlOrRefreshToken, options) {
        return new Token(tokenUrlOrRefreshToken, options);
    }
    /**
	 * Creates the {@link module:cloud-services/uploadgateway/uploadgateway~UploadGateway} instance.
	 *
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */ createUploadGateway(token, apiAddress) {
        return new UploadGateway(token, apiAddress);
    }
}

/**
 * Plugin introducing the integration between CKEditor 5 and CKEditor Cloud Services .
 *
 * It initializes the token provider based on
 * the {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudService`}.
 */ class CloudServices extends ContextPlugin {
    /**
	 * The authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
	 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
	 */ tokenUrl;
    /**
	 * The URL to which the files should be uploaded.
	 */ uploadUrl;
    /**
	 * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
	 * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
	 * CKEditor Ecosystem customer dashboard.
	 *
	 * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
	 * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
	 */ webSocketUrl;
    /**
	 * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
	 *
	 * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
	 * the new bundle (build + configuration) from the old ones.
	 */ bundleVersion;
    /**
	 * Specifies whether the token should be automatically refreshed when it expires.
	 */ autoRefresh = true;
    /**
	 * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
	 * Its value is `null` when {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} is not provided.
	 *
	 * @readonly
	 */ token = null;
    /**
	 * A map of token object instances keyed by the token URLs.
	 */ _tokens = new Map();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CloudServices';
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
            CloudServicesCore
        ];
    }
    /**
	 * @inheritDoc
	 */ async init() {
        const config = this.context.config;
        const options = config.get('cloudServices') || {};
        for (const [key, value] of Object.entries(options)){
            this[key] = value;
        }
        if (!this.tokenUrl) {
            this.token = null;
            return;
        }
        // Initialization of the token may fail. By default, the token is being refreshed on the failure.
        // The problem is that if this happens here, then the token refresh interval will be executed even
        // after destroying the editor (as the exception was thrown from `init` method). To prevent that
        // behavior we need to catch the exception and destroy the uninitialized token instance.
        // See: https://github.com/ckeditor/ckeditor5/issues/17531
        const cloudServicesCore = this.context.plugins.get('CloudServicesCore');
        const uninitializedToken = cloudServicesCore.createToken(this.tokenUrl, {
            autoRefresh: this.autoRefresh
        });
        try {
            this.token = await uninitializedToken.init();
            this._tokens.set(this.tokenUrl, this.token);
        } catch (error) {
            uninitializedToken.destroy();
            throw error;
        }
    }
    /**
	 * Registers an additional authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
	 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
	 *
	 * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 */ async registerTokenUrl(tokenUrl) {
        // Reuse the token instance in case of multiple features using the same token URL.
        if (this._tokens.has(tokenUrl)) {
            return this.getTokenFor(tokenUrl);
        }
        const cloudServicesCore = this.context.plugins.get('CloudServicesCore');
        const token = await cloudServicesCore.createToken(tokenUrl, {
            autoRefresh: this.autoRefresh
        }).init();
        this._tokens.set(tokenUrl, token);
        return token;
    }
    /**
	 * Returns an authentication token provider previously registered by {@link #registerTokenUrl}.
	 *
	 * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 */ getTokenFor(tokenUrl) {
        const token = this._tokens.get(tokenUrl);
        if (!token) {
            /**
			 * The provided `tokenUrl` was not registered by {@link module:cloud-services/cloudservices~CloudServices#registerTokenUrl}.
			 *
			 * @error cloudservices-token-not-registered
			 */ throw new CKEditorError('cloudservices-token-not-registered', this);
        }
        return token;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        for (const token of this._tokens.values()){
            token.destroy();
        }
    }
}

export { CloudServices, CloudServicesCore, Token };
//# sourceMappingURL=index.js.map

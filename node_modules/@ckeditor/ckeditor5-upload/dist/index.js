/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, PendingActions } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ObservableMixin, Collection, logWarning, uid, CKEditorError } from '@ckeditor/ckeditor5-utils/dist/index.js';

/**
 * Wrapper over the native `FileReader`.
 */ class FileReader extends /* #__PURE__ */ ObservableMixin() {
    total;
    /**
	 * Instance of native FileReader.
	 */ _reader;
    /**
	 * Holds the data of an already loaded file. The file must be first loaded
	 * by using {@link module:upload/filereader~FileReader#read `read()`}.
	 */ _data;
    /**
	 * Creates an instance of the FileReader.
	 */ constructor(){
        super();
        const reader = new window.FileReader();
        this._reader = reader;
        this._data = undefined;
        this.set('loaded', 0);
        reader.onprogress = (evt)=>{
            this.loaded = evt.loaded;
        };
    }
    /**
	 * Returns error that occurred during file reading.
	 */ get error() {
        return this._reader.error;
    }
    /**
	 * Holds the data of an already loaded file. The file must be first loaded
	 * by using {@link module:upload/filereader~FileReader#read `read()`}.
	 */ get data() {
        return this._data;
    }
    /**
	 * Reads the provided file.
	 *
	 * @param file Native File object.
	 * @returns Returns a promise that will be resolved with file's content.
	 * The promise will be rejected in case of an error or when the reading process is aborted.
	 */ read(file) {
        const reader = this._reader;
        this.total = file.size;
        return new Promise((resolve, reject)=>{
            reader.onload = ()=>{
                const result = reader.result;
                this._data = result;
                resolve(result);
            };
            reader.onerror = ()=>{
                reject('error');
            };
            reader.onabort = ()=>{
                reject('aborted');
            };
            this._reader.readAsDataURL(file);
        });
    }
    /**
	 * Aborts file reader.
	 */ abort() {
        this._reader.abort();
    }
}

/**
 * File repository plugin. A central point for managing file upload.
 *
 * To use it, first you need an upload adapter. Upload adapter's job is to handle communication with the server
 * (sending the file and handling server's response). You can use one of the existing plugins introducing upload adapters
 * (e.g. {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter} or
 * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}) or write your own one – see
 * the {@glink framework/deep-dive/upload-adapter Custom image upload adapter deep-dive} guide.
 *
 * Then, you can use {@link module:upload/filerepository~FileRepository#createLoader `createLoader()`} and the returned
 * {@link module:upload/filerepository~FileLoader} instance to load and upload files.
 */ class FileRepository extends Plugin {
    /**
	 * Collection of loaders associated with this repository.
	 */ loaders = new Collection();
    /**
	 * Loaders mappings used to retrieve loaders references.
	 */ _loadersMap = new Map();
    /**
	 * Reference to a pending action registered in a {@link module:core/pendingactions~PendingActions} plugin
	 * while upload is in progress. When there is no upload then value is `null`.
	 */ _pendingAction = null;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FileRepository';
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
            PendingActions
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        // Keeps upload in a sync with pending actions.
        this.loaders.on('change', ()=>this._updatePendingAction());
        this.set('uploaded', 0);
        this.set('uploadTotal', null);
        this.bind('uploadedPercent').to(this, 'uploaded', this, 'uploadTotal', (uploaded, total)=>{
            return total ? uploaded / total * 100 : 0;
        });
    }
    /**
	 * Returns the loader associated with specified file or promise.
	 *
	 * To get loader by id use `fileRepository.loaders.get( id )`.
	 *
	 * @param fileOrPromise Native file or promise handle.
	 */ getLoader(fileOrPromise) {
        return this._loadersMap.get(fileOrPromise) || null;
    }
    /**
	 * Creates a loader instance for the given file.
	 *
	 * Requires {@link #createUploadAdapter} factory to be defined.
	 *
	 * @param fileOrPromise Native File object or native Promise object which resolves to a File.
	 */ createLoader(fileOrPromise) {
        if (!this.createUploadAdapter) {
            /**
			 * You need to enable an upload adapter in order to be able to upload files.
			 *
			 * This warning shows up when {@link module:upload/filerepository~FileRepository} is being used
			 * without {@link module:upload/filerepository~FileRepository#createUploadAdapter defining an upload adapter}.
			 *
			 * **If you see this warning when using one of the now deprecated
			 * {@glink getting-started/legacy/installation-methods/predefined-builds CKEditor 5 Builds}**
			 * it means that you did not configure any of the upload adapters available by default in those builds.
			 *
			 * Predefined builds are a deprecated solution and we strongly advise
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrating to new installation methods}.
			 *
			 * See the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn which upload
			 * adapters are available in the builds and how to configure them.
			 *
			 * Otherwise, if you see this warning, there is a chance that you enabled
			 * a feature like {@link module:image/imageupload~ImageUpload},
			 * or {@link module:image/imageupload/imageuploadui~ImageUploadUI} but you did not enable any upload adapter.
			 * You can choose one of the existing upload adapters listed in the
			 * {@glink features/images/image-upload/image-upload "Image upload overview"}.
			 *
			 * You can also implement your {@glink framework/deep-dive/upload-adapter own image upload adapter}.
			 *
			 * @error filerepository-no-upload-adapter
			 */ logWarning('filerepository-no-upload-adapter');
            return null;
        }
        const loader = new FileLoader(Promise.resolve(fileOrPromise), this.createUploadAdapter);
        this.loaders.add(loader);
        this._loadersMap.set(fileOrPromise, loader);
        // Store also file => loader mapping so loader can be retrieved by file instance returned upon Promise resolution.
        if (fileOrPromise instanceof Promise) {
            loader.file.then((file)=>{
                this._loadersMap.set(file, loader);
            })// Every then() must have a catch().
            // File loader state (and rejections) are handled in read() and upload().
            // Also, see the "does not swallow the file promise rejection" test.
            .catch(()=>{});
        }
        loader.on('change:uploaded', ()=>{
            let aggregatedUploaded = 0;
            for (const loader of this.loaders){
                aggregatedUploaded += loader.uploaded;
            }
            this.uploaded = aggregatedUploaded;
        });
        loader.on('change:uploadTotal', ()=>{
            let aggregatedTotal = 0;
            for (const loader of this.loaders){
                if (loader.uploadTotal) {
                    aggregatedTotal += loader.uploadTotal;
                }
            }
            this.uploadTotal = aggregatedTotal;
        });
        return loader;
    }
    /**
	 * Destroys the given loader.
	 *
	 * @param fileOrPromiseOrLoader File or Promise associated with that loader or loader itself.
	 */ destroyLoader(fileOrPromiseOrLoader) {
        const loader = fileOrPromiseOrLoader instanceof FileLoader ? fileOrPromiseOrLoader : this.getLoader(fileOrPromiseOrLoader);
        loader._destroy();
        this.loaders.remove(loader);
        this._loadersMap.forEach((value, key)=>{
            if (value === loader) {
                this._loadersMap.delete(key);
            }
        });
    }
    /**
	 * Registers or deregisters pending action bound with upload progress.
	 */ _updatePendingAction() {
        const pendingActions = this.editor.plugins.get(PendingActions);
        if (this.loaders.length) {
            if (!this._pendingAction) {
                const t = this.editor.t;
                const getMessage = (value)=>`${t('Upload in progress')} ${parseInt(value)}%.`;
                this._pendingAction = pendingActions.add(getMessage(this.uploadedPercent));
                this._pendingAction.bind('message').to(this, 'uploadedPercent', getMessage);
            }
        } else {
            pendingActions.remove(this._pendingAction);
            this._pendingAction = null;
        }
    }
}
/**
 * File loader class.
 *
 * It is used to control the process of reading the file and uploading it using the specified upload adapter.
 */ class FileLoader extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * Unique id of FileLoader instance.
	 *
	 * @readonly
	 */ id;
    /**
	 * Additional wrapper over the initial file promise passed to this loader.
	 */ _filePromiseWrapper;
    /**
	 * Adapter instance associated with this file loader.
	 */ _adapter;
    /**
	 * FileReader used by FileLoader.
	 */ _reader;
    /**
	 * Creates a new instance of `FileLoader`.
	 *
	 * @param filePromise A promise which resolves to a file instance.
	 * @param uploadAdapterCreator The function which returns {@link module:upload/filerepository~UploadAdapter} instance.
	 */ constructor(filePromise, uploadAdapterCreator){
        super();
        this.id = uid();
        this._filePromiseWrapper = this._createFilePromiseWrapper(filePromise);
        this._adapter = uploadAdapterCreator(this);
        this._reader = new FileReader();
        this.set('status', 'idle');
        this.set('uploaded', 0);
        this.set('uploadTotal', null);
        this.bind('uploadedPercent').to(this, 'uploaded', this, 'uploadTotal', (uploaded, total)=>{
            return total ? uploaded / total * 100 : 0;
        });
        this.set('uploadResponse', null);
    }
    /**
	 * A `Promise` which resolves to a `File` instance associated with this file loader.
	 */ get file() {
        if (!this._filePromiseWrapper) {
            // Loader was destroyed, return promise which resolves to null.
            return Promise.resolve(null);
        } else {
            // The `this._filePromiseWrapper.promise` is chained and not simply returned to handle a case when:
            //
            //		* The `loader.file.then( ... )` is called by external code (returned promise is pending).
            //		* Then `loader._destroy()` is called (call is synchronous) which destroys the `loader`.
            //		* Promise returned by the first `loader.file.then( ... )` call is resolved.
            //
            // Returning `this._filePromiseWrapper.promise` will still resolve to a `File` instance so there
            // is an additional check needed in the chain to see if `loader` was destroyed in the meantime.
            return this._filePromiseWrapper.promise.then((file)=>this._filePromiseWrapper ? file : null);
        }
    }
    /**
	 * Returns the file data. To read its data, you need for first load the file
	 * by using the {@link module:upload/filerepository~FileLoader#read `read()`} method.
	 */ get data() {
        return this._reader.data;
    }
    /**
	 * Reads file using {@link module:upload/filereader~FileReader}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-read-wrong-status` when status
	 * is different than `idle`.
	 *
	 * Example usage:
	 *
	 * ```ts
	 * fileLoader.read()
	 * 	.then( data => { ... } )
	 * 	.catch( err => {
	 * 		if ( err === 'aborted' ) {
	 * 			console.log( 'Reading aborted.' );
	 * 		} else {
	 * 			console.log( 'Reading error.', err );
	 * 		}
	 * 	} );
	 * ```
	 *
	 * @returns Returns promise that will be resolved with read data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */ read() {
        if (this.status != 'idle') {
            /**
			 * You cannot call read if the status is different than idle.
			 *
			 * @error filerepository-read-wrong-status
			 */ throw new CKEditorError('filerepository-read-wrong-status', this);
        }
        this.status = 'reading';
        return this.file.then((file)=>this._reader.read(file)).then((data)=>{
            // Edge case: reader was aborted after file was read - double check for proper status.
            // It can happen when image was deleted during its upload.
            if (this.status !== 'reading') {
                throw this.status;
            }
            this.status = 'idle';
            return data;
        }).catch((err)=>{
            if (err === 'aborted') {
                this.status = 'aborted';
                throw 'aborted';
            }
            this.status = 'error';
            throw this._reader.error ? this._reader.error : err;
        });
    }
    /**
	 * Reads file using the provided {@link module:upload/filerepository~UploadAdapter}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-upload-wrong-status` when status
	 * is different than `idle`.
	 * Example usage:
	 *
	 * ```ts
	 * fileLoader.upload()
	 * 	.then( data => { ... } )
	 * 	.catch( e => {
	 * 		if ( e === 'aborted' ) {
	 * 			console.log( 'Uploading aborted.' );
	 * 		} else {
	 * 			console.log( 'Uploading error.', e );
	 * 		}
	 * 	} );
	 * ```
	 *
	 * @returns Returns promise that will be resolved with response data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */ upload() {
        if (this.status != 'idle') {
            /**
			 * You cannot call upload if the status is different than idle.
			 *
			 * @error filerepository-upload-wrong-status
			 */ throw new CKEditorError('filerepository-upload-wrong-status', this);
        }
        this.status = 'uploading';
        return this.file.then(()=>this._adapter.upload()).then((data)=>{
            this.uploadResponse = data;
            this.status = 'idle';
            return data;
        }).catch((err)=>{
            if (this.status === 'aborted') {
                throw 'aborted';
            }
            this.status = 'error';
            throw err;
        });
    }
    /**
	 * Aborts loading process.
	 */ abort() {
        const status = this.status;
        this.status = 'aborted';
        if (!this._filePromiseWrapper.isFulfilled) {
            // Edge case: file loader is aborted before read() is called
            // so it might happen that no one handled the rejection of this promise.
            // See https://github.com/ckeditor/ckeditor5-upload/pull/100
            this._filePromiseWrapper.promise.catch(()=>{});
            this._filePromiseWrapper.rejecter('aborted');
        } else if (status == 'reading') {
            this._reader.abort();
        } else if (status == 'uploading' && this._adapter.abort) {
            this._adapter.abort();
        }
        this._destroy();
    }
    /**
	 * Performs cleanup.
	 *
	 * @internal
	 */ _destroy() {
        this._filePromiseWrapper = undefined;
        this._reader = undefined;
        this._adapter = undefined;
        this.uploadResponse = undefined;
    }
    /**
	 * Wraps a given file promise into another promise giving additional
	 * control (resolving, rejecting, checking if fulfilled) over it.
	 *
	 * @param filePromise The initial file promise to be wrapped.
	 */ _createFilePromiseWrapper(filePromise) {
        const wrapper = {};
        wrapper.promise = new Promise((resolve, reject)=>{
            wrapper.rejecter = reject;
            wrapper.isFulfilled = false;
            filePromise.then((file)=>{
                wrapper.isFulfilled = true;
                resolve(file);
            }).catch((err)=>{
                wrapper.isFulfilled = true;
                reject(err);
            });
        });
        return wrapper;
    }
}

/**
 * A plugin that converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64)
 * in the {@glink getting-started/setup/getting-and-setting-data editor output}.
 *
 * This kind of image upload does not require server processing – images are stored with the rest of the text and
 * displayed by the web browser without additional requests.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 */ class Base64UploadAdapter extends Plugin {
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
        return 'Base64UploadAdapter';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'B64A';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this.editor.plugins.get(FileRepository).createUploadAdapter = (loader)=>new Adapter$1(loader);
    }
}
/**
 * The upload adapter that converts images inserted into the editor into Base64 strings.
 */ let Adapter$1 = class Adapter {
    /**
	 * `FileLoader` instance to use during the upload.
	 */ loader;
    reader;
    /**
	 * Creates a new adapter instance.
	 */ constructor(loader){
        this.loader = loader;
    }
    /**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */ upload() {
        return new Promise((resolve, reject)=>{
            const reader = this.reader = new window.FileReader();
            reader.addEventListener('load', ()=>{
                resolve({
                    default: reader.result
                });
            });
            reader.addEventListener('error', (err)=>{
                reject(err);
            });
            reader.addEventListener('abort', ()=>{
                reject();
            });
            this.loader.file.then((file)=>{
                reader.readAsDataURL(file);
            });
        });
    }
    /**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */ abort() {
        this.reader.abort();
    }
};

/**
 * The Simple upload adapter allows uploading images to an application running on your server using
 * the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API with a
 * minimal {@link module:upload/uploadconfig~SimpleUploadConfig editor configuration}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		simpleUpload: {
 * 			uploadUrl: 'http://example.com',
 * 			headers: {
 * 				...
 * 			}
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See the {@glink features/images/image-upload/simple-upload-adapter "Simple upload adapter"} guide to learn how to
 * learn more about the feature (configuration, server–side requirements, etc.).
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 */ class SimpleUploadAdapter extends Plugin {
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
        return 'SimpleUploadAdapter';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'SUA';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const options = this.editor.config.get('simpleUpload');
        if (!options) {
            return;
        }
        if (!options.uploadUrl) {
            /**
			 * The {@link module:upload/uploadconfig~SimpleUploadConfig#uploadUrl `config.simpleUpload.uploadUrl`}
			 * configuration required by the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter `SimpleUploadAdapter`}
			 * is missing. Make sure the correct URL is specified for the image upload to work properly.
			 *
			 * @error simple-upload-adapter-missing-uploadurl
			 */ logWarning('simple-upload-adapter-missing-uploadurl');
            return;
        }
        this.editor.plugins.get(FileRepository).createUploadAdapter = (loader)=>{
            return new Adapter(loader, options);
        };
    }
}
/**
 * Upload adapter.
 */ class Adapter {
    /**
	 * FileLoader instance to use during the upload.
	 */ loader;
    /**
	 * The configuration of the adapter.
	 */ options;
    xhr;
    /**
	 * Creates a new adapter instance.
	 */ constructor(loader, options){
        this.loader = loader;
        this.options = options;
    }
    /**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */ upload() {
        return this.loader.file.then((file)=>new Promise((resolve, reject)=>{
                this._initRequest();
                this._initListeners(resolve, reject, file);
                this._sendRequest(file);
            }));
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
	 * Initializes the `XMLHttpRequest` object using the URL specified as
	 * {@link module:upload/uploadconfig~SimpleUploadConfig#uploadUrl `simpleUpload.uploadUrl`} in the editor's
	 * configuration.
	 */ _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();
        xhr.open('POST', this.options.uploadUrl, true);
        xhr.responseType = 'json';
    }
    /**
	 * Initializes XMLHttpRequest listeners
	 *
	 * @param resolve Callback function to be called when the request is successful.
	 * @param reject Callback function to be called when the request cannot be completed.
	 * @param file Native File object.
	 */ _initListeners(resolve, reject, file) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${file.name}.`;
        xhr.addEventListener('error', ()=>reject(genericErrorText));
        xhr.addEventListener('abort', ()=>reject());
        xhr.addEventListener('load', ()=>{
            const response = xhr.response;
            if (!response || response.error) {
                return reject(response && response.error && response.error.message ? response.error.message : genericErrorText);
            }
            const urls = response.url ? {
                default: response.url
            } : response.urls;
            // Resolve with the normalized `urls` property and pass the rest of the response
            // to allow customizing the behavior of features relying on the upload adapters.
            resolve({
                ...response,
                urls
            });
        });
        // Upload progress when it is supported.
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
        // Set headers if specified.
        let headers = this.options.headers || {};
        if (typeof headers === 'function') {
            headers = headers(file);
        }
        // Use the withCredentials flag if specified.
        const withCredentials = this.options.withCredentials || false;
        for (const headerName of Object.keys(headers)){
            this.xhr.setRequestHeader(headerName, headers[headerName]);
        }
        this.xhr.withCredentials = withCredentials;
        // Prepare the form data.
        const data = new FormData();
        data.append('upload', file);
        // Send the request.
        this.xhr.send(data);
    }
}

export { Base64UploadAdapter, FileReader, FileRepository, SimpleUploadAdapter };
//# sourceMappingURL=index.js.map

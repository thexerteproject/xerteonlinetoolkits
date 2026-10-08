/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module upload/filerepository
 */
import { Plugin, PendingActions } from '@ckeditor/ckeditor5-core';
import { Collection } from '@ckeditor/ckeditor5-utils';
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
 */
export declare class FileRepository extends Plugin {
    /**
     * Collection of loaders associated with this repository.
     */
    loaders: Collection<FileLoader>;
    /**
     * A factory function which should be defined before using `FileRepository`.
     *
     * It should return a new instance of {@link module:upload/filerepository~UploadAdapter} that will be used to upload files.
     * {@link module:upload/filerepository~FileLoader} instance associated with the adapter
     * will be passed to that function.
     *
     * For more information and example see {@link module:upload/filerepository~UploadAdapter}.
     */
    createUploadAdapter?: (loader: FileLoader) => UploadAdapter;
    /**
     * Loaders mappings used to retrieve loaders references.
     */
    private _loadersMap;
    /**
     * Reference to a pending action registered in a {@link module:core/pendingactions~PendingActions} plugin
     * while upload is in progress. When there is no upload then value is `null`.
     */
    private _pendingAction;
    /**
     * Number of bytes uploaded.
     *
     * @readonly
     * @observable
     */
    uploaded: number;
    /**
     * Number of total bytes to upload.
     *
     * It might be different than the file size because of headers and additional data.
     * It contains `null` if value is not available yet, so it's better to use {@link #uploadedPercent} to monitor
     * the progress.
     *
     * @readonly
     * @observable
     */
    uploadTotal: number | null;
    /**
     * Upload progress in percents.
     *
     * @readonly
     * @observable
     */
    uploadedPercent: number;
    /**
     * @inheritDoc
     */
    static get pluginName(): "FileRepository";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof PendingActions];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns the loader associated with specified file or promise.
     *
     * To get loader by id use `fileRepository.loaders.get( id )`.
     *
     * @param fileOrPromise Native file or promise handle.
     */
    getLoader(fileOrPromise: File | Promise<File>): FileLoader | null;
    /**
     * Creates a loader instance for the given file.
     *
     * Requires {@link #createUploadAdapter} factory to be defined.
     *
     * @param fileOrPromise Native File object or native Promise object which resolves to a File.
     */
    createLoader(fileOrPromise: File | Promise<File>): FileLoader | null;
    /**
     * Destroys the given loader.
     *
     * @param fileOrPromiseOrLoader File or Promise associated with that loader or loader itself.
     */
    destroyLoader(fileOrPromiseOrLoader: File | Promise<File> | FileLoader): void;
    /**
     * Registers or deregisters pending action bound with upload progress.
     */
    private _updatePendingAction;
}
declare const FileLoader_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * File loader class.
 *
 * It is used to control the process of reading the file and uploading it using the specified upload adapter.
 */
declare class FileLoader extends /* #__PURE__ */ FileLoader_base {
    /**
     * Unique id of FileLoader instance.
     *
     * @readonly
     */
    readonly id: string;
    /**
     * Additional wrapper over the initial file promise passed to this loader.
     */
    private _filePromiseWrapper;
    /**
     * Adapter instance associated with this file loader.
     */
    private _adapter;
    /**
     * FileReader used by FileLoader.
     */
    private _reader;
    /**
     * Current status of FileLoader. It can be one of the following:
     *
     * * 'idle',
     * * 'reading',
     * * 'uploading',
     * * 'aborted',
     * * 'error'.
     *
     * When reading status can change in a following way:
     *
     * `idle` -> `reading` -> `idle`
     * `idle` -> `reading -> `aborted`
     * `idle` -> `reading -> `error`
     *
     * When uploading status can change in a following way:
     *
     * `idle` -> `uploading` -> `idle`
     * `idle` -> `uploading` -> `aborted`
     * `idle` -> `uploading` -> `error`
     *
     * @readonly
     * @observable
     */
    status: 'idle' | 'reading' | 'uploading' | 'aborted' | 'error';
    /**
     * Number of bytes uploaded.
     *
     * @readonly
     * @observable
     */
    uploaded: number;
    /**
     * Number of total bytes to upload.
     *
     * @readonly
     * @observable
     */
    uploadTotal: number | null;
    /**
     * Upload progress in percents.
     *
     * @readonly
     * @observable
     */
    uploadedPercent: number;
    /**
     * Response of the upload.
     *
     * @readonly
     * @observable
     */
    uploadResponse?: UploadResponse | null;
    /**
     * Creates a new instance of `FileLoader`.
     *
     * @param filePromise A promise which resolves to a file instance.
     * @param uploadAdapterCreator The function which returns {@link module:upload/filerepository~UploadAdapter} instance.
     */
    constructor(filePromise: Promise<File>, uploadAdapterCreator: (loader: FileLoader) => UploadAdapter);
    /**
     * A `Promise` which resolves to a `File` instance associated with this file loader.
     */
    get file(): Promise<File | null>;
    /**
     * Returns the file data. To read its data, you need for first load the file
     * by using the {@link module:upload/filerepository~FileLoader#read `read()`} method.
     */
    get data(): string | undefined;
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
     */
    read(): Promise<string>;
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
     */
    upload(): Promise<UploadResponse>;
    /**
     * Aborts loading process.
     */
    abort(): void;
    /**
     * Performs cleanup.
     *
     * @internal
     */
    _destroy(): void;
    /**
     * Wraps a given file promise into another promise giving additional
     * control (resolving, rejecting, checking if fulfilled) over it.
     *
     * @param filePromise The initial file promise to be wrapped.
     */
    private _createFilePromiseWrapper;
}
export { FileLoader };
/**
 * Upload adapter interface used by the {@link module:upload/filerepository~FileRepository file repository}
 * to handle file upload. An upload adapter is a bridge between the editor and server that handles file uploads.
 * It should contain a logic necessary to initiate an upload process and monitor its progress.
 *
 * Learn how to develop your own upload adapter for CKEditor 5 in the
 * {@glink framework/deep-dive/upload-adapter "Custom upload adapter"} guide.
 *
 * @interface UploadAdapter
 */
export interface UploadAdapter {
    /**
     * Executes the upload process.
     * This method should return a promise that will resolve when data will be uploaded to server. Promise should be
     * resolved with an object containing information about uploaded file:
     *
     * ```json
     * {
     * 	default: 'http://server/default-size.image.png'
     * }
     * ```
     *
     * Additionally, other image sizes can be provided:
     *
     * ```json
     * {
     * 	default: 'http://server/default-size.image.png',
     * 	'160': 'http://server/size-160.image.png',
     * 	'500': 'http://server/size-500.image.png',
     * 	'1000': 'http://server/size-1000.image.png',
     * 	'1052': 'http://server/default-size.image.png'
     * }
     * ```
     *
     * You can also pass additional properties from the server. In this case you need to wrap URLs
     * in the `urls` object and pass additional properties along the `urls` property.
     *
     * ```json
     * {
     * 	myCustomProperty: 'foo',
     * 	urls: {
     * 		default: 'http://server/default-size.image.png',
     * 		'160': 'http://server/size-160.image.png',
     * 		'500': 'http://server/size-500.image.png',
     * 		'1000': 'http://server/size-1000.image.png',
     * 		'1052': 'http://server/default-size.image.png'
     * 	}
     * }
     * ```
     *
     * NOTE: When returning multiple images, the widest returned one should equal the default one. It is essential to
     * correctly set `width` attribute of the image. See this discussion:
     * https://github.com/ckeditor/ckeditor5-easy-image/issues/4 for more information.
     *
     * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
     * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
     *
     * @returns Promise that should be resolved when data is uploaded.
     */
    upload(): Promise<UploadResponse>;
    /**
     * Aborts the upload process.
     * After aborting it should reject promise returned from {@link #upload upload()}.
     *
     * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
     * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
     */
    abort?(): void;
}
export type UploadResponse = Record<string, unknown>;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
declare const FileReader_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Wrapper over the native `FileReader`.
 */
export declare class FileReader extends /* #__PURE__ */ FileReader_base {
    total: number;
    /**
     * Instance of native FileReader.
     */
    private readonly _reader;
    /**
     * Holds the data of an already loaded file. The file must be first loaded
     * by using {@link module:upload/filereader~FileReader#read `read()`}.
     */
    private _data?;
    /**
     * Number of bytes loaded.
     *
     * @readonly
     * @observable
     */
    loaded: number;
    /**
     * Creates an instance of the FileReader.
     */
    constructor();
    /**
     * Returns error that occurred during file reading.
     */
    get error(): DOMException | null;
    /**
     * Holds the data of an already loaded file. The file must be first loaded
     * by using {@link module:upload/filereader~FileReader#read `read()`}.
     */
    get data(): string | undefined;
    /**
     * Reads the provided file.
     *
     * @param file Native File object.
     * @returns Returns a promise that will be resolved with file's content.
     * The promise will be rejected in case of an error or when the reading process is aborted.
     */
    read(file: File): Promise<string>;
    /**
     * Aborts file reader.
     */
    abort(): void;
}
export {};

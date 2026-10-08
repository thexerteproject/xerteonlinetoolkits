/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/utils
 */
import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { CKBoxImageUrls } from './ckboxconfig.js';
/**
 * Converts image source set provided by the CKBox into an object containing:
 * - responsive URLs for the "webp" image format,
 * - one fallback URL for browsers that do not support the "webp" format.
 *
 * @internal
 */
export declare function getImageUrls(imageUrls: CKBoxImageUrls): {
    imageFallbackUrl: string;
    imageSources: Array<{
        srcset: string;
        sizes: string;
        type: string;
    }>;
};
/**
 * Returns a workspace id to use for communication with the CKBox service.
 *
 * @param defaultWorkspaceId The default workspace to use taken from editor config.
 * @internal
 */
export declare function getWorkspaceId(token: InitializedToken, defaultWorkspaceId?: string): string | null;
/**
 * Generates an image data URL from its `blurhash` representation.
 *
 * @internal
 */
export declare function blurHashToDataUrl(hash?: string): string | undefined;
/**
 * Sends the HTTP request.
 *
 * @internal
 * @param options Configuration options
 * @param options.url The URL where the request will be sent.
 * @param options.signal The AbortSignal to abort the request when needed.
 * @param options.authorization The authorization token for the request.
 * @param options.method The HTTP method (default: 'GET').
 * @param options.data Additional data to send.
 * @param options.onUploadProgress A callback informing about the upload progress.
 */
export declare function sendHttpRequest({ url, method, data, onUploadProgress, signal, authorization }: {
    url: URL;
    signal: AbortSignal;
    authorization: string;
    method?: 'GET' | 'POST';
    data?: FormData | null;
    onUploadProgress?: (evt: ProgressEvent) => void;
}): Promise<any>;
/**
 * Returns an extension a typical file in the specified `mimeType` format would have.
 *
 * @internal
 */
export declare function convertMimeTypeToExtension(mimeType: string): string;
/**
 * Tries to fetch the given `url` and returns 'content-type' of the response.
 *
 * @internal
 */
export declare function getContentTypeOfUrl(url: string, options: {
    signal: AbortSignal;
}): Promise<string>;
/**
 * Returns an extension from the given value.
 *
 * @internal
 */
export declare function getFileExtension(file: File): string;

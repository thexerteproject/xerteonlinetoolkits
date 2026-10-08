/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/wait
 */
/**
 * Returns a promise that is resolved after the specified time.
 *
 * @param timeout The time in milliseconds to wait.
 * @param options.signal A signal to abort the waiting.
 */
export declare function wait(timeout: number, options?: {
    signal?: AbortSignal;
}): Promise<void>;

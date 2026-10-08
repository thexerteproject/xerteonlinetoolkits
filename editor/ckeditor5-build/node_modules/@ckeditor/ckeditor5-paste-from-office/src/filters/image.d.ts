/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/image
 */
import { type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Replaces source attribute of all `<img>` elements representing regular
 * images (not the Word shapes) with inlined base64 image representation extracted from RTF or Blob data.
 *
 * @param documentFragment Document fragment on which transform images.
 * @param rtfData The RTF data from which images representation will be used.
 * @internal
 */
export declare function replaceImagesSourceWithBase64(documentFragment: ViewDocumentFragment, rtfData: string): void;
/**
 * Converts given HEX string to base64 representation.
 *
 * @internal
 * @param hexString The HEX string to be converted.
 * @returns Base64 representation of a given HEX string.
 */
export declare function _convertHexToBase64(hexString: string): string;

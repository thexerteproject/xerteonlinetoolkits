/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
/**
 * Updates JSON file under a specified path.
 *
 * @param filePath Path to a file on disk.
 * @param updateFunction Function that will be called with a parsed JSON object. It should return the modified JSON object to save.
 */
export default function updateJSONFile(filePath: string, updateFunction: (json: object) => object): void;

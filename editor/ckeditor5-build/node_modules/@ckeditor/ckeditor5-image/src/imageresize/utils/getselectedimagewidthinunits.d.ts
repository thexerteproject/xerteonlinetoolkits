/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from 'ckeditor5/src/core.js';
import { type DimensionWithUnit } from './tryparsedimensionwithunit.js';
/**
 * Returns image width in specified units. It is width of image after resize.
 *
 * 	* If image is not selected or command is disabled then `null` will be returned.
 * 	* If image is not fully loaded (and it is impossible to determine its natural size) then `null` will be returned.
 *	* If `targetUnit` percentage is passed then it will return width percentage of image related to its accessors.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Parsed image width after resize (with unit).
 * @internal
 */
export declare function getSelectedImageWidthInUnits(editor: Editor, targetUnit: string): DimensionWithUnit | null;

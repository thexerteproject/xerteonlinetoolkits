/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageresize/utils/getselectedimagepossibleresizerange
 */
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * Returns min and max value of resize image in specified unit.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Possible resize range in numeric form.
 * @internal
 */
export declare function getSelectedImagePossibleResizeRange(editor: Editor, targetUnit: string): PossibleResizeImageRange | null;
/**
 * @internal
 */
export type PossibleResizeImageRange = {
    unit: string;
    lower: number;
    upper: number;
};

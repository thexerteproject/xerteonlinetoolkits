/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { calculateResizeHostAncestorWidth } from 'ckeditor5/src/widget.js';
import { getSelectedImageEditorNodes } from './getselectedimageeditornodes.js';
import { tryCastDimensionsToUnit, tryParseDimensionWithUnit } from './tryparsedimensionwithunit.js';
/**
 * Returns min and max value of resize image in specified unit.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Possible resize range in numeric form.
 * @internal
 */
export function getSelectedImagePossibleResizeRange(editor, targetUnit) {
    const imageNodes = getSelectedImageEditorNodes(editor);
    if (!imageNodes) {
        return null;
    }
    const imageParentWidthPx = calculateResizeHostAncestorWidth(imageNodes.dom);
    const minimumImageWidth = tryParseDimensionWithUnit(window.getComputedStyle(imageNodes.dom).minWidth) || {
        value: 1,
        unit: 'px'
    };
    const lower = Math.max(0.1, tryCastDimensionsToUnit(imageParentWidthPx, minimumImageWidth, targetUnit).value);
    const upper = targetUnit === 'px' ? imageParentWidthPx : 100;
    return {
        unit: targetUnit,
        lower,
        upper
    };
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/utils/ui/contextualballoon
 */
import { type DomOptimalPositionOptions } from 'ckeditor5/src/utils.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @internal
 * @param editor The editor instance.
 * @param target Either "cell" or "table". Determines the target the balloon will be attached to.
 */
export declare function repositionContextualBalloon(editor: Editor, target: string): void;
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table in the editor content.
 *
 * @param editor The editor instance.
 */
export declare function getBalloonTablePositionData(editor: Editor): Partial<DomOptimalPositionOptions>;
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table cell in the editor content.
 *
 * @param editor The editor instance.
 * @internal
 */
export declare function getBalloonCellPositionData(editor: Editor): Partial<DomOptimalPositionOptions>;

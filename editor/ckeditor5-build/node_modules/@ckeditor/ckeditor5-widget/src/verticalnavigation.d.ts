/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/verticalnavigation
 */
import { type GetCallback } from '@ckeditor/ckeditor5-utils';
import type { EditingController, ViewDocumentArrowKeyEvent } from '@ckeditor/ckeditor5-engine';
/**
 * Returns 'keydown' handler for up/down arrow keys that modifies the caret movement if it's in a text line next to an object.
 *
 * @param editing The editing controller.
 */
export declare function verticalWidgetNavigationHandler(editing: EditingController): GetCallback<ViewDocumentArrowKeyEvent>;

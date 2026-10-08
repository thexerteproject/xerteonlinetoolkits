/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core
 */
export { Plugin } from './plugin.js';
export { Command } from './command.js';
export { MultiCommand } from './multicommand.js';
export { CommandCollection } from './commandcollection.js';
export { Context } from './context.js';
export { ContextPlugin } from './contextplugin.js';
export { EditingKeystrokeHandler } from './editingkeystrokehandler.js';
export { Editor } from './editor/editor.js';
export { attachToForm } from './editor/utils/attachtoform.js';
export { ElementApiMixin } from './editor/utils/elementapimixin.js';
export { secureSourceElement } from './editor/utils/securesourceelement.js';
export { PendingActions } from './pendingactions.js';
export { Accessibility, DEFAULT_GROUP_ID as _DEFAULT_ACCESSIBILITY_GROUP_ID } from './accessibility.js';
export { getEditorUsageData as _getEditorUsageData } from './editor/utils/editorusagedata.js';
import './augmentation.js';

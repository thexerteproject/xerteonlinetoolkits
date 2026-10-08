/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/utils
 */
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * Helper method for creating toolbar and menu buttons and linking them with an appropriate command.
 *
 * @internal
 * @param editor The editor instance to which the UI component will be added.
 * @param commandName The name of the command.
 * @param label The button label.
 * @param icon The source of the icon.
 */
export declare function createUIComponents(editor: Editor, commandName: 'bulletedList' | 'numberedList' | 'todoList', label: string, icon: string): void;

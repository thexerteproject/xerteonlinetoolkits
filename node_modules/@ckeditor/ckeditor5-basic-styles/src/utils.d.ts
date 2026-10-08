/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/utils
 */
import type { Editor, Plugin } from 'ckeditor5/src/core.js';
import { MenuBarMenuListItemButtonView, type ButtonView } from 'ckeditor5/src/ui.js';
/**
 * Returns a function that creates a (toolbar or menu bar) button for a basic style feature.
 *
 * @internal
 */
export declare function getButtonCreator({ editor, commandName, plugin, icon, label, keystroke }: {
    editor: Editor;
    commandName: string;
    icon: string;
    label: string;
    plugin: Plugin;
    keystroke?: string;
}): <T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(ButtonClass: T) => InstanceType<T>;

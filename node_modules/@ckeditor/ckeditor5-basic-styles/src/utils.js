/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
/**
 * Returns a function that creates a (toolbar or menu bar) button for a basic style feature.
 *
 * @internal
 */
export function getButtonCreator({ editor, commandName, plugin, icon, label, keystroke }) {
    return (ButtonClass) => {
        const command = editor.commands.get(commandName);
        const view = new ButtonClass(editor.locale);
        view.set({
            label,
            icon,
            keystroke,
            isToggleable: true
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        view.bind('isOn').to(command, 'value');
        if (view instanceof MenuBarMenuListItemButtonView) {
            view.set({
                role: 'menuitemcheckbox'
            });
        }
        else {
            view.set({
                tooltip: true
            });
        }
        // Execute the command.
        plugin.listenTo(view, 'execute', () => {
            editor.execute(commandName);
            editor.editing.view.focus();
        });
        return view;
    };
}

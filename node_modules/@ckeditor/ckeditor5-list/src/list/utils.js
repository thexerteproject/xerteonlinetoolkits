/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
/**
 * Helper method for creating toolbar and menu buttons and linking them with an appropriate command.
 *
 * @internal
 * @param editor The editor instance to which the UI component will be added.
 * @param commandName The name of the command.
 * @param label The button label.
 * @param icon The source of the icon.
 */
export function createUIComponents(editor, commandName, label, icon) {
    editor.ui.componentFactory.add(commandName, () => {
        const buttonView = _createButton(ButtonView, editor, commandName, label, icon);
        buttonView.set({
            tooltip: true,
            isToggleable: true
        });
        return buttonView;
    });
    editor.ui.componentFactory.add(`menuBar:${commandName}`, () => {
        const buttonView = _createButton(MenuBarMenuListItemButtonView, editor, commandName, label, icon);
        buttonView.set({
            role: 'menuitemcheckbox',
            isToggleable: true
        });
        return buttonView;
    });
}
/**
 * Creates a button to use either in toolbar or in menu bar.
 */
function _createButton(ButtonClass, editor, commandName, label, icon) {
    const command = editor.commands.get(commandName);
    const view = new ButtonClass(editor.locale);
    view.set({
        label,
        icon
    });
    // Bind button model to command.
    view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');
    // Execute the command.
    view.on('execute', () => {
        editor.execute(commandName);
        editor.editing.view.focus();
    });
    return view;
}

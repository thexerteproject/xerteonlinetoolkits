/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/todolist/todolistui
 */
import { createUIComponents } from '../list/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { IconTodoList } from 'ckeditor5/src/icons.js';
/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 */
export class TodoListUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TodoListUI';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const t = this.editor.t;
        createUIComponents(this.editor, 'todoList', t('To-do List'), IconTodoList);
    }
}

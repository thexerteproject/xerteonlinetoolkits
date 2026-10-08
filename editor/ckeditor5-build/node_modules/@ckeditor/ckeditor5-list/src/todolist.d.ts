/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/todolist
 */
import { TodoListEditing } from './todolist/todolistediting.js';
import { TodoListUI } from './todolist/todolistui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/todolist.css';
/**
 * The to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/todolist/todolistediting~TodoListEditing to-do list
 * editing feature} and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */
export declare class TodoList extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TodoListEditing, typeof TodoListUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): "TodoList";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}

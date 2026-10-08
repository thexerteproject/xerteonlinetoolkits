/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacytodolist
 */
import { LegacyTodoListEditing } from './legacytodolist/legacytodolistediting.js';
import { TodoListUI } from './todolist/todolistui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/todolist.css';
/**
 * The legacy to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacytodolist/legacytodolistediting~LegacyTodoListEditing legacy to-do list
 * editing feature} and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */
export declare class LegacyTodoList extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof LegacyTodoListEditing, typeof TodoListUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): "LegacyTodoList";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ListEditing } from '../list/listediting.js';
/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/list/listediting~ListEditing list editing plugin}
 * and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 */
export declare class TodoListEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TodoListEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ListEditing];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
     * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
     *
     * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
     * is not a clear solution. We need to design an API for using commands beyond the selection range.
     * See https://github.com/ckeditor/ckeditor5/issues/1954.
     */
    private _handleCheckmarkChange;
    /**
     * Observe when user enters or leaves todo list and set proper aria value in global live announcer.
     * This allows screen readers to indicate when the user has entered and left the specified todo list.
     *
     * @internal
     */
    private _initAriaAnnouncements;
}

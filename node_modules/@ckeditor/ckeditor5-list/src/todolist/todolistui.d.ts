/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 */
export declare class TodoListUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TodoListUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

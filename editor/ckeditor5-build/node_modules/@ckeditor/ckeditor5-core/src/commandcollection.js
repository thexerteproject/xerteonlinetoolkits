/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/commandcollection
 */
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */
export class CommandCollection {
    /**
     * Command map.
     */
    _commands;
    /**
     * Creates collection instance.
     */
    constructor() {
        this._commands = new Map();
    }
    /**
     * Registers a new command.
     *
     * @param commandName The name of the command.
     */
    add(commandName, command) {
        this._commands.set(commandName, command);
    }
    /**
     * Retrieves a command from the collection.
     *
     * @param commandName The name of the command.
     */
    get(commandName) {
        return this._commands.get(commandName);
    }
    /**
     * Executes a command.
     *
     * @param commandName The name of the command.
     * @param commandParams Command parameters.
     * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
     */
    execute(commandName, ...commandParams) {
        const command = this.get(commandName);
        if (!command) {
            /**
             * Command does not exist.
             *
             * @error commandcollection-command-not-found
             * @param {string} commandName Name of the command.
             */
            throw new CKEditorError('commandcollection-command-not-found', this, { commandName });
        }
        return command.execute(...commandParams);
    }
    /**
     * Returns iterator of command names.
     */
    *names() {
        yield* this._commands.keys();
    }
    /**
     * Returns iterator of command instances.
     */
    *commands() {
        yield* this._commands.values();
    }
    /**
     * Iterable interface.
     *
     * Returns `[ commandName, commandInstance ]` pairs.
     */
    [Symbol.iterator]() {
        return this._commands[Symbol.iterator]();
    }
    /**
     * Destroys all collection commands.
     */
    destroy() {
        for (const command of this.commands()) {
            command.destroy();
        }
    }
}

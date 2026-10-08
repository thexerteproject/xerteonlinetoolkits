/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/multicommand
 */
import { Command } from './command.js';
import { type PriorityString } from '@ckeditor/ckeditor5-utils';
/**
 * A CKEditor command that aggregates other commands.
 *
 * This command is used to proxy multiple commands. The multi-command is enabled when
 * at least one of its registered child commands is enabled.
 * When executing a multi-command, the first enabled command with highest priority will be executed.
 *
 * ```ts
 * const multiCommand = new MultiCommand( editor );
 *
 * const commandFoo = new Command( editor );
 * const commandBar = new Command( editor );
 *
 * // Register a child command.
 * multiCommand.registerChildCommand( commandFoo );
 * // Register a child command with a low priority.
 * multiCommand.registerChildCommand( commandBar, { priority: 'low' } );
 *
 * // Enable one of the commands.
 * commandBar.isEnabled = true;
 *
 * multiCommand.execute(); // Will execute commandBar.
 * ```
 */
export declare class MultiCommand extends Command {
    /**
     * Registered child commands definitions.
     */
    private _childCommandsDefinitions;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the first enabled command which has the highest priority of all registered child commands.
     *
     * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
     */
    execute(...args: Array<unknown>): unknown;
    /**
     * Registers a child command.
     *
     * @param options An object with configuration options.
     * @param options.priority Priority of a command to register.
     */
    registerChildCommand(command: Command, options?: {
        priority?: PriorityString;
    }): void;
    /**
     * Checks if any of child commands is enabled.
     */
    private _checkEnabled;
    /**
     * Returns a first enabled command with the highest priority or `undefined` if none of them is enabled.
     */
    private _getFirstEnabledCommand;
}

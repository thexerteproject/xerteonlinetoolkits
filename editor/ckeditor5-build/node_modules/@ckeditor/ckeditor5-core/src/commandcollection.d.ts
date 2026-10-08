/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Command } from './command.js';
/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */
export declare class CommandCollection implements Iterable<[string, Command]> {
    /**
     * Command map.
     */
    private _commands;
    /**
     * Creates collection instance.
     */
    constructor();
    /**
     * Registers a new command.
     *
     * @param commandName The name of the command.
     */
    add<TName extends string>(commandName: TName, command: CommandsMap[TName]): void;
    /**
     * Retrieves a command from the collection.
     *
     * @param commandName The name of the command.
     */
    get<TName extends string>(commandName: TName): CommandsMap[TName] | undefined;
    /**
     * Executes a command.
     *
     * @param commandName The name of the command.
     * @param commandParams Command parameters.
     * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
     */
    execute<TName extends string>(commandName: TName, ...commandParams: Parameters<CommandsMap[TName]['execute']>): ReturnType<CommandsMap[TName]['execute']>;
    /**
     * Returns iterator of command names.
     */
    names(): IterableIterator<string>;
    /**
     * Returns iterator of command instances.
     */
    commands(): IterableIterator<Command>;
    /**
     * Iterable interface.
     *
     * Returns `[ commandName, commandInstance ]` pairs.
     */
    [Symbol.iterator](): Iterator<[string, Command]>;
    /**
     * Destroys all collection commands.
     */
    destroy(): void;
}
/**
 * Helper type that maps command names to their types.
 * It is meant to be extended with module augmentation.
 *
 * ```ts
 * class MyCommand extends Command {
 * 	public execute( parameter: A ): B {
 * 		// ...
 * 	}
 * }
 *
 * declare module '@ckeditor/ckeditor5-core' {
 * 	interface CommandsMap {
 * 		myCommand: MyCommand;
 * 	}
 * }
 *
 * // Returns `MyCommand | undefined`.
 * const myCommand = editor.commands.get( 'myCommand' );
 *
 * // Expects `A` type as parameter and returns `B`.
 * const value = editor.commands.execute( 'myCommand', new A() );
 * ```
 */
export interface CommandsMap {
    [name: string]: Command;
}

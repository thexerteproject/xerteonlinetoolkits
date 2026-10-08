/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The command that allows navigation across the exceptions in the edited document.
 */
export declare class RestrictedEditingModeNavigationCommand extends Command {
    /**
     * The direction of the command.
     */
    private _direction;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param direction The direction that the command works.
     */
    constructor(editor: Editor, direction: RestrictedEditingModeNavigationDirection);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     */
    execute(): void;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
}
/**
 * Directions in which the
 * {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand} can work.
 */
export type RestrictedEditingModeNavigationDirection = 'forward' | 'backward';

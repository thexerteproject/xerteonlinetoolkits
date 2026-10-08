/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingmodeediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The restricted editing mode editing feature.
 *
 * * It introduces the exception marker group that renders to `<span>` elements with the `restricted-editing-exception` CSS class.
 * * It registers the `'goToPreviousRestrictedEditingException'` and `'goToNextRestrictedEditingException'` commands.
 * * It also enables highlighting exception markers that are selected.
 */
export declare class RestrictedEditingModeEditing extends Plugin {
    /**
     * Command names that are enabled outside the non-restricted regions.
     */
    private _alwaysEnabled;
    /**
     * Commands allowed in non-restricted areas.
     *
     * Commands always enabled combine typing feature commands: `'input'`, `'insertText'`, `'delete'`, and `'deleteForward'` with
     * commands defined in the feature configuration.
     */
    private _allowedInException;
    /**
     * @inheritDoc
     */
    static get pluginName(): "RestrictedEditingModeEditing";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Makes the given command always enabled in the restricted editing mode (regardless
     * of selection location).
     *
     * To enable some commands in non-restricted areas of the content use
     * {@link module:restricted-editing/restrictededitingconfig~RestrictedEditingConfig#allowedCommands} configuration option.
     *
     * @param commandName Name of the command to enable.
     */
    enableCommand(commandName: string): void;
    /**
     * Registers block exception wrapper in the schema.
     */
    private _setupSchema;
    /**
     * Sets up the restricted mode editing conversion:
     *
     * * ucpast & downcast converters,
     * * marker highlighting in the edting area,
     * * marker post-fixers.
     */
    private _setupConversion;
    /**
     * Setups additional editing restrictions beyond command toggling:
     *
     * * delete content range trimming
     * * disabling input command outside exception marker
     * * restricting clipboard holder to text only
     * * restricting text attributes in content
     */
    private _setupRestrictions;
    /**
     * Sets up the command toggling which enables or disables commands based on the user selection.
     */
    private _setupCommandsToggling;
    /**
     * Checks if commands should be enabled or disabled based on the current selection.
     */
    private _checkCommands;
    /**
     * Enables commands in non-restricted regions.
     */
    private _enableCommands;
    /**
     * Disables commands outside non-restricted regions.
     */
    private _disableCommands;
}

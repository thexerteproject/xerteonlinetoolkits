/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module remove-format/removeformatcommand
 */
import type { ModelDocumentSelection, ModelItem, ModelRange, ModelWriter } from 'ckeditor5/src/engine.js';
import { Command } from 'ckeditor5/src/core.js';
/**
 * The remove format command.
 *
 * It is used by the {@link module:remove-format/removeformat~RemoveFormat remove format feature}
 * to clear the formatting in the selection.
 *
 * ```ts
 * editor.execute( 'removeFormat' );
 * ```
 */
export declare class RemoveFormatCommand extends Command {
    value: boolean;
    /**
     * List of all registered custom attribute handlers.
     */
    private _customAttributesHandlers;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
    /**
     * Registers a custom attribute handler that will be used to determine if an attribute is formatting and how to remove it.
     *
     * @internal
     */
    registerCustomAttribute(isFormatting: IsFormattingCallback, removeFormatting: RemoveFormattingCallback): void;
    /**
     * Helper method that removes a formatting attribute from an item either using custom callbacks or writer remove attribute.
     */
    private _removeFormatting;
    /**
     * Returns an iterable of items in a selection (including the selection itself) that have formatting model
     * attributes to be removed by the feature.
     */
    private _getFormattingItems;
    /**
     * Returns an iterable of formatting attributes of a given model item.
     *
     * **Note:** Formatting items have the `isFormatting` property set to `true`.
     *
     * @returns The names of formatting attributes found in a given item.
     */
    private _getFormattingAttributes;
}
/**
 * Callback that checks if an attribute is a formatting attribute.
 *
 * @internal
 */
export type IsFormattingCallback = (attributeName: string, item: ModelItem | ModelDocumentSelection) => boolean;
/**
 * Callback that removes formatting from an item.
 *
 * @internal
 */
export type RemoveFormattingCallback = (attributeName: string, range: ModelRange, writer: ModelWriter) => void;

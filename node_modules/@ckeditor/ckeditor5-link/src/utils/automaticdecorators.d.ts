/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/utils/automaticdecorators
 */
import { type ArrayOrItem } from 'ckeditor5/src/utils.js';
import type { DowncastDispatcher, ModelSelection, ModelItem, ModelDocumentSelection } from 'ckeditor5/src/engine.js';
import type { NormalizedLinkDecoratorAutomaticDefinition } from '../utils.js';
/**
 * Helper class that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition} and provides
 * the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement downcast dispatchers} for them.
 */
export declare class AutomaticLinkDecorators {
    /**
     * Stores the definition of {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}.
     * This data is used as a source for a downcast dispatcher to create a proper conversion to output data.
     */
    private _definitions;
    /**
     * A callback that checks if a decorator can be applied to a given element.
     * Returns `true` if there is a conflict preventing the decorator from being applied.
     */
    private _conflictChecker?;
    /**
     * Gives information about the number of decorators stored in the {@link module:link/utils/automaticdecorators~AutomaticLinkDecorators}
     * instance.
     */
    get length(): number;
    /**
     * Sets a callback that checks if a decorator can be applied to a given element.
     *
     * @param checker A function that returns `true` if there is a conflict preventing the decorator from being applied.
     */
    setConflictChecker(checker: LinkDecoratorConflictChecker): void;
    /**
     * Adds automatic decorator objects or an array with them to be used during downcasting.
     *
     * @param item A configuration object of automatic rules for decorating links. It might also be an array of such objects.
     */
    add(item: ArrayOrItem<NormalizedLinkDecoratorAutomaticDefinition>): void;
    /**
     * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method.
     *
     * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
     */
    getDispatcher(): (dispatcher: DowncastDispatcher) => void;
    /**
     * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method
     * when linking images.
     *
     * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
     */
    getDispatcherForLinkedImage(): (dispatcher: DowncastDispatcher) => void;
}
/**
 * A callback that checks if a decorator can be applied to a given element.
 * Returns `true` if there is a conflict preventing the decorator from being applied.
 */
export type LinkDecoratorConflictChecker = (decorator: NormalizedLinkDecoratorAutomaticDefinition, modelItem: ModelItem | ModelSelection | ModelDocumentSelection) => boolean | undefined;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/tokenlist
 */
import { type ArrayOrItem } from '@ckeditor/ckeditor5-utils';
import type { ViewElementAttributeValue } from './element.js';
/**
 * Token list. Allows handling (adding, removing, retrieving) a set of tokens (for example class names).
 */
export declare class ViewTokenList implements ViewElementAttributeValue {
    /**
     * The set of tokens.
     */
    private _set;
    /**
     * Returns true if token list has no tokens set.
     */
    get isEmpty(): boolean;
    /**
     * Number of tokens.
     */
    get size(): number;
    /**
     * Checks if a given token is set.
     */
    has(name: string): boolean;
    /**
     * Returns all tokens.
     */
    keys(): Array<string>;
    /**
     * Resets the value to the given one.
     */
    setTo(value: string): this;
    /**
     * Sets a given token without affecting other tokens.
     */
    set(tokens: ArrayOrItem<string>): void;
    /**
     * Removes given token.
     */
    remove(tokens: ArrayOrItem<string>): void;
    /**
     * Removes all tokens.
     */
    clear(): void;
    /**
     * Returns a normalized tokens string.
     */
    toString(): string;
    /**
     * Returns `true` if both attributes have the same tokens.
     */
    isSimilar(other: ViewTokenList): boolean;
    /**
     * Clones the attribute value.
     *
     * @internal
     */
    _clone(): this;
    /**
     * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching attribute tokens.
     *
     * @internal
     * @param tokenPattern The matched token name pattern.
     * @returns An array of matching tokens.
     */
    _getTokensMatch(tokenPattern: true | string | RegExp): Array<string> | undefined;
    /**
     * Returns a list of consumables for the attribute.
     *
     * Could be filtered by the given token name.
     *
     * @internal
     */
    _getConsumables(name?: string): Array<string>;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canMergeAttributesFrom} to verify if the given attribute
     * can be merged without conflicts into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while downcasting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other `AttributeElement`.
     *
     * @internal
     */
    _canMergeFrom(): boolean;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_mergeAttributesFrom} to merge a given attribute into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     */
    _mergeFrom(other: ViewTokenList): void;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canSubtractAttributesOf} to verify if the given attribute
     * can be fully subtracted from the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     *
     * @internal
     */
    _isMatching(other: ViewTokenList): boolean;
}

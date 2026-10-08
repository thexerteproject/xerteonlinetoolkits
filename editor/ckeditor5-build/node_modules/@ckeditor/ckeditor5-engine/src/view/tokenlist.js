/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/tokenlist
 */
import { toArray } from '@ckeditor/ckeditor5-utils';
/**
 * Token list. Allows handling (adding, removing, retrieving) a set of tokens (for example class names).
 */
export class ViewTokenList {
    /**
     * The set of tokens.
     */
    _set = new Set();
    /**
     * Returns true if token list has no tokens set.
     */
    get isEmpty() {
        return this._set.size == 0;
    }
    /**
     * Number of tokens.
     */
    get size() {
        return this._set.size;
    }
    /**
     * Checks if a given token is set.
     */
    has(name) {
        return this._set.has(name);
    }
    /**
     * Returns all tokens.
     */
    keys() {
        return Array.from(this._set.keys());
    }
    /**
     * Resets the value to the given one.
     */
    setTo(value) {
        this.clear();
        for (const token of value.split(/\s+/)) {
            if (token) {
                this._set.add(token);
            }
        }
        return this;
    }
    /**
     * Sets a given token without affecting other tokens.
     */
    set(tokens) {
        for (const token of toArray(tokens)) {
            if (token) {
                this._set.add(token);
            }
        }
    }
    /**
     * Removes given token.
     */
    remove(tokens) {
        for (const token of toArray(tokens)) {
            this._set.delete(token);
        }
    }
    /**
     * Removes all tokens.
     */
    clear() {
        this._set.clear();
    }
    /**
     * Returns a normalized tokens string.
     */
    toString() {
        return Array.from(this._set).join(' ');
    }
    /**
     * Returns `true` if both attributes have the same tokens.
     */
    isSimilar(other) {
        if (this.size !== other.size) {
            return false;
        }
        for (const token of this.keys()) {
            if (!other.has(token)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Clones the attribute value.
     *
     * @internal
     */
    _clone() {
        const clone = new this.constructor();
        clone._set = new Set(this._set);
        return clone;
    }
    /**
     * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching attribute tokens.
     *
     * @internal
     * @param tokenPattern The matched token name pattern.
     * @returns An array of matching tokens.
     */
    _getTokensMatch(tokenPattern) {
        const match = [];
        if (tokenPattern === true) {
            for (const token of this._set.keys()) {
                match.push(token);
            }
            return match;
        }
        if (typeof tokenPattern == 'string') {
            for (const token of tokenPattern.split(/\s+/)) {
                if (this._set.has(token)) {
                    match.push(token);
                }
                else {
                    return undefined;
                }
            }
            return match;
        }
        for (const token of this._set.keys()) {
            if (token.match(tokenPattern)) {
                match.push(token);
            }
        }
        return match.length ? match : undefined;
    }
    /**
     * Returns a list of consumables for the attribute.
     *
     * Could be filtered by the given token name.
     *
     * @internal
     */
    _getConsumables(name) {
        return name ? [name] : this.keys();
    }
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canMergeAttributesFrom} to verify if the given attribute
     * can be merged without conflicts into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while downcasting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other `AttributeElement`.
     *
     * @internal
     */
    _canMergeFrom() {
        return true;
    }
    /**
     * Used by {@link module:engine/view/element~ViewElement#_mergeAttributesFrom} to merge a given attribute into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     */
    _mergeFrom(other) {
        for (const token of other._set.keys()) {
            if (!this._set.has(token)) {
                this._set.add(token);
            }
        }
    }
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canSubtractAttributesOf} to verify if the given attribute
     * can be fully subtracted from the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     *
     * @internal
     */
    _isMatching(other) {
        for (const name of other._set.keys()) {
            if (!this._set.has(name)) {
                return false;
            }
        }
        return true;
    }
}

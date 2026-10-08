/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { logWarning } from '@ckeditor/ckeditor5-utils';
import { normalizeConsumables } from '../conversion/viewconsumable.js';
/**
 * View matcher class.
 * Instance of this class can be used to find {@link module:engine/view/element~ViewElement elements} that match given pattern.
 */
export class Matcher {
    _patterns = [];
    /**
     * Creates new instance of Matcher.
     *
     * @param pattern Match patterns. See {@link module:engine/view/matcher~Matcher#add add method} for more information.
     */
    constructor(...pattern) {
        this.add(...pattern);
    }
    /**
     * Adds pattern or patterns to matcher instance.
     *
     * ```ts
     * // String.
     * matcher.add( 'div' );
     *
     * // Regular expression.
     * matcher.add( /^\w/ );
     *
     * // Single class.
     * matcher.add( {
     * 	classes: 'foobar'
     * } );
     * ```
     *
     * See {@link module:engine/view/matcher~MatcherPattern} for more examples.
     *
     * Multiple patterns can be added in one call:
     *
     * ```ts
     * matcher.add( 'div', { classes: 'foobar' } );
     * ```
     *
     * @param pattern Object describing pattern details. If string or regular expression
     * is provided it will be used to match element's name. Pattern can be also provided in a form
     * of a function - then this function will be called with each {@link module:engine/view/element~ViewElement element} as a parameter.
     * Function's return value will be stored under `match` key of the object returned from
     * {@link module:engine/view/matcher~Matcher#match match} or {@link module:engine/view/matcher~Matcher#matchAll matchAll} methods.
     */
    add(...pattern) {
        for (let item of pattern) {
            // String or RegExp pattern is used as element's name.
            if (typeof item == 'string' || item instanceof RegExp) {
                item = { name: item };
            }
            this._patterns.push(item);
        }
    }
    /**
     * Matches elements for currently stored patterns. Returns match information about first found
     * {@link module:engine/view/element~ViewElement element}, otherwise returns `null`.
     *
     * Example of returned object:
     *
     * ```ts
     * {
     * 	element: <instance of found element>,
     * 	pattern: <pattern used to match found element>,
     * 	match: {
     * 		name: true,
     * 		attributes: [
     * 			[ 'title' ],
     * 			[ 'href' ],
     * 			[ 'class', 'foo' ],
     * 			[ 'style', 'color' ],
     * 			[ 'style', 'position' ]
     * 		]
     * 	}
     * }
     * ```
     *
     * You could use the `match` field from the above returned object as an input for the
     * {@link module:engine/conversion/viewconsumable~ViewConsumable#test `ViewConsumable#test()`} and
     * {@link module:engine/conversion/viewconsumable~ViewConsumable#consume `ViewConsumable#consume()`} methods.
     *
     * @see module:engine/view/matcher~Matcher#add
     * @see module:engine/view/matcher~Matcher#matchAll
     * @param element View element to match against stored patterns.
     * @returns The match information about found element or `null`.
     */
    match(...element) {
        for (const singleElement of element) {
            for (const pattern of this._patterns) {
                const match = this._isElementMatching(singleElement, pattern);
                if (match) {
                    return {
                        element: singleElement,
                        pattern,
                        match
                    };
                }
            }
        }
        return null;
    }
    /**
     * Matches elements for currently stored patterns. Returns array of match information with all found
     * {@link module:engine/view/element~ViewElement elements}. If no element is found - returns `null`.
     *
     * @see module:engine/view/matcher~Matcher#add
     * @see module:engine/view/matcher~Matcher#match
     * @param element View element to match against stored patterns.
     * @returns Array with match information about found elements or `null`. For more information
     * see {@link module:engine/view/matcher~Matcher#match match method} description.
     */
    matchAll(...element) {
        const results = [];
        for (const singleElement of element) {
            for (const pattern of this._patterns) {
                const match = this._isElementMatching(singleElement, pattern);
                if (match) {
                    results.push({
                        element: singleElement,
                        pattern,
                        match
                    });
                }
            }
        }
        return results.length > 0 ? results : null;
    }
    /**
     * Returns the name of the element to match if there is exactly one pattern added to the matcher instance
     * and it matches element name defined by `string` (not `RegExp`). Otherwise, returns `null`.
     *
     * @returns Element name trying to match.
     */
    getElementName() {
        if (this._patterns.length !== 1) {
            return null;
        }
        const pattern = this._patterns[0];
        const name = pattern.name;
        return (typeof pattern != 'function' && name && !(name instanceof RegExp)) ? name : null;
    }
    /**
     * Returns match information if {@link module:engine/view/element~ViewElement element} is matching provided pattern.
     * If element cannot be matched to provided pattern - returns `null`.
     *
     * @returns Returns object with match information or null if element is not matching.
     */
    _isElementMatching(element, pattern) {
        // If pattern is provided as function - return result of that function;
        if (typeof pattern == 'function') {
            const match = pattern(element);
            // In some places we use Matcher with callback pattern that returns boolean.
            if (!match || typeof match != 'object') {
                return match;
            }
            return normalizeConsumables(match);
        }
        const match = {};
        // Check element's name.
        if (pattern.name) {
            match.name = matchName(pattern.name, element.name);
            if (!match.name) {
                return null;
            }
        }
        const attributesMatch = [];
        // Check element's attributes.
        if (pattern.attributes && !matchAttributes(pattern.attributes, element, attributesMatch)) {
            return null;
        }
        // Check element's classes.
        if (pattern.classes && !matchClasses(pattern.classes, element, attributesMatch)) {
            return null;
        }
        // Check element's styles.
        if (pattern.styles && !matchStyles(pattern.styles, element, attributesMatch)) {
            return null;
        }
        // Note the `attributesMatch` array is populated by the above calls.
        if (attributesMatch.length) {
            match.attributes = attributesMatch;
        }
        return match;
    }
}
/**
 * Returns true if the given `item` matches the pattern.
 *
 * @internal
 * @param pattern A pattern representing a key/value we want to match.
 * @param item An actual item key/value (e.g. `'src'`, `'background-color'`, `'ck-widget'`) we're testing against pattern.
 */
export function isPatternMatched(pattern, item) {
    return pattern === true ||
        pattern === item ||
        pattern instanceof RegExp && !!String(item).match(pattern);
}
/**
 * Checks if name can be matched by provided pattern.
 *
 * @returns Returns `true` if name can be matched, `false` otherwise.
 */
function matchName(pattern, name) {
    // If pattern is provided as RegExp - test against this regexp.
    if (pattern instanceof RegExp) {
        return !!name.match(pattern);
    }
    return pattern === name;
}
/**
 * Bring all the possible pattern forms to an array of tuples where first item is a key, second is a value,
 * and third optional is a token value.
 *
 * Examples:
 *
 * Boolean pattern value:
 *
 * ```ts
 * true
 * ```
 *
 * to
 *
 * ```ts
 * [ [ true, true ] ]
 * ```
 *
 * Textual pattern value:
 *
 * ```ts
 * 'attribute-name-or-class-or-style'
 * ```
 *
 * to
 *
 * ```ts
 * [ [ 'attribute-name-or-class-or-style', true ] ]
 * ```
 *
 * Regular expression:
 *
 * ```ts
 * /^data-.*$/
 * ```
 *
 * to
 *
 * ```ts
 * [ [ /^data-.*$/, true ] ]
 * ```
 *
 * Objects (plain or with `key` and `value` specified explicitly):
 *
 * ```ts
 * {
 * 	src: /^https:.*$/
 * }
 * ```
 *
 * or
 *
 * ```ts
 * [ {
 * 	key: 'src',
 * 	value: /^https:.*$/
 * } ]
 * ```
 *
 * to:
 *
 * ```ts
 * [ [ 'src', /^https:.*$/ ] ]
 * ```
 *
 * @returns Returns an array of objects or null if provided patterns were not in an expected form.
 */
function normalizePatterns(patterns, prefix) {
    if (Array.isArray(patterns)) {
        return patterns.map(pattern => {
            if (typeof pattern !== 'object' || pattern instanceof RegExp) {
                return prefix ?
                    [prefix, pattern, true] :
                    [pattern, true];
            }
            if (pattern.key === undefined || pattern.value === undefined) {
                // Documented at the end of matcher.js.
                logWarning('matcher-pattern-missing-key-or-value', pattern);
            }
            return prefix ?
                [prefix, pattern.key, pattern.value] :
                [pattern.key, pattern.value];
        });
    }
    if (typeof patterns !== 'object' || patterns instanceof RegExp) {
        return [
            prefix ?
                [prefix, patterns, true] :
                [patterns, true]
        ];
    }
    // Below we do what Object.entries() does, but faster
    const normalizedPatterns = [];
    for (const key in patterns) {
        // Replace with Object.hasOwn() when we upgrade to es2022.
        if (Object.prototype.hasOwnProperty.call(patterns, key)) {
            normalizedPatterns.push(prefix ?
                [prefix, key, patterns[key]] :
                [key, patterns[key]]);
        }
    }
    return normalizedPatterns;
}
/**
 * Checks if attributes of provided element can be matched against provided patterns.
 *
 * @param patterns Object with information about attributes to match. Each key of the object will be
 * used as attribute name. Value of each key can be a string or regular expression to match against attribute value.
 * @param  element Element which attributes will be tested.
 * @param match An array to populate with matching tuples.
 * @returns Returns array with matched attribute names or `null` if no attributes were matched.
 */
function matchAttributes(patterns, element, match) {
    let excludeAttributes;
    // `style` and `class` attribute keys are deprecated. Only allow them in object pattern
    // for backward compatibility.
    if (typeof patterns === 'object' && !(patterns instanceof RegExp) && !Array.isArray(patterns)) {
        if (patterns.style !== undefined) {
            // Documented at the end of matcher.js.
            logWarning('matcher-pattern-deprecated-attributes-style-key', patterns);
        }
        if (patterns.class !== undefined) {
            // Documented at the end of matcher.js.
            logWarning('matcher-pattern-deprecated-attributes-class-key', patterns);
        }
    }
    else {
        excludeAttributes = ['class', 'style'];
    }
    return element._collectAttributesMatch(normalizePatterns(patterns), match, excludeAttributes);
}
/**
 * Checks if classes of provided element can be matched against provided patterns.
 *
 * @param patterns Array of strings or regular expressions to match against element's classes.
 * @param element Element which classes will be tested.
 * @param match An array to populate with matching tuples.
 * @returns Returns array with matched class names or `null` if no classes were matched.
 */
function matchClasses(patterns, element, match) {
    return element._collectAttributesMatch(normalizePatterns(patterns, 'class'), match);
}
/**
 * Checks if styles of provided element can be matched against provided patterns.
 *
 * @param patterns Object with information about styles to match. Each key of the object will be
 * used as style name. Value of each key can be a string or regular expression to match against style value.
 * @param element Element which styles will be tested.
 * @param match An array to populate with matching tuples.
 * @returns Returns array with matched style names or `null` if no styles were matched.
 */
function matchStyles(patterns, element, match) {
    return element._collectAttributesMatch(normalizePatterns(patterns, 'style'), match);
}
/**
 * The key-value matcher pattern is missing key or value. Both must be present.
 * Refer the documentation: {@link module:engine/view/matcher~MatcherPattern}.
 *
 * @param pattern Pattern with missing properties.
 * @error matcher-pattern-missing-key-or-value
 */
/**
 * The key-value matcher pattern for `attributes` option is using deprecated `style` key.
 *
 * Use `styles` matcher pattern option instead:
 *
 * ```ts
 * // Instead of:
 * const pattern = {
 * 	attributes: {
 * 		key1: 'value1',
 * 		key2: 'value2',
 * 		style: /^border.*$/
 * 	}
 * }
 *
 * // Use:
 * const pattern = {
 * 	attributes: {
 * 		key1: 'value1',
 * 		key2: 'value2'
 * 	},
 * 	styles: /^border.*$/
 * }
 * ```
 *
 * Refer to the {@glink updating/guides/update-to-29##update-to-ckeditor-5-v2910 Migration to v29.1.0} guide
 * and {@link module:engine/view/matcher~MatcherPattern} documentation.
 *
 * @param pattern Pattern with missing properties.
 * @error matcher-pattern-deprecated-attributes-style-key
 */
/**
 * The key-value matcher pattern for `attributes` option is using deprecated `class` key.
 *
 * Use `classes` matcher pattern option instead:
 *
 * ```ts
 * // Instead of:
 * const pattern = {
 * 	attributes: {
 * 		key1: 'value1',
 * 		key2: 'value2',
 * 		class: 'foobar'
 * 	}
 * }
 *
 * // Use:
 * const pattern = {
 * 	attributes: {
 * 		key1: 'value1',
 * 		key2: 'value2'
 * 	},
 * 	classes: 'foobar'
 * }
 * ```
 *
 * Refer to the {@glink updating/guides/update-to-29##update-to-ckeditor-5-v2910 Migration to v29.1.0} guide
 * and the {@link module:engine/view/matcher~MatcherPattern} documentation.
 *
 * @param pattern Pattern with missing properties.
 * @error matcher-pattern-deprecated-attributes-class-key
 */

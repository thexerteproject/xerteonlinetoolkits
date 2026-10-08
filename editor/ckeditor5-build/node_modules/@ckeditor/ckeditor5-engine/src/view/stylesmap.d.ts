/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ViewElementAttributeValue } from './element.js';
import { type ArrayOrItem } from '@ckeditor/ckeditor5-utils';
/**
 * Styles map. Allows handling (adding, removing, retrieving) a set of style rules (usually, of an element).
 */
export declare class StylesMap implements ViewElementAttributeValue {
    /**
     * Keeps an internal representation of styles map. Normalized styles are kept as object tree to allow unified modification and
     * value access model using lodash's get, set, unset, etc methods.
     *
     * When no style processor rules are defined it acts as simple key-value storage.
     */
    private _styles;
    /**
     * Cached list of style names for faster access.
     */
    private _cachedStyleNames;
    /**
     * Cached list of expanded style names for faster access.
     */
    private _cachedExpandedStyleNames;
    /**
     * An instance of the {@link module:engine/view/stylesmap~StylesProcessor}.
     */
    private readonly _styleProcessor;
    /**
     * Creates Styles instance.
     */
    constructor(styleProcessor: StylesProcessor);
    /**
     * Returns true if style map has no styles set.
     */
    get isEmpty(): boolean;
    /**
     * Number of styles defined.
     */
    get size(): number;
    /**
     * Set styles map to a new value.
     *
     * ```ts
     * styles.setTo( 'border:1px solid blue;margin-top:1px;' );
     * ```
     */
    setTo(inlineStyle: string): this;
    /**
     * Checks if a given style is set.
     *
     * ```ts
     * styles.setTo( 'margin-left:1px;' );
     *
     * styles.has( 'margin-left' );    // -> true
     * styles.has( 'padding' );        // -> false
     * ```
     *
     * **Note**: This check supports normalized style names.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * styles.setTo( 'margin:2px;' );
     *
     * styles.has( 'margin' );         // -> true
     * styles.has( 'margin-top' );     // -> true
     * styles.has( 'margin-left' );    // -> true
     *
     * styles.remove( 'margin-top' );
     *
     * styles.has( 'margin' );         // -> false
     * styles.has( 'margin-top' );     // -> false
     * styles.has( 'margin-left' );    // -> true
     * ```
     *
     * @param name Style name.
     */
    has(name: string): boolean;
    /**
     * Sets a given style.
     *
     * Can insert one by one:
     *
     * ```ts
     * styles.set( 'color', 'blue' );
     * styles.set( 'margin-right', '1em' );
     * ```
     *
     * ***Note**:* This method uses {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules
     * enabled style processor rules} to normalize passed values.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * styles.set( 'margin', '2px' );
     * ```
     *
     * The above code will set margin to:
     *
     * ```ts
     * styles.getNormalized( 'margin' );
     * // -> { top: '2px', right: '2px', bottom: '2px', left: '2px' }
     * ```
     *
     * Which makes it possible to retrieve a "sub-value":
     *
     * ```ts
     * styles.get( 'margin-left' );       // -> '2px'
     * ```
     *
     * Or modify it:
     *
     * ```ts
     * styles.remove( 'margin-left' );
     *
     * styles.getNormalized( 'margin' );  // -> { top: '1px', bottom: '1px', right: '1px' }
     * styles.toString();                 // -> 'margin-bottom:1px;margin-right:1px;margin-top:1px;'
     * ```
     *
     * This method also allows to set normalized values directly (if a particular styles processor rule was enabled):
     *
     * ```ts
     * styles.set( 'border-color', { top: 'blue' } );
     * styles.set( 'margin', { right: '2em' } );
     *
     * styles.toString();                 // -> 'border-color-top:blue;margin-right:2em;'
     * ```
     *
     * @label KEY_VALUE
     * @param name Style property name.
     * @param value Value to set.
     */
    set(name: string, value: StyleValue): void;
    /**
     * Sets many styles at once:
     *
     * ```ts
     * styles.set( {
     * 	color: 'blue',
     * 	'margin-right': '1em'
     * } );
     * ```
     *
     * It is equivalent to:
     *
     * ```ts
     * styles.set( 'color', 'blue' );
     * styles.set( 'margin-right', '1em' );
     * ```
     *
     * See {@link #set:KEY_VALUE}
     *
     * @label CONFIG_OBJECT
     */
    set(styles: Styles): void;
    /**
     * Removes given style.
     *
     * ```ts
     * styles.setTo( 'background:#f00;margin-right:2px;' );
     *
     * styles.remove( 'background' );
     *
     * styles.toString();   // -> 'margin-right:2px;'
     * ```
     *
     * ***Note**:* This method uses {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules
     * enabled style processor rules} to normalize passed values.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * styles.setTo( 'margin:1px' );
     *
     * styles.remove( 'margin-top' );
     * styles.remove( 'margin-right' );
     *
     * styles.toString(); // -> 'margin-bottom:1px;margin-left:1px;'
     * ```
     *
     * @param names Style name or an array of names.
     */
    remove(names: ArrayOrItem<string>): void;
    /**
     * Returns a normalized style object or a single value.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * const styles = new Styles();
     * styles.setTo( 'margin:1px 2px 3em;' );
     *
     * styles.getNormalized( 'margin' );
     * // will log:
     * // {
     * //     top: '1px',
     * //     right: '2px',
     * //     bottom: '3em',
     * //     left: '2px'     // normalized value from margin shorthand
     * // }
     *
     * styles.getNormalized( 'margin-left' ); // -> '2px'
     * ```
     *
     * **Note**: This method will only return normalized styles if a style processor was defined.
     *
     * @param name Style name.
     */
    getNormalized(name?: string): StyleValue | undefined;
    /**
     * Returns a normalized style string. Styles are sorted by name.
     *
     * ```ts
     * styles.set( 'margin' , '1px' );
     * styles.set( 'background', '#f00' );
     *
     * styles.toString(); // -> 'background:#f00;margin:1px;'
     * ```
     *
     * **Note**: This method supports normalized styles if defined.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * styles.set( 'margin' , '1px' );
     * styles.set( 'background', '#f00' );
     * styles.remove( 'margin-top' );
     * styles.remove( 'margin-right' );
     *
     * styles.toString(); // -> 'background:#f00;margin-bottom:1px;margin-left:1px;'
     * ```
     */
    toString(): string;
    /**
     * Returns property as a value string or undefined if property is not set.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.set( 'margin-bottom', '3em' );
     *
     * styles.getAsString( 'margin' ); // -> 'margin: 1px 1px 3em;'
     * ```
     *
     * Note, however, that all sub-values must be set for the longhand property name to return a value:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.remove( 'margin-bottom' );
     *
     * styles.getAsString( 'margin' ); // -> undefined
     * ```
     *
     * In the above scenario, it is not possible to return a `margin` value, so `undefined` is returned.
     * Instead, you should use:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.remove( 'margin-bottom' );
     *
     * for ( const styleName of styles.getStyleNames() ) {
     * 	console.log( styleName, styles.getAsString( styleName ) );
     * }
     * // 'margin-top', '1px'
     * // 'margin-right', '1px'
     * // 'margin-left', '1px'
     * ```
     *
     * In general, it is recommend to iterate over style names like in the example above. This way, you will always get all
     * the currently set style values. So, if all the 4 margin values would be set
     * the for-of loop above would yield only `'margin'`, `'1px'`:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     *
     * for ( const styleName of styles.getStyleNames() ) {
     * 	console.log( styleName, styles.getAsString( styleName ) );
     * }
     * // 'margin', '1px'
     * ```
     *
     * **Note**: To get a normalized version of a longhand property use the {@link #getNormalized `#getNormalized()`} method.
     */
    getAsString(propertyName: string): string | undefined;
    /**
     * Returns all style properties names as they would appear when using {@link #toString `#toString()`}.
     *
     * When `expand` is set to true and there's a shorthand style property set, it will also return all equivalent styles:
     *
     * ```ts
     * stylesMap.setTo( 'margin: 1em' )
     * ```
     *
     * will be expanded to:
     *
     * ```ts
     * [ 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ]
     * ```
     *
     * @param expand Expand shorthand style properties and all return equivalent style representations.
     */
    getStyleNames(expand?: boolean): Array<string>;
    /**
     * Alias for {@link #getStyleNames}.
     */
    keys(): Array<string>;
    /**
     * Removes all styles.
     */
    clear(): void;
    /**
     * Returns `true` if both attributes have the same styles.
     */
    isSimilar(other: StylesMap): boolean;
    /**
     * Returns normalized styles entries for further processing.
     */
    getStylesEntries(): Array<StylePropertyDescriptor>;
    /**
     * Clones the attribute value.
     *
     * @internal
     */
    _clone(): this;
    /**
     * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching styles.
     *
     * @internal
     * @param tokenPattern The matched style name pattern.
     * @param valuePattern The matched style value pattern.
     * @returns An array of matching tokens (style names).
     */
    _getTokensMatch(tokenPattern: true | string | RegExp, valuePattern: true | string | RegExp): Array<string> | undefined;
    /**
     * Returns a list of consumables for the attribute. This includes related styles.
     *
     * Could be filtered by the given style name.
     *
     * @internal
     */
    _getConsumables(name?: string): Array<string>;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canMergeAttributesFrom} to verify if the given attribute can be merged without
     * conflicts into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     */
    _canMergeFrom(other: StylesMap): boolean;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_mergeAttributesFrom} to merge a given attribute into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     */
    _mergeFrom(other: StylesMap): void;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_canSubtractAttributesOf} to verify if the given attribute can be fully
     * subtracted from the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     *
     * @internal
     */
    _isMatching(other: StylesMap): boolean;
}
/**
 * Style processor is responsible for writing and reading a normalized styles object.
 */
export declare class StylesProcessor {
    private readonly _normalizers;
    private readonly _extractors;
    private readonly _reducers;
    private readonly _consumables;
    /**
     * Creates StylesProcessor instance.
     *
     * @internal
     */
    constructor();
    /**
     * Parse style string value to a normalized object and appends it to styles object.
     *
     * ```ts
     * const styles = {};
     *
     * stylesProcessor.toNormalizedForm( 'margin', '1px', styles );
     *
     * // styles will consist: { margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; } }
     * ```
     *
     * **Note**: To define normalizer callbacks use {@link #setNormalizer}.
     *
     * @param name Name of style property.
     * @param propertyValue Value of style property.
     * @param styles Object holding normalized styles.
     */
    toNormalizedForm(name: string, propertyValue: StyleValue, styles: Styles): void;
    /**
     * Returns a normalized version of a style property.
     *
     * ```ts
     * const styles = {
     * 	margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; },
     * 	background: { color: '#f00' }
     * };
     *
     * stylesProcessor.getNormalized( 'background' );
     * // will return: { color: '#f00' }
     *
     * stylesProcessor.getNormalized( 'margin-top' );
     * // will return: '1px'
     * ```
     *
     * **Note**: In some cases extracting single value requires defining an extractor callback {@link #setExtractor}.
     *
     * @param name Name of style property.
     * @param styles Object holding normalized styles.
     */
    getNormalized(name: string | undefined, styles: Styles): StyleValue | undefined;
    /**
     * Returns a reduced form of style property form normalized object.
     *
     * For default margin reducer, the below code:
     *
     * ```ts
     * stylesProcessor.getReducedForm( 'margin', {
     * 	margin: { top: '1px', right: '1px', bottom: '2px', left: '1px; }
     * } );
     * ```
     *
     * will return:
     *
     * ```ts
     * [
     * 	[ 'margin', '1px 1px 2px' ]
     * ]
     * ```
     *
     * because it might be represented as a shorthand 'margin' value. However if one of margin long hand values is missing it should return:
     *
     * ```ts
     * [
     * 	[ 'margin-top', '1px' ],
     * 	[ 'margin-right', '1px' ],
     * 	[ 'margin-bottom', '2px' ]
     * 	// the 'left' value is missing - cannot use 'margin' shorthand.
     * ]
     * ```
     *
     * **Note**: To define reducer callbacks use {@link #setReducer}.
     *
     * @param name Name of style property.
     */
    getReducedForm(name: string, styles: Styles): Array<StylePropertyDescriptor>;
    /**
     * Return all style properties. Also expand shorthand properties (e.g. `margin`, `background`) if respective extractor is available.
     *
     * @param styles Object holding normalized styles.
     */
    getStyleNames(styles: Styles): Array<string>;
    /**
     * Returns related style names.
     *
     * ```ts
     * stylesProcessor.getRelatedStyles( 'margin' );
     * // will return: [ 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ];
     *
     * stylesProcessor.getRelatedStyles( 'margin-top' );
     * // will return: [ 'margin' ];
     * ```
     *
     * **Note**: To define new style relations load an existing style processor or use
     * {@link module:engine/view/stylesmap~StylesProcessor#setStyleRelation `StylesProcessor.setStyleRelation()`}.
     */
    getRelatedStyles(name: string): Array<string>;
    /**
     * Adds a normalizer method for a style property.
     *
     * A normalizer returns describing how the value should be normalized.
     *
     * For instance 'margin' style is a shorthand for four margin values:
     *
     * - 'margin-top'
     * - 'margin-right'
     * - 'margin-bottom'
     * - 'margin-left'
     *
     * and can be written in various ways if some values are equal to others. For instance `'margin: 1px 2em;'` is a shorthand for
     * `'margin-top: 1px;margin-right: 2em;margin-bottom: 1px;margin-left: 2em'`.
     *
     * A normalizer should parse various margin notations as a single object:
     *
     * ```ts
     * const styles = {
     * 	margin: {
     * 		top: '1px',
     * 		right: '2em',
     * 		bottom: '1px',
     * 		left: '2em'
     * 	}
     * };
     * ```
     *
     * Thus a normalizer for 'margin' style should return an object defining style path and value to store:
     *
     * ```ts
     * const returnValue = {
     * 	path: 'margin',
     * 	value: {
     * 		top: '1px',
     * 		right: '2em',
     * 		bottom: '1px',
     * 		left: '2em'
     * 	}
     * };
     * ```
     *
     * Additionally to fully support all margin notations there should be also defined 4 normalizers for longhand margin notations. Below
     * is an example for 'margin-top' style property normalizer:
     *
     * ```ts
     * stylesProcessor.setNormalizer( 'margin-top', valueString => {
     * 	return {
     * 		path: 'margin.top',
     * 		value: valueString
     * 	}
     * } );
     * ```
     */
    setNormalizer(name: string, callback: StylesNormalizer): void;
    /**
     * Adds a extractor callback for a style property.
     *
     * Most normalized style values are stored as one level objects. It is assumed that `'margin-top'` style will be stored as:
     *
     * ```ts
     * const styles = {
     * 	margin: {
     * 		top: 'value'
     * 	}
     * }
     * ```
     *
     * However, some styles can have conflicting notations and thus it might be harder to extract a style value from shorthand. For instance
     * the 'border-top-style' can be defined using `'border-top:solid'`, `'border-style:solid none none none'` or by `'border:solid'`
     * shorthands. The default border styles processors stores styles as:
     *
     * ```ts
     * const styles = {
     * 	border: {
     * 		style: {
     * 			top: 'solid'
     * 		}
     * 	}
     * }
     * ```
     *
     * as it is better to modify border style independently from other values. On the other part the output of the border might be
     * desired as `border-top`, `border-left`, etc notation.
     *
     * In the above example an extractor should return a side border value that combines style, color and width:
     *
     * ```ts
     * styleProcessor.setExtractor( 'border-top', styles => {
     * 	return {
     * 		color: styles.border.color.top,
     * 		style: styles.border.style.top,
     * 		width: styles.border.width.top
     * 	}
     * } );
     * ```
     *
     * @param callbackOrPath Callback that return a requested value or path string for single values.
     */
    setExtractor(name: string, callbackOrPath: StylesExtractor): void;
    /**
     * Adds a reducer callback for a style property.
     *
     * Reducer returns a minimal notation for given style name. For longhand properties it is not required to write a reducer as
     * by default the direct value from style path is taken.
     *
     * For shorthand styles a reducer should return minimal style notation either by returning single name-value tuple or multiple tuples
     * if a shorthand cannot be used. For instance for a margin shorthand a reducer might return:
     *
     * ```ts
     * const marginShortHandTuple = [
     * 	[ 'margin', '1px 1px 2px' ]
     * ];
     * ```
     *
     * or a longhand tuples for defined values:
     *
     * ```ts
     * // Considering margin.bottom and margin.left are undefined.
     * const marginLonghandsTuples = [
     * 	[ 'margin-top', '1px' ],
     * 	[ 'margin-right', '1px' ]
     * ];
     * ```
     *
     * A reducer obtains a normalized style value:
     *
     * ```ts
     * // Simplified reducer that always outputs 4 values which are always present:
     * stylesProcessor.setReducer( 'margin', margin => {
     * 	return [
     * 		[ 'margin', `${ margin.top } ${ margin.right } ${ margin.bottom } ${ margin.left }` ]
     * 	]
     * } );
     * ```
     */
    setReducer(name: string, callback: StylesReducer): void;
    /**
     * Defines a style shorthand relation to other style notations.
     *
     * ```ts
     * stylesProcessor.setStyleRelation( 'margin', [
     * 	'margin-top',
     * 	'margin-right',
     * 	'margin-bottom',
     * 	'margin-left'
     * ] );
     * ```
     *
     * This enables expanding of style names for shorthands. For instance, if defined,
     * {@link module:engine/conversion/viewconsumable~ViewConsumable view consumable} items are automatically created
     * for long-hand margin style notation alongside the `'margin'` item.
     *
     * This means that when an element being converted has a style `margin`, a converter for `margin-left` will work just
     * fine since the view consumable will contain a consumable `margin-left` item (thanks to the relation) and
     * `element.getStyle( 'margin-left' )` will work as well assuming that the style processor was correctly configured.
     * However, once `margin-left` is consumed, `margin` will not be consumable anymore.
     */
    setStyleRelation(shorthandName: string, styleNames: Array<string>): void;
    /**
     * Set two-way binding of style names.
     */
    private _mapStyleNames;
}
/**
 * A CSS style property descriptor that contains tuple of two strings:
 *
 * - first string describes property name
 * - second string describes property value
 *
 * ```ts
 * const marginDescriptor = [ 'margin', '2px 3em' ];
 * const marginTopDescriptor = [ 'margin-top', '2px' ];
 * ```
 */
export type StylePropertyDescriptor = [name: string, value: string];
/**
 * An object describing values associated with the sides of a box, for instance margins, paddings,
 * border widths, border colors, etc.
 *
 * ```ts
 * const margin = {
 * 	top: '1px',
 * 	right: '3px',
 * 	bottom: '3px',
 * 	left: '7px'
 * };
 *
 * const borderColor = {
 * 	top: 'red',
 * 	right: 'blue',
 * 	bottom: 'blue',
 * 	left: 'red'
 * };
 * ```
 */
export type BoxStyleSides = {
    /**
     * Top side value.
     */
    top: undefined | string;
    /**
     * Left side value.
     */
    left: undefined | string;
    /**
     * Right side value.
     */
    right: undefined | string;
    /**
     * Bottom side value.
     */
    bottom: undefined | string;
};
/**
 * Object holding styles as key-value pairs.
 */
export interface Styles {
    [name: string]: StyleValue;
}
/**
 * The value of style.
 */
export type StyleValue = string | Array<string> | Styles | BoxStyleSides;
/**
 * A normalizer method for a style property.
 *
 * @see ~StylesProcessor#setNormalizer
 */
export type StylesNormalizer = (name: string) => {
    path: string;
    value: StyleValue;
};
/**
 * An extractor callback for a style property or path string for single values.
 *
 * @see ~StylesProcessor#setExtractor
 */
export type StylesExtractor = string | ((name: string, styles: Styles) => StyleValue | undefined);
/**
 * A reducer callback for a style property.
 *
 * @see ~StylesProcessor#setReducer
 */
export type StylesReducer = (value: StyleValue) => Array<StylePropertyDescriptor>;

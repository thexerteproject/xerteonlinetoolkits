/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/dev-utils/view
 */
/**
 * Collection of methods for manipulating the {@link module:engine/view/view view} for testing purposes.
 */
import { EditingView } from '../view/view.js';
import { ViewDocumentFragment } from '../view/documentfragment.js';
import { ViewElement } from '../view/element.js';
import { ViewDocumentSelection } from '../view/documentselection.js';
import { ViewRange } from '../view/range.js';
import { ViewPosition } from '../view/position.js';
import { type ViewNode } from '../view/node.js';
import { type ViewDomConverter } from '../view/domconverter.js';
/**
 * Writes the content of the {@link module:engine/view/document~ViewDocument document} to an HTML-like string.
 *
 * @param view The view to stringify.
 * @param options.withoutSelection Whether to write the selection. When set to `true`, the selection will
 * not be included in the returned string.
 * @param options.rootName The name of the root from which the data should be stringified. If not provided,
 * the default `main` name will be used.
 * @param options.showType When set to `true`, the type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param options.showPriority When set to `true`, the attribute element's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @param options.renderUIElements When set to `true`, the inner content of each
 * {@link module:engine/view/uielement~ViewUIElement} will be printed.
 * @param options.renderRawElements When set to `true`, the inner content of each
 * {@link module:engine/view/rawelement~ViewRawElement} will be printed.
 * @param options.domConverter When set to an actual {@link module:engine/view/domconverter~ViewDomConverter ViewDomConverter}
 * instance, it lets the conversion go through exactly the same flow the editing view is going through,
 * i.e. with view data filtering. Otherwise the simple stub is used.
 * @returns The stringified data.
 */
export declare function _getViewData(view: EditingView, options?: {
    withoutSelection?: boolean;
    rootName?: string;
    showType?: boolean;
    showPriority?: boolean;
    renderUIElements?: boolean;
    renderRawElements?: boolean;
    domConverter?: ViewDomConverter;
    skipListItemIds?: boolean;
}): string;
export declare namespace _getViewData {
    var _stringify: typeof _stringifyView;
}
/**
 * Sets the content of a view {@link module:engine/view/document~ViewDocument document} provided as an HTML-like string.
 *
 * @param data An HTML-like string to write into the document.
 * @param options.rootName The root name where _parseViewd data will be stored. If not provided,
 * the default `main` name will be used.
 */
export declare function _setViewData(view: EditingView, data: string, options?: {
    rootName?: string;
}): void;
export declare namespace _setViewData {
    var _parse: typeof _parseView;
}
/**
 * Converts view elements to HTML-like string representation.
 *
 * A root element can be provided as {@link module:engine/view/text~ViewText text}:
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * stringify( text ); // 'foobar'
 * ```
 *
 * or as an {@link module:engine/view/element~ViewElement element}:
 *
 * ```ts
 * const element = downcastWriter.createElement( 'p', null, downcastWriter.createText( 'foobar' ) );
 * stringify( element ); // '<p>foobar</p>'
 * ```
 *
 * or as a {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}:
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * const b = downcastWriter.createElement( 'b', { name: 'test' }, text );
 * const p = downcastWriter.createElement( 'p', { style: 'color:red;' } );
 * const fragment = downcastWriter.createDocumentFragment( [ p, b ] );
 *
 * stringify( fragment ); // '<p style="color:red;"></p><b name="test">foobar</b>'
 * ```
 *
 * Additionally, a {@link module:engine/view/documentselection~ViewDocumentSelection selection} instance can be provided.
 * Ranges from the selection will then be included in the output data.
 * If a range position is placed inside the element node, it will be represented with `[` and `]`:
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * const b = downcastWriter.createElement( 'b', null, text );
 * const p = downcastWriter.createElement( 'p', null, b );
 * const selection = downcastWriter.createSelection(
 * 	downcastWriter.createRangeIn( p )
 * );
 *
 * stringify( p, selection ); // '<p>[<b>foobar</b>]</p>'
 * ```
 *
 * If a range is placed inside the text node, it will be represented with `{` and `}`:
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * const b = downcastWriter.createElement( 'b', null, text );
 * const p = downcastWriter.createElement( 'p', null, b );
 * const selection = downcastWriter.createSelection(
 * 	downcastWriter.createRange( downcastWriter.createPositionAt( text, 1 ), downcastWriter.createPositionAt( text, 5 ) )
 * );
 *
 * stringify( p, selection ); // '<p><b>f{ooba}r</b></p>'
 * ```
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting the `sameSelectionCharacters=true` option. It is mainly used when the view stringify option is used by
 * model utilities.
 *
 * Multiple ranges are supported:
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * const selection = downcastWriter.createSelection( [
 * 	downcastWriter.createRange( downcastWriter.createPositionAt( text, 0 ), downcastWriter.createPositionAt( text, 1 ) ),
 * 	downcastWriter.createRange( downcastWriter.createPositionAt( text, 3 ), downcastWriter.createPositionAt( text, 5 ) )
 * ] );
 *
 * stringify( text, selection ); // '{f}oo{ba}r'
 * ```
 *
 * A {@link module:engine/view/range~ViewRange range} or {@link module:engine/view/position~ViewPosition position} instance can be provided
 * instead of the {@link module:engine/view/documentselection~ViewDocumentSelection selection} instance. If a range instance
 * is provided, it will be converted to a selection containing this range. If a position instance is provided, it will
 * be converted to a selection containing one range collapsed at this position.
 *
 * ```ts
 * const text = downcastWriter.createText( 'foobar' );
 * const range = downcastWriter.createRange( downcastWriter.createPositionAt( text, 0 ), downcastWriter.createPositionAt( text, 1 ) );
 * const position = downcastWriter.createPositionAt( text, 3 );
 *
 * stringify( text, range ); // '{f}oobar'
 * stringify( text, position ); // 'foo{}bar'
 * ```
 *
 * An additional `options` object can be provided.
 * If `options.showType` is set to `true`, element's types will be
 * presented for {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements},
 * {@link module:engine/view/containerelement~ViewContainerElement container elements}
 * {@link module:engine/view/emptyelement~ViewEmptyElement empty elements}
 * and {@link module:engine/view/uielement~ViewUIElement UI elements}:
 *
 * ```ts
 * const attribute = downcastWriter.createAttributeElement( 'b' );
 * const container = downcastWriter.createContainerElement( 'p' );
 * const empty = downcastWriter.createEmptyElement( 'img' );
 * const ui = downcastWriter.createUIElement( 'span' );
 * getData( attribute, null, { showType: true } ); // '<attribute:b></attribute:b>'
 * getData( container, null, { showType: true } ); // '<container:p></container:p>'
 * getData( empty, null, { showType: true } ); // '<empty:img></empty:img>'
 * getData( ui, null, { showType: true } ); // '<ui:span></ui:span>'
 * ```
 *
 * If `options.showPriority` is set to `true`, a priority will be displayed for all
 * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements}.
 *
 * ```ts
 * const attribute = downcastWriter.createAttributeElement( 'b' );
 * attribute._priority = 20;
 * getData( attribute, null, { showPriority: true } ); // <b view-priority="20"></b>
 * ```
 *
 * If `options.showAttributeElementId` is set to `true`, the attribute element's id will be displayed for all
 * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} that have it set.
 *
 * ```ts
 * const attribute = downcastWriter.createAttributeElement( 'span' );
 * attribute._id = 'marker:foo';
 * getData( attribute, null, { showAttributeElementId: true } ); // <span view-id="marker:foo"></span>
 * ```
 *
 * @param node The node to stringify.
 * @param selectionOrPositionOrRange A selection instance whose ranges will be included in the returned string data.
 * If a range instance is provided, it will be converted to a selection containing this range. If a position instance
 * is provided, it will be converted to a selection containing one range collapsed at this position.
 * @param options An object with additional options.
 * @param options.showType When set to `true`, the type of elements will be printed (`<container:p>`
 * instead of `<p>`, `<attribute:b>` instead of `<b>` and `<empty:img>` instead of `<img>`).
 * @param options.showPriority When set to `true`,  the attribute element's priority will be printed
 * (`<span view-priority="12">`, `<b view-priority="10">`).
 * @param options.showAttributeElementId When set to `true`, attribute element's id will be printed
 * (`<span id="marker:foo">`).
 * @param options.ignoreRoot When set to `true`, the root's element opening and closing will not be printed.
 * Mainly used by the `getData` function to ignore the {@link module:engine/view/document~ViewDocument document's} root element.
 * @param options.sameSelectionCharacters When set to `true`, the selection inside the text will be marked as
 *  `{` and `}` and the selection outside the text as `[` and `]`. When set to `false`, both will be marked as `[` and `]` only.
 * @param options.renderUIElements When set to `true`, the inner content of each
 * {@link module:engine/view/uielement~ViewUIElement} will be printed.
 * @param options.renderRawElements When set to `true`, the inner content of each
 * {@link module:engine/view/rawelement~ViewRawElement} will be printed.
 * @param options.domConverter When set to an actual {@link module:engine/view/domconverter~ViewDomConverter ViewDomConverter}
 * instance, it lets the conversion go through exactly the same flow the editing view is going through,
 * i.e. with view data filtering. Otherwise the simple stub is used.
 * @returns An HTML-like string representing the view.
 */
export declare function _stringifyView(node: ViewNode | ViewDocumentFragment, selectionOrPositionOrRange?: ViewDocumentSelection | ViewPosition | ViewRange | null, options?: {
    showType?: boolean;
    showPriority?: boolean;
    showAttributeElementId?: boolean;
    ignoreRoot?: boolean;
    sameSelectionCharacters?: boolean;
    renderUIElements?: boolean;
    renderRawElements?: boolean;
    domConverter?: ViewDomConverter;
    skipListItemIds?: boolean;
}): string;
/**
 * Parses an HTML-like string and returns a view tree.
 * A simple string will be converted to a {@link module:engine/view/text~ViewText text} node:
 *
 * ```ts
 * _parseView( 'foobar' ); // Returns an instance of text.
 * ```
 *
 * {@link module:engine/view/element~ViewElement Elements} will be _parseViewd with attributes as children:
 *
 * ```ts
 * _parseView( '<b name="baz">foobar</b>' ); // Returns an instance of element with the `baz` attribute and a text child node.
 * ```
 *
 * Multiple nodes provided on root level will be converted to a
 * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}:
 *
 * ```ts
 * _parseView( '<b>foo</b><i>bar</i>' ); // Returns a document fragment with two child elements.
 * ```
 *
 * The method can _parseView multiple {@link module:engine/view/range~ViewRange ranges} provided in string data and return a
 * {@link module:engine/view/documentselection~ViewDocumentSelection selection} instance containing these ranges. Ranges placed inside
 * {@link module:engine/view/text~ViewText text} nodes should be marked using `{` and `}` brackets:
 *
 * ```ts
 * const { text, selection } = _parseView( 'f{ooba}r' );
 * ```
 *
 * Ranges placed outside text nodes should be marked using `[` and `]` brackets:
 *
 * ```ts
 * const { root, selection } = _parseView( '<p>[<b>foobar</b>]</p>' );
 * ```
 *
 * ** Note: **
 * It is possible to unify selection markers to `[` and `]` for both (inside and outside text)
 * by setting `sameSelectionCharacters=true` option. It is mainly used when the view _parseView option is used by model utilities.
 *
 * Sometimes there is a need for defining the order of ranges inside the created selection. This can be achieved by providing
 * the range order array as an additional parameter:
 *
 * ```ts
 * const { root, selection } = _parseView( '{fo}ob{ar}{ba}z', { order: [ 2, 3, 1 ] } );
 * ```
 *
 * In the example above, the first range (`{fo}`) will be added to the selection as the second one, the second range (`{ar}`) will be
 * added as the third and the third range (`{ba}`) will be added as the first one.
 *
 * If the selection's last range should be added as a backward one
 * (so the {@link module:engine/view/documentselection~ViewDocumentSelection#anchor selection anchor} is represented
 * by the `end` position and {@link module:engine/view/documentselection~ViewDocumentSelection#focus selection focus} is
 * represented by the `start` position), use the `lastRangeBackward` flag:
 *
 * ```ts
 * const { root, selection } = _parseView( `{foo}bar{baz}`, { lastRangeBackward: true } );
 * ```
 *
 * Some more examples and edge cases:
 *
 * ```ts
 * // Returns an empty document fragment.
 * _parseView( '' );
 *
 * // Returns an empty document fragment and a collapsed selection.
 * const { root, selection } = _parseView( '[]' );
 *
 * // Returns an element and a selection that is placed inside the document fragment containing that element.
 * const { root, selection } = _parseView( '[<a></a>]' );
 * ```
 *
 * @param data An HTML-like string to be parsed.
 * @param options.order An array with the order of parsed ranges added to the returned
 * {@link module:engine/view/documentselection~ViewDocumentSelection Selection} instance. Each element should represent the
 * desired position of each range in the selection instance. For example: `[2, 3, 1]` means that the first range will be
 * placed as the second, the second as the third and the third as the first.
 * @param options.lastRangeBackward If set to `true`, the last range will be added as backward to the returned
 * {@link module:engine/view/documentselection~ViewDocumentSelection selection} instance.
 * @param options.rootElement The default root to use when parsing elements.
 * When set to `null`, the root element will be created automatically. If set to
 * {@link module:engine/view/element~ViewElement Element} or
 * {@link module:engine/view/documentfragment~ViewDocumentFragment DocumentFragment},
 * this node will be used as the root for all parsed nodes.
 * @param options.sameSelectionCharacters When set to `false`, the selection inside the text should be marked using
 * `{` and `}` and the selection outside the ext using `[` and `]`. When set to `true`, both should be marked with `[` and `]` only.
 * @returns Returns the parsed view node or an object with two fields: `view` and `selection` when selection ranges were included in the
 * data to parse.
 */
export declare function _parseView(data: string, options?: {
    order?: Array<number>;
    lastRangeBackward?: boolean;
    rootElement?: ViewElement | ViewDocumentFragment;
    sameSelectionCharacters?: boolean;
    inlineObjectElements?: Array<string>;
}): ViewNode | ViewDocumentFragment | {
    view: ViewNode | ViewDocumentFragment;
    selection: ViewDocumentSelection;
};

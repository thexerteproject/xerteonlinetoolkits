/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/domconverter
 */
import { ViewText } from './text.js';
import { ViewElement } from './element.js';
import { ViewUIElement } from './uielement.js';
import { ViewPosition } from './position.js';
import { ViewRange } from './range.js';
import { ViewSelection } from './selection.js';
import { ViewDocumentFragment } from './documentfragment.js';
import { type MatcherPattern } from './matcher.js';
import { type ViewNode } from './node.js';
import { type ViewDocument } from './document.js';
import { type ViewDocumentSelection } from './documentselection.js';
import { type ViewEditableElement } from './editableelement.js';
import { type ViewRawElement } from './rawelement.js';
type DomNode = globalThis.Node;
type DomElement = globalThis.HTMLElement;
type DomDocument = globalThis.Document;
type DomDocumentFragment = globalThis.DocumentFragment;
type DomRange = globalThis.Range;
type DomText = globalThis.Text;
type DomSelection = globalThis.Selection;
/**
 * `ViewDomConverter` is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link module:engine/view/domconverter~ViewDomConverter#bindElements bindings} between these nodes.
 *
 * An instance of the DOM converter is available under
 * {@link module:engine/view/view~EditingView#domConverter `editor.editing.view.domConverter`}.
 *
 * The DOM converter does not check which nodes should be rendered (use {@link module:engine/view/renderer~ViewRenderer}), does not keep the
 * state of a tree nor keeps the synchronization between the tree view and
 * the DOM tree (use {@link module:engine/view/document~ViewDocument}).
 *
 * The DOM converter keeps DOM elements to view element bindings, so when the converter gets destroyed, the bindings are lost.
 * Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 */
export declare class ViewDomConverter {
    readonly document: ViewDocument;
    /**
     * Whether to leave the View-to-DOM conversion result unchanged or improve editing experience by filtering out interactive data.
     */
    readonly renderingMode: 'data' | 'editing';
    /**
     * The mode of a block filler used by the DOM converter.
     */
    blockFillerMode: ViewBlockFillerMode;
    /**
     * Elements which are considered pre-formatted elements.
     */
    readonly preElements: Array<string>;
    /**
     * Elements which are considered block elements (and hence should be filled with a
     * {@link #isBlockFiller block filler}).
     *
     * Whether an element is considered a block element also affects handling of trailing whitespaces.
     *
     * You can extend this array if you introduce support for block elements which are not yet recognized here.
     */
    readonly blockElements: Array<string>;
    /**
     * A list of elements that exist inline (in text) but their inner structure cannot be edited because
     * of the way they are rendered by the browser. They are mostly HTML form elements but there are other
     * elements such as `<img>` or `<iframe>` that also have non-editable children or no children whatsoever.
     *
     * Whether an element is considered an inline object has an impact on white space rendering (trimming)
     * around (and inside of it). In short, white spaces in text nodes next to inline objects are not trimmed.
     *
     * You can extend this array if you introduce support for inline object elements which are not yet recognized here.
     */
    readonly inlineObjectElements: Array<string>;
    /**
     * A list of elements which may affect the editing experience. To avoid this, those elements are replaced with
     * `<span data-ck-unsafe-element="[element name]"></span>` while rendering in the editing mode.
     */
    readonly unsafeElements: Array<string>;
    /**
     * The DOM Document used by `ViewDomConverter` to create DOM nodes.
     */
    private readonly _domDocument;
    /**
     * The DOM-to-view mapping.
     */
    private readonly _domToViewMapping;
    /**
     * The view-to-DOM mapping.
     */
    private readonly _viewToDomMapping;
    /**
     * Holds the mapping between fake selection containers and corresponding view selections.
     */
    private readonly _fakeSelectionMapping;
    /**
     * Matcher for view elements whose content should be treated as raw data
     * and not processed during the conversion from DOM nodes to view elements.
     */
    private readonly _rawContentElementMatcher;
    /**
     * Matcher for inline object view elements. This is an extension of a simple {@link #inlineObjectElements} array of element names.
     */
    private readonly _inlineObjectElementMatcher;
    /**
     * Set of elements with temporary custom properties that require clearing after render.
     */
    private readonly _elementsWithTemporaryCustomProperties;
    /**
     * Creates a DOM converter.
     *
     * @param document The view document instance.
     * @param options An object with configuration options.
     * @param options.blockFillerMode The type of the block filler to use.
     * Default value depends on the options.renderingMode:
     *  'nbsp' when options.renderingMode == 'data',
     *  'br' when options.renderingMode == 'editing'.
     * @param options.renderingMode Whether to leave the View-to-DOM conversion result unchanged
     * or improve editing experience by filtering out interactive data.
     */
    constructor(document: ViewDocument, { blockFillerMode, renderingMode }?: {
        blockFillerMode?: ViewBlockFillerMode;
        renderingMode?: 'data' | 'editing';
    });
    /**
     * The DOM Document used by `ViewDomConverter` to create DOM nodes.
     */
    get domDocument(): DomDocument;
    /**
     * Binds a given DOM element that represents fake selection to a **position** of a
     * {@link module:engine/view/documentselection~ViewDocumentSelection document selection}.
     * Document selection copy is stored and can be retrieved by the
     * {@link module:engine/view/domconverter~ViewDomConverter#fakeSelectionToView} method.
     */
    bindFakeSelection(domElement: DomElement, viewDocumentSelection: ViewDocumentSelection): void;
    /**
     * Returns a {@link module:engine/view/selection~ViewSelection view selection} instance corresponding to a given
     * DOM element that represents fake selection. Returns `undefined` if binding to the given DOM element does not exist.
     */
    fakeSelectionToView(domElement: DomElement): ViewSelection | undefined;
    /**
     * Binds DOM and view elements, so it will be possible to get corresponding elements using
     * {@link module:engine/view/domconverter~ViewDomConverter#mapDomToView} and
     * {@link module:engine/view/domconverter~ViewDomConverter#mapViewToDom}.
     *
     * @param domElement The DOM element to bind.
     * @param viewElement The view element to bind.
     */
    bindElements(domElement: DomElement, viewElement: ViewElement): void;
    /**
     * Unbinds a given DOM element from the view element it was bound to. Unbinding is deep, meaning that all children of
     * the DOM element will be unbound too.
     *
     * @param domElement The DOM element to unbind.
     */
    unbindDomElement(domElement: DomElement): void;
    /**
     * Binds DOM and view document fragments, so it will be possible to get corresponding document fragments using
     * {@link module:engine/view/domconverter~ViewDomConverter#mapDomToView} and
     * {@link module:engine/view/domconverter~ViewDomConverter#mapViewToDom}.
     *
     * @param domFragment The DOM document fragment to bind.
     * @param viewFragment The view document fragment to bind.
     */
    bindDocumentFragments(domFragment: DomDocumentFragment, viewFragment: ViewDocumentFragment): void;
    /**
     * Decides whether a given pair of attribute key and value should be passed further down the pipeline.
     *
     * @param elementName Element name in lower case.
     */
    shouldRenderAttribute(attributeKey: string, attributeValue: string, elementName: string): boolean;
    /**
     * Set `domElement`'s content using provided `html` argument. Apply necessary filtering for the editing pipeline.
     *
     * @param domElement DOM element that should have `html` set as its content.
     * @param html Textual representation of the HTML that will be set on `domElement`.
     */
    setContentOf(domElement: DomElement, html: string): void;
    viewToDom(viewNode: ViewText, options?: {
        bind?: boolean;
        withChildren?: boolean;
    }): DomText;
    viewToDom(viewNode: ViewElement, options?: {
        bind?: boolean;
        withChildren?: boolean;
    }): DomElement;
    viewToDom(viewNode: ViewNode, options?: {
        bind?: boolean;
        withChildren?: boolean;
    }): DomNode;
    viewToDom(viewNode: ViewDocumentFragment, options?: {
        bind?: boolean;
        withChildren?: boolean;
    }): DomDocumentFragment;
    /**
     * Sets the attribute on a DOM element.
     *
     * **Note**: To remove the attribute, use {@link #removeDomElementAttribute}.
     *
     * @param domElement The DOM element the attribute should be set on.
     * @param key The name of the attribute.
     * @param value The value of the attribute.
     * @param relatedViewElement The view element related to the `domElement` (if there is any).
     * It helps decide whether the attribute set is unsafe. For instance, view elements created via the
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter} methods can allow certain attributes
     * that would normally be filtered out.
     */
    setDomElementAttribute(domElement: DomElement, key: string, value: string, relatedViewElement?: ViewElement): void;
    /**
     * Removes an attribute from a DOM element.
     *
     * **Note**: To set the attribute, use {@link #setDomElementAttribute}.
     *
     * @param domElement The DOM element the attribute should be removed from.
     * @param key The name of the attribute.
     */
    removeDomElementAttribute(domElement: DomElement, key: string): void;
    /**
     * Converts children of the view element to DOM using the
     * {@link module:engine/view/domconverter~ViewDomConverter#viewToDom} method.
     * Additionally, this method adds block {@link module:engine/view/filler filler} to the list of children, if needed.
     *
     * @param viewElement Parent view element.
     * @param options See {@link module:engine/view/domconverter~ViewDomConverter#viewToDom} options parameter.
     * @returns DOM nodes.
     */
    viewChildrenToDom(viewElement: ViewElement | ViewDocumentFragment, options?: {
        bind?: boolean;
        withChildren?: boolean;
    }): IterableIterator<Node>;
    /**
     * Converts view {@link module:engine/view/range~ViewRange} to DOM range.
     * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
     *
     * @param viewRange View range.
     * @returns DOM range.
     */
    viewRangeToDom(viewRange: ViewRange): DomRange;
    /**
     * Converts view {@link module:engine/view/position~ViewPosition} to DOM parent and offset.
     *
     * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
     * If the converted position is directly before inline filler it is moved inside the filler.
     *
     * @param viewPosition View position.
     * @returns DOM position or `null` if view position could not be converted to DOM.
     * DOM position has two properties:
     * * `parent` - DOM position parent.
     * * `offset` - DOM position offset.
     */
    viewPositionToDom(viewPosition: ViewPosition): {
        parent: DomNode;
        offset: number;
    } | null;
    /**
     * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
     * be created. For bound elements and document fragments function will return corresponding items. For
     * {@link module:engine/view/filler fillers} `null` will be returned.
     * For all DOM elements rendered by {@link module:engine/view/uielement~ViewUIElement} that UIElement will be returned.
     *
     * @param domNode DOM node or document fragment to transform.
     * @param options Conversion options.
     * @param options.bind Determines whether new elements will be bound. False by default.
     * @param options.withChildren If `true`, node's and document fragment's children will be converted too. True by default.
     * @param options.keepOriginalCase If `false`, node's tag name will be converted to lower case. False by default.
     * @param options.skipComments If `false`, comment nodes will be converted to `$comment`
     * {@link module:engine/view/uielement~ViewUIElement view UI elements}. False by default.
     * @returns Converted node or document fragment or `null` if DOM node is a {@link module:engine/view/filler filler}
     * or the given node is an empty text node.
     */
    domToView(domNode: DomNode, options?: {
        bind?: boolean;
        withChildren?: boolean;
        keepOriginalCase?: boolean;
        skipComments?: boolean;
    }): ViewNode | ViewDocumentFragment | null;
    /**
     * Converts children of the DOM element to view nodes using
     * the {@link module:engine/view/domconverter~ViewDomConverter#domToView} method.
     * Additionally this method omits block {@link module:engine/view/filler filler}, if it exists in the DOM parent.
     *
     * @param domElement Parent DOM element.
     * @param options See {@link module:engine/view/domconverter~ViewDomConverter#domToView} options parameter.
     * @param inlineNodes An array that will be populated with inline nodes. It's used internally for whitespace processing.
     * @returns View nodes.
     */
    domChildrenToView(domElement: DomElement, options?: Parameters<ViewDomConverter['domToView']>[1], inlineNodes?: Array<ViewNode>): IterableIterator<ViewNode>;
    /**
     * Converts DOM selection to view {@link module:engine/view/selection~ViewSelection}.
     * Ranges which cannot be converted will be omitted.
     *
     * @param domSelection DOM selection.
     * @returns View selection.
     */
    domSelectionToView(domSelection: DomSelection): ViewSelection;
    /**
     * Converts DOM Range to view {@link module:engine/view/range~ViewRange}.
     * If the start or end position cannot be converted `null` is returned.
     *
     * @param domRange DOM range.
     * @returns View range.
     */
    domRangeToView(domRange: DomRange | StaticRange): ViewRange | null;
    /**
     * Converts DOM parent and offset to view {@link module:engine/view/position~ViewPosition}.
     *
     * If the position is inside a {@link module:engine/view/filler filler} which has no corresponding view node,
     * position of the filler will be converted and returned.
     *
     * If the position is inside DOM element rendered by {@link module:engine/view/uielement~ViewUIElement}
     * that position will be converted to view position before that UIElement.
     *
     * If structures are too different and it is not possible to find corresponding position then `null` will be returned.
     *
     * @param domParent DOM position parent.
     * @param domOffset DOM position offset. You can skip it when converting the inline filler node.
     * @returns View position.
     */
    domPositionToView(domParent: DomNode, domOffset?: number): ViewPosition | null;
    /**
     * Returns corresponding view {@link module:engine/view/element~ViewElement Element} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment} for provided DOM element or
     * document fragment. If there is no view item {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound}
     * to the given DOM - `undefined` is returned.
     *
     * For all DOM elements rendered by a {@link module:engine/view/uielement~ViewUIElement} or
     * a {@link module:engine/view/rawelement~ViewRawElement}, the parent `UIElement` or `RawElement` will be returned.
     *
     * @param domElementOrDocumentFragment DOM element or document fragment.
     * @returns Corresponding view element, document fragment or `undefined` if no element was bound.
     */
    mapDomToView(domElementOrDocumentFragment: DomElement | DomDocumentFragment): ViewElement | ViewDocumentFragment | undefined;
    /**
     * Finds corresponding text node. Text nodes are not {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound},
     * corresponding text node is returned based on the sibling or parent.
     *
     * If the directly previous sibling is a {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound} element, it is used
     * to find the corresponding text node.
     *
     * If this is a first child in the parent and the parent is a
     * {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound}
     * element, it is used to find the corresponding text node.
     *
     * For all text nodes rendered by a {@link module:engine/view/uielement~ViewUIElement} or
     * a {@link module:engine/view/rawelement~ViewRawElement}, the parent `UIElement` or `RawElement` will be returned.
     *
     * Otherwise `null` is returned.
     *
     * Note that for the block or inline {@link module:engine/view/filler filler} this method returns `null`.
     *
     * @param domText DOM text node.
     * @returns Corresponding view text node or `null`, if it was not possible to find a corresponding node.
     */
    findCorrespondingViewText(domText: DomText): ViewText | ViewUIElement | ViewRawElement | null;
    /**
     * Returns corresponding DOM item for provided {@link module:engine/view/element~ViewElement Element} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment DocumentFragment}.
     * To find a corresponding text for {@link module:engine/view/text~ViewText view Text instance}
     * use {@link #findCorrespondingDomText}.
     *
     * @label ELEMENT
     * @param element View element or document fragment.
     * @returns Corresponding DOM node or document fragment.
     */
    mapViewToDom(element: ViewElement): DomElement | undefined;
    /**
     * Returns corresponding DOM item for provided {@link module:engine/view/element~ViewElement Element} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment DocumentFragment}.
     * To find a corresponding text for {@link module:engine/view/text~ViewText view Text instance}
     * use {@link #findCorrespondingDomText}.
     *
     * @label DOCUMENT_FRAGMENT
     * @param documentFragment View element or document fragment.
     * @returns Corresponding DOM node or document fragment.
     */
    mapViewToDom(documentFragment: ViewDocumentFragment): DomDocumentFragment | undefined;
    /**
     * Returns corresponding DOM item for provided {@link module:engine/view/element~ViewElement Element} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment DocumentFragment}.
     * To find a corresponding text for {@link module:engine/view/text~ViewText view Text instance}
     * use {@link #findCorrespondingDomText}.
     *
     * @label DOCUMENT_FRAGMENT_OR_ELEMENT
     * @param documentFragmentOrElement View element or document fragment.
     * @returns Corresponding DOM node or document fragment.
     */
    mapViewToDom(documentFragmentOrElement: ViewElement | ViewDocumentFragment): DomElement | DomDocumentFragment | undefined;
    /**
     * Finds corresponding text node. Text nodes are not {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound},
     * corresponding text node is returned based on the sibling or parent.
     *
     * If the directly previous sibling is a {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound} element, it is used
     * to find the corresponding text node.
     *
     * If this is a first child in the parent and the parent is a
     * {@link module:engine/view/domconverter~ViewDomConverter#bindElements bound}
     * element, it is used to find the corresponding text node.
     *
     * Otherwise `null` is returned.
     *
     * @param viewText View text node.
     * @returns Corresponding DOM text node or `null`, if it was not possible to find a corresponding node.
     */
    findCorrespondingDomText(viewText: ViewText): DomText | null;
    /**
     * Focuses DOM editable that is corresponding to provided {@link module:engine/view/editableelement~ViewEditableElement}.
     */
    focus(viewEditable: ViewEditableElement): void;
    /**
     * Remove DOM selection from blurred editable, so it won't interfere with clicking on dropdowns (especially on iOS).
     *
     * @internal
     */
    _clearDomSelection(): void;
    /**
     * Returns `true` when `node.nodeType` equals `Node.ELEMENT_NODE`.
     *
     * @param node Node to check.
     */
    isElement(node: DomNode): node is DomElement;
    /**
     * Returns `true` when `node.nodeType` equals `Node.DOCUMENT_FRAGMENT_NODE`.
     *
     * @param node Node to check.
     */
    isDocumentFragment(node: DomNode): node is DomDocumentFragment;
    /**
     * Checks if the node is an instance of the block filler for this DOM converter.
     *
     * ```ts
     * const converter = new ViewDomConverter( viewDocument, { blockFillerMode: 'br' } );
     *
     * converter.isBlockFiller( BR_FILLER( document ) ); // true
     * converter.isBlockFiller( NBSP_FILLER( document ) ); // false
     * ```
     *
     * **Note:**: For the `'nbsp'` mode the method also checks context of a node so it cannot be a detached node.
     *
     * **Note:** A special case in the `'nbsp'` mode exists where the `<br>` in `<p><br></p>` is treated as a block filler.
     *
     * @param domNode DOM node to check.
     * @returns True if a node is considered a block filler for given mode.
     */
    isBlockFiller(domNode: DomNode): boolean;
    /**
     * Returns `true` if given selection is a backward selection, that is, if it's `focus` is before `anchor`.
     *
     * @param selection Selection instance to check.
     */
    isDomSelectionBackward(selection: DomSelection): boolean;
    /**
     * Returns a parent {@link module:engine/view/uielement~ViewUIElement} or {@link module:engine/view/rawelement~ViewRawElement}
     * that hosts the provided DOM node. Returns `null` if there is no such parent.
     */
    getHostViewElement(domNode: DomNode): ViewUIElement | ViewRawElement | null;
    /**
     * Checks if the given selection's boundaries are at correct places.
     *
     * The following places are considered as incorrect for selection boundaries:
     *
     * * before or in the middle of an inline filler sequence,
     * * inside a DOM element which represents {@link module:engine/view/uielement~ViewUIElement a view UI element},
     * * inside a DOM element which represents {@link module:engine/view/rawelement~ViewRawElement a view raw element}.
     *
     * @param domSelection The DOM selection object to be checked.
     * @returns `true` if the given selection is at a correct place, `false` otherwise.
     */
    isDomSelectionCorrect(domSelection: DomSelection): boolean;
    /**
     * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
     * and not processed during the conversion from DOM nodes to view elements.
     *
     * This is affecting how {@link module:engine/view/domconverter~ViewDomConverter#domToView} and
     * {@link module:engine/view/domconverter~ViewDomConverter#domChildrenToView} process DOM nodes.
     *
     * The raw data can be later accessed by a
     * {@link module:engine/view/element~ViewElement#getCustomProperty custom property of a view element} called `"$rawContent"`.
     *
     * @param pattern Pattern matching a view element whose content should
     * be treated as raw data.
     */
    registerRawContentMatcher(pattern: MatcherPattern): void;
    /**
     * Registers a {@link module:engine/view/matcher~MatcherPattern} for inline object view elements.
     *
     * This is affecting how {@link module:engine/view/domconverter~ViewDomConverter#domToView} and
     * {@link module:engine/view/domconverter~ViewDomConverter#domChildrenToView} process DOM nodes.
     *
     * This is an extension of a simple {@link #inlineObjectElements} array of element names.
     *
     * @param pattern Pattern matching a view element which should be treated as an inline object.
     */
    registerInlineObjectMatcher(pattern: MatcherPattern): void;
    /**
     * Clear temporary custom properties.
     *
     * @internal
     */
    _clearTemporaryCustomProperties(): void;
    /**
     * Returns the block {@link module:engine/view/filler filler} node based on the current {@link #blockFillerMode} setting.
     */
    private _getBlockFiller;
    /**
     * Checks if the given DOM position is a correct place for selection boundary. See {@link #isDomSelectionCorrect}.
     *
     * @param domParent Position parent.
     * @param offset Position offset.
     * @returns `true` if given position is at a correct place for selection boundary, `false` otherwise.
     */
    private _isDomSelectionPositionCorrect;
    /**
     * Internal generator for {@link #domToView}. Also used by {@link #domChildrenToView}.
     * Separates DOM nodes conversion from whitespaces processing.
     *
     * @param domNode DOM node or document fragment to transform.
     * @param inlineNodes An array of recently encountered inline nodes truncated to the block element boundaries.
     * Used later to process whitespaces.
     */
    private _domToView;
    /**
     * Internal helper that walks the list of inline view nodes already generated from DOM nodes
     * and handles whitespaces and NBSPs.
     *
     * @param domParent The DOM parent of the given inline nodes. This should be a document fragment or
     * a block element to whitespace processing start cleaning.
     * @param inlineNodes An array of recently encountered inline nodes truncated to the block element boundaries.
     */
    private _processDomInlineNodes;
    /**
     * Takes text data from a given {@link module:engine/view/text~ViewText#data} and processes it so
     * it is correctly displayed in the DOM.
     *
     * Following changes are done:
     *
     * * a space at the beginning is changed to `&nbsp;` if this is the first text node in its container
     * element or if a previous text node ends with a space character,
     * * space at the end of the text node is changed to `&nbsp;` if there are two spaces at the end of a node or if next node
     * starts with a space or if it is the last text node in its container,
     * * remaining spaces are replaced to a chain of spaces and `&nbsp;` (e.g. `'x   x'` becomes `'x &nbsp; x'`).
     *
     * Content of {@link #preElements} is not processed.
     *
     * @param node View text node to process.
     * @returns Processed text data.
     */
    private _processDataFromViewText;
    /**
     * Checks whether given node ends with a space character after changing appropriate space characters to `&nbsp;`s.
     *
     * @param  node Node to check.
     * @returns `true` if given `node` ends with space, `false` otherwise.
     */
    private _nodeEndsWithSpace;
    /**
     * Checks whether given text contains preformatted white space. This is the case if
     * * any of node ancestors has a name which is in `preElements` array, or
     * * the closest ancestor that has the `white-space` CSS property sets it to a value that preserves spaces
     *
     * @param node Node to check
     * @returns `true` if given node contains preformatted white space, `false` otherwise.
     */
    private _isPreFormatted;
    /**
     * Helper function. For given {@link module:engine/view/text~ViewText view text node}, it finds previous or next sibling
     * that is contained in the same container element. If there is no such sibling, `null` is returned.
     *
     * @param node Reference node.
     * @returns Touching text node, an inline object
     * or `null` if there is no next or previous touching text node.
     */
    private _getTouchingInlineViewNode;
    /**
     * Returns `true` if a DOM node belongs to {@link #blockElements}. `false` otherwise.
     */
    private _isBlockDomElement;
    /**
     * Returns `true` if a view node belongs to {@link #blockElements}. `false` otherwise.
     */
    private _isBlockViewElement;
    /**
     * Returns `true` if a DOM node belongs to {@link #inlineObjectElements}. `false` otherwise.
     */
    private _isInlineObjectElement;
    /**
     * Creates view element basing on the node type.
     *
     * @param node DOM node to check.
     * @param options Conversion options. See {@link module:engine/view/domconverter~ViewDomConverter#domToView} options parameter.
     */
    private _createViewElement;
    /**
     * Checks if view element's content should be treated as a raw data.
     *
     * @param viewElement View element to check.
     * @param options Conversion options. See {@link module:engine/view/domconverter~ViewDomConverter#domToView} options parameter.
     */
    private _isViewElementWithRawContent;
    /**
     * Checks whether a given element name should be renamed in a current rendering mode.
     *
     * @param elementName The name of view element.
     */
    private _shouldRenameElement;
    /**
     * Return a <span> element with a special attribute holding the name of the original element.
     * Optionally, copy all the attributes of the original element if that element is provided.
     *
     * @param elementName The name of view element.
     * @param originalDomElement The original DOM element to copy attributes and content from.
     */
    private _createReplacementDomElement;
}
/**
 * Enum representing the type of the block filler.
 *
 * Possible values:
 *
 * * `br` &ndash; For the `<br data-cke-filler="true">` block filler used in the editing view.
 * * `nbsp` &ndash; For the `&nbsp;` block fillers used in the data.
 * * `markedNbsp` &ndash; For the `&nbsp;` block fillers wrapped in `<span>` elements: `<span data-cke-filler="true">&nbsp;</span>`
 * used in the data.
 */
export type ViewBlockFillerMode = 'br' | 'nbsp' | 'markedNbsp';
export {};
/**
 * While rendering the editor content, the {@link module:engine/view/domconverter~ViewDomConverter} detected a `<script>` element that may
 * disrupt the editing experience. To avoid this, the `<script>` element was replaced with `<span data-ck-unsafe-element="script"></span>`.
 *
 * @error domconverter-unsafe-script-element-detected
 */
/**
 * While rendering the editor content, the
 * {@link module:engine/view/domconverter~ViewDomConverter} detected a `<style>` element that may affect
 * the editing experience. To avoid this, the `<style>` element was replaced with `<span data-ck-unsafe-element="style"></span>`.
 *
 * @error domconverter-unsafe-style-element-detected
 */
/**
 * The {@link module:engine/view/domconverter~ViewDomConverter} detected an interactive attribute in the
 * {@glink framework/architecture/editing-engine#editing-pipeline editing pipeline}. For the best
 * editing experience, the attribute was renamed to `data-ck-unsafe-attribute-[original attribute name]`.
 *
 * If you are the author of the plugin that generated this attribute and you want it to be preserved
 * in the editing pipeline, you can configure this when creating the element
 * using {@link module:engine/view/downcastwriter~ViewDowncastWriter} during the
 * {@glink framework/architecture/editing-engine#conversion model–view conversion}. Methods such as
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createContainerElement},
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createAttributeElement}, or
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement}
 * accept an option that will disable filtering of specific attributes:
 *
 * ```ts
 * const paragraph = writer.createContainerElement( 'p',
 * 	{
 * 		class: 'clickable-paragraph',
 * 		onclick: 'alert( "Paragraph clicked!" )'
 * 	},
 * 	{
 * 		// Make sure the "onclick" attribute will pass through.
 * 		renderUnsafeAttributes: [ 'onclick' ]
 * 	}
 * );
 * ```
 *
 * @error domconverter-unsafe-attribute-detected
 * @param {HTMLElement} domElement The DOM element the attribute was set on.
 * @param {string} key The original name of the attribute
 * @param {string} value The value of the original attribute
 */

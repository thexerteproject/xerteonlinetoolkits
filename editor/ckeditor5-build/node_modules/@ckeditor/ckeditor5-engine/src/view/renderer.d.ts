/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ViewDocumentChangeType } from './document.js';
import { type ViewDocumentSelection } from './documentselection.js';
import { type ViewDomConverter } from './domconverter.js';
import { type ViewElement } from './element.js';
import { type ViewNode } from './node.js';
import '../../theme/renderer.css';
type DomDocument = globalThis.Document;
declare const ViewRenderer_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Renderer is responsible for updating the DOM structure and the DOM selection based on
 * the {@link module:engine/view/renderer~ViewRenderer#markToSync information about updated view nodes}.
 * In other words, it renders the view to the DOM.
 *
 * Its main responsibility is to make only the necessary, minimal changes to the DOM. However, unlike in many
 * virtual DOM implementations, the primary reason for doing minimal changes is not the performance but ensuring
 * that native editing features such as text composition, autocompletion, spell checking, selection's x-index are
 * affected as little as possible.
 *
 * Renderer uses {@link module:engine/view/domconverter~ViewDomConverter} to transform view nodes and positions
 * to and from the DOM.
 */
export declare class ViewRenderer extends /* #__PURE__ */ ViewRenderer_base {
    /**
     * Set of DOM Documents instances.
     */
    readonly domDocuments: Set<DomDocument>;
    /**
     * Converter instance.
     */
    readonly domConverter: ViewDomConverter;
    /**
     * Set of nodes which attributes changed and may need to be rendered.
     */
    readonly markedAttributes: Set<ViewElement>;
    /**
     * Set of elements which child lists changed and may need to be rendered.
     */
    readonly markedChildren: Set<ViewElement>;
    /**
     * Set of text nodes which text data changed and may need to be rendered.
     */
    readonly markedTexts: Set<ViewNode>;
    /**
     * View selection. Renderer updates DOM selection based on the view selection.
     */
    readonly selection: ViewDocumentSelection;
    /**
     * Indicates if the view document is focused and selection can be rendered. Selection will not be rendered if
     * this is set to `false`.
     *
     * @observable
     */
    readonly isFocused: boolean;
    /**
     * Indicates whether the user is making a selection in the document (e.g. holding the mouse button and moving the cursor).
     * When they stop selecting, the property goes back to `false`.
     *
     * Note: In some browsers, the renderer will stop rendering the selection and inline fillers while the user is making
     * a selection to avoid glitches in DOM selection
     * (https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723).
     *
     * @observable
     */
    readonly isSelecting: boolean;
    /**
     * True if composition is in progress inside the document.
     *
     * This property is bound to the {@link module:engine/view/document~ViewDocument#isComposing `Document#isComposing`} property.
     *
     * @observable
     */
    readonly isComposing: boolean;
    /**
     * The text node in which the inline filler was rendered.
     */
    private _inlineFiller;
    /**
     * DOM element containing fake selection.
     */
    private _fakeSelectionContainer;
    /**
     * Creates a renderer instance.
     *
     * @param domConverter Converter instance.
     * @param selection View selection.
     */
    constructor(domConverter: ViewDomConverter, selection: ViewDocumentSelection);
    /**
     * Marks a view node to be updated in the DOM by {@link #render `render()`}.
     *
     * Note that only view nodes whose parents have corresponding DOM elements need to be marked to be synchronized.
     *
     * @see #markedAttributes
     * @see #markedChildren
     * @see #markedTexts
     *
     * @param type Type of the change.
     * @param node ViewNode to be marked.
     */
    markToSync(type: ViewDocumentChangeType, node: ViewNode): void;
    /**
     * Renders all buffered changes ({@link #markedAttributes}, {@link #markedChildren} and {@link #markedTexts}) and
     * the current view selection (if needed) to the DOM by applying a minimal set of changes to it.
     *
     * Renderer tries not to break the text composition (e.g. IME) and x-index of the selection,
     * so it does as little as it is needed to update the DOM.
     *
     * Renderer also handles {@link module:engine/view/filler fillers}. Especially, it checks if the inline filler is needed
     * at the selection position and adds or removes it. To prevent breaking text composition inline filler will not be
     * removed as long as the selection is in the text node which needed it at first.
     */
    render(): void;
    /**
     * Updates mappings of view element's children.
     *
     * Children that were replaced in the view structure by similar elements (same tag name) are treated as 'replaced'.
     * This means that their mappings can be updated so the new view elements are mapped to the existing DOM elements.
     * Thanks to that these elements do not need to be re-rendered completely.
     *
     * @param viewElement The view element whose children mappings will be updated.
     */
    private _updateChildrenMappings;
    /**
     * Updates mappings of a given view element.
     *
     * @param viewElement The view element whose mappings will be updated.
     * @param domElement The DOM element representing the given view element.
     */
    private _updateElementMappings;
    /**
     * Gets the position of the inline filler based on the current selection.
     * Here, we assume that we know that the filler is needed and
     * {@link #_isSelectionInInlineFiller is at the selection position}, and, since it is needed,
     * it is somewhere at the selection position.
     *
     * Note: The filler position cannot be restored based on the filler's DOM text node, because
     * when this method is called (before rendering), the bindings will often be broken. View-to-DOM
     * bindings are only dependable after rendering.
     */
    private _getInlineFillerPosition;
    /**
     * Returns `true` if the selection has not left the inline filler's text node.
     * If it is `true`, it means that the filler had been added for a reason and the selection did not
     * leave the filler's text node. For example, the user can be in the middle of a composition so it should not be touched.
     *
     * @returns `true` if the inline filler and selection are in the same place.
     */
    private _isSelectionInInlineFiller;
    /**
     * Removes the inline filler.
     */
    private _removeInlineFiller;
    /**
     * Checks if the inline {@link module:engine/view/filler filler} should be added.
     *
     * @returns `true` if the inline filler should be added.
     */
    private _needsInlineFillerAtSelection;
    /**
     * Checks if text needs to be updated and possibly updates it.
     *
     * @param viewText View text to update.
     * @param options.inlineFillerPosition The position where the inline filler should be rendered.
     */
    private _updateText;
    /**
     * Checks if attribute list needs to be updated and possibly updates it.
     *
     * @param viewElement The view element to update.
     */
    private _updateAttrs;
    /**
     * Checks if elements child list needs to be updated and possibly updates it.
     *
     * Note that on Android, to reduce the risk of composition breaks, it tries to update data of an existing
     * child text nodes instead of replacing them completely.
     *
     * @param viewElement View element to update.
     * @param options.inlineFillerPosition The position where the inline filler should be rendered.
     */
    private _updateChildren;
    /**
     * Shorthand for diffing two arrays or node lists of DOM nodes.
     *
     * @param actualDomChildren Actual DOM children
     * @param expectedDomChildren Expected DOM children.
     * @returns The list of actions based on the {@link module:utils/diff~diff} function.
     */
    private _diffNodeLists;
    /**
     * Finds DOM nodes that were replaced with the similar nodes (same tag name) in the view. All nodes are compared
     * within one `insert`/`delete` action group, for example:
     *
     * ```
     * Actual DOM:		<p><b>Foo</b>Bar<i>Baz</i><b>Bax</b></p>
     * Expected DOM:	<p>Bar<b>123</b><i>Baz</i><b>456</b></p>
     * Input actions:	[ insert, insert, delete, delete, equal, insert, delete ]
     * Output actions:	[ insert, replace, delete, equal, replace ]
     * ```
     *
     * @param actions Actions array which is a result of the {@link module:utils/diff~diff} function.
     * @param actualDom Actual DOM children
     * @param expectedDom Expected DOM children.
     * @param comparator A comparator function that should return `true` if the given node should be reused
     * (either by the update of a text node data or an element children list for similar elements).
     * @returns Actions array modified with the `update` actions.
     */
    private _findUpdateActions;
    /**
     * Checks if text needs to be updated and possibly updates it by removing and inserting only parts
     * of the data from the existing text node to reduce impact on the IME composition.
     *
     * @param domText DOM text node to update.
     * @param expectedText The expected data of a text node.
     */
    private _updateTextNode;
    /**
     * Part of the `_updateTextNode` method extracted for easier testing.
     */
    private _updateTextNodeInternal;
    /**
     * Marks text nodes to be synchronized.
     *
     * If a text node is passed, it will be marked. If an element is passed, all descendant text nodes inside it will be marked.
     *
     * @param viewNode View node to sync.
     */
    private _markDescendantTextToSync;
    /**
     * Checks if the selection needs to be updated and possibly updates it.
     */
    private _updateSelection;
    /**
     * Updates the fake selection.
     *
     * @param domEditable A valid DOM editable where the fake selection container should be added.
     */
    private _updateFakeSelection;
    /**
     * Updates the DOM selection.
     *
     * @param domEditable A valid DOM editable where the DOM selection should be rendered.
     */
    private _updateDomSelection;
    /**
     * Checks whether a given DOM selection needs to be updated.
     *
     * @param domSelection The DOM selection to check.
     */
    private _domSelectionNeedsUpdate;
    /**
     * Checks whether the fake selection needs to be updated.
     *
     * @param domEditable A valid DOM editable where a new fake selection container should be added.
     */
    private _fakeSelectionNeedsUpdate;
    /**
     * Removes the DOM selection.
     */
    private _removeDomSelection;
    /**
     * Removes the fake selection.
     */
    private _removeFakeSelection;
    /**
     * Checks if focus needs to be updated and possibly updates it.
     */
    private _updateFocus;
}
export {};

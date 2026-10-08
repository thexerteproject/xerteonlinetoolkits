/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/document
 */
import { ViewDocumentSelection } from './documentselection.js';
import { BubblingEmitterMixin } from './observer/bubblingemittermixin.js';
import { Collection, ObservableMixin } from '@ckeditor/ckeditor5-utils';
// @if CK_DEBUG_ENGINE // const { logDocument } = require( '../dev-utils/utils' );
/**
 * Document class creates an abstract layer over the content editable area, contains a tree of view elements and
 * {@link module:engine/view/documentselection~ViewDocumentSelection view selection} associated with this document.
 */
export class ViewDocument extends /* #__PURE__ */ BubblingEmitterMixin(/* #__PURE__ */ ObservableMixin()) {
    /**
     * Selection done on this document.
     */
    selection;
    /**
     * Roots of the view tree. Collection of the {@link module:engine/view/element~ViewElement view elements}.
     *
     * View roots are created as a result of binding between {@link module:engine/view/document~ViewDocument#roots} and
     * {@link module:engine/model/document~ModelDocument#roots} and this is handled by
     * {@link module:engine/controller/editingcontroller~EditingController}, so to create view root we need to create
     * model root using {@link module:engine/model/document~ModelDocument#createRoot}.
     */
    roots;
    /**
     * The styles processor instance used by this document when normalizing styles.
     */
    stylesProcessor;
    /**
     * Post-fixer callbacks registered to the view document.
     */
    _postFixers = new Set();
    /**
     * Creates a Document instance.
     *
     * @param stylesProcessor The styles processor instance.
     */
    constructor(stylesProcessor) {
        super();
        this.selection = new ViewDocumentSelection();
        this.roots = new Collection({ idProperty: 'rootName' });
        this.stylesProcessor = stylesProcessor;
        this.set('isReadOnly', false);
        this.set('isFocused', false);
        this.set('isSelecting', false);
        this.set('isComposing', false);
    }
    /**
     * Gets a {@link module:engine/view/document~ViewDocument#roots view root element} with the specified name. If the name is not
     * specific "main" root is returned.
     *
     * @param name Name of the root.
     * @returns The view root element with the specified name or null when there is no root of given name.
     */
    getRoot(name = 'main') {
        return this.roots.get(name);
    }
    /**
     * Allows registering post-fixer callbacks. A post-fixers mechanism allows to update the view tree just before it is rendered
     * to the DOM.
     *
     * Post-fixers are executed right after all changes from the outermost change block were applied but
     * before the {@link module:engine/view/view~EditingView#event:render render event} is fired. If a post-fixer callback made
     * a change, it should return `true`. When this happens, all post-fixers are fired again to check if something else should
     * not be fixed in the new document tree state.
     *
     * View post-fixers are useful when you want to apply some fixes whenever the view structure changes. Keep in mind that
     * changes executed in a view post-fixer should not break model-view mapping.
     *
     * The types of changes which should be safe:
     *
     * * adding or removing attribute from elements,
     * * changes inside of {@link module:engine/view/uielement~ViewUIElement UI elements},
     * * {@link module:engine/controller/editingcontroller~EditingController#reconvertItem marking some of the model elements to be
     * re-converted}.
     *
     * Try to avoid changes which touch view structure:
     *
     * * you should not add or remove nor wrap or unwrap any view elements,
     * * you should not change the editor data model in a view post-fixer.
     *
     * As a parameter, a post-fixer callback receives a {@link module:engine/view/downcastwriter~ViewDowncastWriter downcast writer}.
     *
     * Typically, a post-fixer will look like this:
     *
     * ```ts
     * editor.editing.view.document.registerPostFixer( writer => {
     * 	if ( checkSomeCondition() ) {
     * 		writer.doSomething();
     *
     * 		// Let other post-fixers know that something changed.
     * 		return true;
     * 	}
     *
     * 	return false;
     * } );
     * ```
     *
     * Note that nothing happens right after you register a post-fixer (e.g. execute such a code in the console).
     * That is because adding a post-fixer does not execute it.
     * The post-fixer will be executed as soon as any change in the document needs to cause its rendering.
     * If you want to re-render the editor's view after registering the post-fixer then you should do it manually by calling
     * {@link module:engine/view/view~EditingView#forceRender `view.forceRender()`}.
     *
     * If you need to register a callback which is executed when DOM elements are already updated,
     * use {@link module:engine/view/view~EditingView#event:render render event}.
     */
    registerPostFixer(postFixer) {
        this._postFixers.add(postFixer);
    }
    /**
     * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
     */
    destroy() {
        this.roots.forEach(root => root.destroy());
        this.stopListening();
    }
    /**
     * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
     *
     * @internal
     */
    _callPostFixers(writer) {
        let wasFixed = false;
        do {
            for (const callback of this._postFixers) {
                wasFixed = callback(writer);
                if (wasFixed) {
                    break;
                }
            }
        } while (wasFixed);
    }
}

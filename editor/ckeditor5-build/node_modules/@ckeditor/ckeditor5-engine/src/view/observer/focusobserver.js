/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/focusobserver
 */
import { DomEventObserver } from './domeventobserver.js';
// @if CK_DEBUG_TYPING // const { _debouncedLine, _buildLogMessage } = require( '../../dev-utils/utils.js' );
/**
 * {@link module:engine/view/document~ViewDocument#event:focus Focus}
 * and {@link module:engine/view/document~ViewDocument#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~ViewRootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~ViewRootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export class FocusObserver extends DomEventObserver {
    /**
     * Identifier of the timeout currently used by focus listener to delay rendering execution.
     */
    _renderTimeoutId = null;
    /**
     * Set to `true` if the document is in the process of setting the focus.
     *
     * The flag is used to indicate that setting the focus is in progress.
     */
    _isFocusChanging = false;
    /**
     * @inheritDoc
     */
    domEventType = ['focus', 'blur'];
    /**
     * @inheritDoc
     */
    constructor(view) {
        super(view);
        this.useCapture = true;
        const document = this.document;
        document.on('focus', () => this._handleFocus());
        document.on('blur', (evt, data) => this._handleBlur(data));
        // Focus the editor in cases where browser dispatches `beforeinput` event to a not-focused editable element.
        // This is flushed by the beforeinput listener in the `InsertTextObserver`.
        // Note that focus is set only if the document is not focused yet.
        // See https://github.com/ckeditor/ckeditor5/issues/14702.
        document.on('beforeinput', () => {
            if (!document.isFocused) {
                this._handleFocus();
            }
        }, { priority: 'highest' });
    }
    /**
     * Finishes setting the document focus state.
     */
    flush() {
        if (this._isFocusChanging) {
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	_debouncedLine();
            // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'FocusObserver',
            // @if CK_DEBUG_TYPING // 		'flush focus'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            this._isFocusChanging = false;
            this.document.isFocused = true;
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
        }
    }
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	_debouncedLine();
        // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'FocusObserver',
        // @if CK_DEBUG_TYPING // 		`${ domEvent.type } event`
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'FocusObserver',
        // @if CK_DEBUG_TYPING // 		'DOM target:',
        // @if CK_DEBUG_TYPING // 		{ target: domEvent.target, relatedTarget: domEvent.relatedTarget }
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // 	const domSelection = window.getSelection();
        // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'FocusObserver',
        // @if CK_DEBUG_TYPING // 		'DOM Selection:',
        // @if CK_DEBUG_TYPING // 		{ node: domSelection!.anchorNode, offset: domSelection!.anchorOffset },
        // @if CK_DEBUG_TYPING // 		{ node: domSelection!.focusNode, offset: domSelection!.focusOffset }
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        this.fire(domEvent.type, domEvent);
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.groupEnd();
        // @if CK_DEBUG_TYPING // }
    }
    /**
     * @inheritDoc
     */
    destroy() {
        this._clearTimeout();
        super.destroy();
    }
    /**
     * The `focus` event handler.
     */
    _handleFocus() {
        this._clearTimeout();
        this._isFocusChanging = true;
        // Unfortunately native `selectionchange` event is fired asynchronously.
        // We need to wait until `SelectionObserver` handle the event and then render. Otherwise rendering will
        // overwrite new DOM selection with selection from the view.
        // See https://github.com/ckeditor/ckeditor5-engine/issues/795 for more details.
        // Long timeout is needed to solve #676 and https://github.com/ckeditor/ckeditor5-engine/issues/1157 issues.
        //
        // Using `view.change()` instead of `view.forceRender()` to prevent double rendering
        // in a situation where `selectionchange` already caused selection change.
        this._renderTimeoutId = setTimeout(() => {
            this._renderTimeoutId = null;
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'FocusObserver',
            // @if CK_DEBUG_TYPING // 		'flush on timeout'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            this.flush();
            this.view.change(() => { });
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
        }, 50);
    }
    /**
     * The `blur` event handler.
     */
    _handleBlur(data) {
        const selectedEditable = this.document.selection.editableElement;
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'FocusObserver',
        // @if CK_DEBUG_TYPING // 		'selectedEditable:',
        // @if CK_DEBUG_TYPING // 		{ selectedEditable }
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        if (selectedEditable === null || selectedEditable === data.target) {
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'FocusObserver',
            // @if CK_DEBUG_TYPING // 		'document no longer focused'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            this.document.isFocused = false;
            this._isFocusChanging = false;
            // Re-render the document to update view elements
            // (changing document.isFocused already marked view as changed since last rendering).
            this.view.change(() => { });
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
        }
    }
    /**
     * Clears timeout.
     */
    _clearTimeout() {
        if (this._renderTimeoutId) {
            clearTimeout(this._renderTimeoutId);
            this._renderTimeoutId = null;
        }
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/compositionobserver
 */
import { DomEventObserver } from './domeventobserver.js';
// @if CK_DEBUG_TYPING // const { _debouncedLine, _buildLogMessage } = require( '../../dev-utils/utils.js' );
/**
 * {@link module:engine/view/document~ViewDocument#event:compositionstart Compositionstart},
 * {@link module:engine/view/document~ViewDocument#event:compositionupdate compositionupdate} and
 * {@link module:engine/view/document~ViewDocument#event:compositionend compositionend} events observer.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export class CompositionObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = ['compositionstart', 'compositionupdate', 'compositionend'];
    /**
     * @inheritDoc
     */
    constructor(view) {
        super(view);
        const document = this.document;
        document.on('compositionstart', () => {
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'CompositionObserver',
            // @if CK_DEBUG_TYPING // 		'%c┌───────────────────────────── isComposing = true ─────────────────────────────┐',
            // @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            document.isComposing = true;
        });
        document.on('compositionend', () => {
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'CompositionObserver',
            // @if CK_DEBUG_TYPING // 		'%c└───────────────────────────── isComposing = false ─────────────────────────────┘',
            // @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            document.isComposing = false;
        });
    }
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	_debouncedLine();
        // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'CompositionObserver',
        // @if CK_DEBUG_TYPING // 		`${ domEvent.type }`
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        this.fire(domEvent.type, domEvent, {
            data: domEvent.data
        });
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.groupEnd();
        // @if CK_DEBUG_TYPING // }
    }
}

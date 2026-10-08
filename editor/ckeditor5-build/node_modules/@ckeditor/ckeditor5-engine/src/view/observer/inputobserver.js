/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/inputobserver
 */
import { DomEventObserver } from './domeventobserver.js';
import { ViewDataTransfer } from '../datatransfer.js';
import { env, isText, indexOf } from '@ckeditor/ckeditor5-utils';
import { INLINE_FILLER_LENGTH, startsWithFiller } from '../filler.js';
// @if CK_DEBUG_TYPING // const { _debouncedLine, _buildLogMessage } = require( '../../dev-utils/utils.js' );
/**
 * Observer for events connected with data input.
 *
 * **Note**: This observer is attached by {@link module:engine/view/view~EditingView} and available by default in all
 * editor instances.
 */
export class InputObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = 'beforeinput';
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	_debouncedLine();
        // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'InputObserver',
        // @if CK_DEBUG_TYPING // 		`${ domEvent.type }: ${ domEvent.inputType } - ${ domEvent.isComposing ? 'is' : 'not' } composing`,
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        const domTargetRanges = domEvent.getTargetRanges();
        const view = this.view;
        const viewDocument = view.document;
        let dataTransfer = null;
        let data = null;
        let targetRanges = [];
        if (domEvent.dataTransfer) {
            dataTransfer = new ViewDataTransfer(domEvent.dataTransfer);
        }
        if (domEvent.data !== null) {
            data = domEvent.data;
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
            // @if CK_DEBUG_TYPING // 		`%cevent data: %c${ JSON.stringify( data ) }`,
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		'color: blue;'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
        }
        else if (dataTransfer) {
            data = dataTransfer.getData('text/plain');
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
            // @if CK_DEBUG_TYPING // 		`%cevent data transfer: %c${ JSON.stringify( data ) }`,
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		'color: blue;'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
        }
        // If the editor selection is fake (an object is selected), the DOM range does not make sense because it is anchored
        // in the fake selection container.
        if (viewDocument.selection.isFake) {
            // Future-proof: in case of multi-range fake selections being possible.
            targetRanges = Array.from(viewDocument.selection.getRanges());
            // Do not allow typing inside a fake selection container, we will handle it manually.
            domEvent.preventDefault();
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
            // @if CK_DEBUG_TYPING // 		'%cusing fake selection:',
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		targetRanges,
            // @if CK_DEBUG_TYPING // 		viewDocument.selection.isFake ? 'fake view selection' : 'fake DOM parent'
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
        }
        else if (domTargetRanges.length) {
            targetRanges = domTargetRanges.map(domRange => {
                // Sometimes browser provides range that starts before editable node.
                // We try to fall back to collapsed range at the valid end position.
                // See https://github.com/ckeditor/ckeditor5/issues/14411.
                // See https://github.com/ckeditor/ckeditor5/issues/14050.
                let viewStart = view.domConverter.domPositionToView(domRange.startContainer, domRange.startOffset);
                const viewEnd = view.domConverter.domPositionToView(domRange.endContainer, domRange.endOffset);
                // When text replacement is enabled and browser tries to replace double space with dot, and space,
                // but the first space is no longer where browser put it (it was moved to an attribute element),
                // then we must extend the target range so it does not include a part of an inline filler.
                if (viewStart && startsWithFiller(domRange.startContainer) && domRange.startOffset < INLINE_FILLER_LENGTH) {
                    // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                    // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
                    // @if CK_DEBUG_TYPING // 		'%cTarget range starts in an inline filler - adjusting it',
                    // @if CK_DEBUG_TYPING // 		'font-style: italic'
                    // @if CK_DEBUG_TYPING // 	) );
                    // @if CK_DEBUG_TYPING // }
                    domEvent.preventDefault();
                    let count = INLINE_FILLER_LENGTH - domRange.startOffset;
                    viewStart = viewStart.getLastMatchingPosition(value => {
                        // Ignore attribute and UI elements but stop on container elements.
                        if (value.item.is('attributeElement') || value.item.is('uiElement')) {
                            return true;
                        }
                        // Skip as many characters as inline filler was overlapped.
                        if (value.item.is('$textProxy') && count--) {
                            return true;
                        }
                        return false;
                    }, { direction: 'backward', singleCharacters: true });
                }
                // Check if there is no an inline filler just after the target range.
                if (isFollowedByInlineFiller(domRange.endContainer, domRange.endOffset)) {
                    // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                    // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
                    // @if CK_DEBUG_TYPING // 		'%cTarget range ends just before an inline filler - prevent default behavior',
                    // @if CK_DEBUG_TYPING // 		'font-style: italic'
                    // @if CK_DEBUG_TYPING // 	) );
                    // @if CK_DEBUG_TYPING // }
                    domEvent.preventDefault();
                }
                if (viewStart) {
                    return view.createRange(viewStart, viewEnd);
                }
                else if (viewEnd) {
                    return view.createRange(viewEnd);
                }
            }).filter((range) => !!range);
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
            // @if CK_DEBUG_TYPING // 		'%cusing target ranges:',
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		targetRanges
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
        }
        // For Android devices we use a fallback to the current DOM selection, Android modifies it according
        // to the expected target ranges of input event.
        else if (env.isAndroid) {
            const domSelection = domEvent.target.ownerDocument.defaultView.getSelection();
            targetRanges = Array.from(view.domConverter.domSelectionToView(domSelection).getRanges());
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'InputObserver',
            // @if CK_DEBUG_TYPING // 		'%cusing selection ranges:',
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		targetRanges
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
        }
        // Android sometimes fires insertCompositionText with a new-line character at the end of the data
        // instead of firing insertParagraph beforeInput event.
        // Fire the correct type of beforeInput event and ignore the replaced fragment of text because
        // it wants to replace "test" with "test\n".
        // https://github.com/ckeditor/ckeditor5/issues/12368.
        if (env.isAndroid && domEvent.inputType == 'insertCompositionText' && data && data.endsWith('\n')) {
            this.fire(domEvent.type, domEvent, {
                inputType: 'insertParagraph',
                targetRanges: [view.createRange(targetRanges[0].end)]
            });
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
            return;
        }
        // Normalize the insertText data that includes new-line characters.
        // https://github.com/ckeditor/ckeditor5/issues/2045.
        if (['insertText', 'insertReplacementText'].includes(domEvent.inputType) && data && data.includes('\n')) {
            // There might be a single new-line or double for new paragraph, but we translate
            // it to paragraphs as it is our default action for enter handling.
            const parts = data.split(/\n{1,2}/g);
            let partTargetRanges = targetRanges;
            // Handle all parts on our side as we rely on paragraph inserting and synchronously updated view selection.
            domEvent.preventDefault();
            for (let i = 0; i < parts.length; i++) {
                const dataPart = parts[i];
                if (dataPart != '') {
                    this.fire(domEvent.type, domEvent, {
                        data: dataPart,
                        dataTransfer,
                        targetRanges: partTargetRanges,
                        inputType: domEvent.inputType,
                        isComposing: domEvent.isComposing
                    });
                    // Use the result view selection so following events will be added one after another.
                    partTargetRanges = [viewDocument.selection.getFirstRange()];
                }
                if (i + 1 < parts.length) {
                    this.fire(domEvent.type, domEvent, {
                        inputType: 'insertParagraph',
                        targetRanges: partTargetRanges
                    });
                    // Use the result view selection so following events will be added one after another.
                    partTargetRanges = [viewDocument.selection.getFirstRange()];
                }
            }
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
            return;
        }
        // Fire the normalized beforeInput event.
        this.fire(domEvent.type, domEvent, {
            data,
            dataTransfer,
            targetRanges,
            inputType: domEvent.inputType,
            isComposing: domEvent.isComposing
        });
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.groupEnd();
        // @if CK_DEBUG_TYPING // }
    }
}
/**
 * Returns `true` if there is an inline filler just after the position in DOM.
 * It walks up the DOM tree if the offset is at the end of the node.
 */
function isFollowedByInlineFiller(node, offset) {
    while (node.parentNode) {
        if (isText(node)) {
            if (offset != node.data.length) {
                return false;
            }
        }
        else {
            if (offset != node.childNodes.length) {
                return false;
            }
        }
        offset = indexOf(node) + 1;
        node = node.parentNode;
        if (offset < node.childNodes.length && startsWithFiller(node.childNodes[offset])) {
            return true;
        }
    }
    return false;
}

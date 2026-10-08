/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { env, EventInfo, count, isInsideSurrogatePair, isInsideCombinedSymbol, isInsideEmojiSequence, keyCodes, ObservableMixin } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { Observer, FocusObserver, ViewDocumentDomEventData, _tryFixingModelRange, ModelLiveRange, BubblingEventInfo, MouseObserver, TouchObserver } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { debounce, escapeRegExp } from 'es-toolkit/compat';

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module typing/utils/changebuffer
 */ /**
 * Change buffer allows to group atomic changes (like characters that have been typed) into
 * {@link module:engine/model/batch~Batch batches}.
 *
 * Batches represent single undo steps, hence changes added to one single batch are undone together.
 *
 * The buffer has a configurable limit of atomic changes that it can accommodate. After the limit was
 * exceeded (see {@link ~TypingChangeBuffer#input}), a new batch is created in {@link ~TypingChangeBuffer#batch}.
 *
 * To use the change buffer you need to let it know about the number of changes that were added to the batch:
 *
 * ```ts
 * const buffer = new ChangeBuffer( model, LIMIT );
 *
 * // Later on in your feature:
 * buffer.batch.insert( pos, insertedCharacters );
 * buffer.input( insertedCharacters.length );
 * ```
 */ class TypingChangeBuffer {
    /**
	 * The model instance.
	 */ model;
    /**
	 * The maximum number of atomic changes which can be contained in one batch.
	 */ limit;
    /**
	 * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
	 */ _isLocked;
    /**
	 * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
	 * the {@link #batch batch} is set to a new one.
	 */ _size;
    /**
	 * The current batch instance.
	 */ _batch = null;
    /**
	 * The callback to document the change event which later needs to be removed.
	 */ _changeCallback;
    /**
	 * The callback to document selection `change:attribute` and `change:range` events which resets the buffer.
	 */ _selectionChangeCallback;
    /**
	 * Creates a new instance of the change buffer.
	 *
	 * @param limit The maximum number of atomic changes which can be contained in one batch.
	 */ constructor(model, limit = 20){
        this.model = model;
        this._size = 0;
        this.limit = limit;
        this._isLocked = false;
        // The function to be called in order to notify the buffer about batches which appeared in the document.
        // The callback will check whether it is a new batch and in that case the buffer will be flushed.
        //
        // The reason why the buffer needs to be flushed whenever a new batch appears is that the changes added afterwards
        // should be added to a new batch. For instance, when the user types, then inserts an image, and then types again,
        // the characters typed after inserting the image should be added to a different batch than the characters typed before.
        this._changeCallback = (evt, batch)=>{
            if (batch.isLocal && batch.isUndoable && batch !== this._batch) {
                this._reset(true);
            }
        };
        this._selectionChangeCallback = ()=>{
            this._reset();
        };
        this.model.document.on('change', this._changeCallback);
        this.model.document.selection.on('change:range', this._selectionChangeCallback);
        this.model.document.selection.on('change:attribute', this._selectionChangeCallback);
    }
    /**
	 * The current batch to which a feature should add its operations. Once the {@link #size}
	 * is reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
	 */ get batch() {
        if (!this._batch) {
            this._batch = this.model.createBatch({
                isTyping: true
            });
        }
        return this._batch;
    }
    /**
	 * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
	 * the {@link #batch batch} is set to a new one.
	 */ get size() {
        return this._size;
    }
    /**
	 * The input number of changes into the buffer. Once the {@link #size} is
	 * reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
	 *
	 * @param changeCount The number of atomic changes to input.
	 */ input(changeCount) {
        this._size += changeCount;
        if (this._size >= this.limit) {
            this._reset(true);
        }
    }
    /**
	 * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
	 */ get isLocked() {
        return this._isLocked;
    }
    /**
	 * Locks the buffer.
	 */ lock() {
        this._isLocked = true;
    }
    /**
	 * Unlocks the buffer.
	 */ unlock() {
        this._isLocked = false;
    }
    /**
	 * Destroys the buffer.
	 */ destroy() {
        this.model.document.off('change', this._changeCallback);
        this.model.document.selection.off('change:range', this._selectionChangeCallback);
        this.model.document.selection.off('change:attribute', this._selectionChangeCallback);
    }
    /**
	 * Resets the change buffer.
	 *
	 * @param ignoreLock Whether internal lock {@link #isLocked} should be ignored.
	 */ _reset(ignoreLock = false) {
        if (!this.isLocked || ignoreLock) {
            this._batch = null;
            this._size = 0;
        }
    }
}

/**
 * The insert text command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 */ class InsertTextCommand extends Command {
    /**
	 * Typing's change buffer used to group subsequent changes into batches.
	 */ _buffer;
    /**
	 * Creates an instance of the command.
	 *
	 * @param undoStepSize The maximum number of atomic changes
	 * which can be contained in one batch in the command buffer.
	 */ constructor(editor, undoStepSize){
        super(editor);
        this._buffer = new TypingChangeBuffer(editor.model, undoStepSize);
        // Since this command may execute on different selectable than selection, it should be checked directly in execute block.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * The current change buffer.
	 */ get buffer() {
        return this._buffer;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._buffer.destroy();
    }
    /**
	 * Executes the input command. It replaces the content within the given range with the given text.
	 * Replacing is a two step process, first the content within the range is removed and then the new text is inserted
	 * at the beginning of the range (which after the removal is a collapsed range).
	 *
	 * @fires execute
	 * @param options The command options.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const doc = model.document;
        const text = options.text || '';
        const textInsertions = text.length;
        let selection = doc.selection;
        if (options.selection) {
            selection = options.selection;
        } else if (options.range) {
            selection = model.createSelection(options.range);
        }
        // Stop executing if selectable is in non-editable place.
        if (!model.canEditAt(selection)) {
            return;
        }
        const resultRange = options.resultRange;
        model.enqueueChange(this._buffer.batch, (writer)=>{
            this._buffer.lock();
            // Store selection attributes before deleting old content to preserve formatting and link.
            // This unifies the behavior between ModelDocumentSelection and Selection provided as input option.
            const selectionAttributes = Array.from(doc.selection.getAttributes());
            model.deleteContent(selection);
            if (text) {
                model.insertContent(writer.createText(text, selectionAttributes), selection);
            }
            if (resultRange) {
                writer.setSelection(resultRange);
            } else if (!selection.is('documentSelection')) {
                writer.setSelection(selection);
            }
            this._buffer.unlock();
            this._buffer.input(textInsertions);
        });
    }
}

// @if CK_DEBUG_TYPING // const { _buildLogMessage } = require( '@ckeditor/ckeditor5-engine/src/dev-utils/utils.js' );
const TYPING_INPUT_TYPES = [
    // For collapsed range:
    //	- This one is a regular typing (all browsers, all systems).
    //	- This one is used by Chrome when typing accented letter – 2nd step when the user selects the accent (Mac).
    // For non-collapsed range:
    //	- This one is used by Chrome when typing accented letter – when the selection box first appears (Mac).
    //	- This one is used by Safari when accepting spell check suggestions from the context menu (Mac).
    'insertText',
    // This one is used by Safari when typing accented letter (Mac).
    // This one is used by Safari when accepting spell check suggestions from the autocorrection pop-up (Mac).
    'insertReplacementText'
];
const TYPING_INPUT_TYPES_ANDROID = [
    ...TYPING_INPUT_TYPES,
    'insertCompositionText'
];
/**
 * Text insertion observer introduces the {@link module:engine/view/document~ViewDocument#event:insertText} event.
 */ class InsertTextObserver extends Observer {
    /**
	 * Instance of the focus observer. Insert text observer calls
	 * {@link module:engine/view/observer/focusobserver~FocusObserver#flush} to mark the latest focus change as complete.
	 */ focusObserver;
    /**
	 * @inheritDoc
	 */ constructor(view){
        super(view);
        this.focusObserver = view.getObserver(FocusObserver);
        // On Android composition events should immediately be applied to the model. Rendering is not disabled.
        // On non-Android the model is updated only on composition end.
        // On Android we can't rely on composition start/end to update model.
        const typingInputTypes = env.isAndroid ? TYPING_INPUT_TYPES_ANDROID : TYPING_INPUT_TYPES;
        const viewDocument = view.document;
        viewDocument.on('beforeinput', (evt, data)=>{
            if (!this.isEnabled) {
                return;
            }
            const { data: text, targetRanges, inputType, domEvent, isComposing } = data;
            if (!typingInputTypes.includes(inputType)) {
                return;
            }
            // Mark the latest focus change as complete (we are typing in editable after the focus
            // so the selection is in the focused element).
            this.focusObserver.flush();
            const eventInfo = new EventInfo(viewDocument, 'insertText');
            viewDocument.fire(eventInfo, new ViewDocumentDomEventData(view, domEvent, {
                text,
                selection: view.createSelection(targetRanges),
                isComposing
            }));
            // Stop the beforeinput event if `delete` event was stopped.
            // https://github.com/ckeditor/ckeditor5/issues/753
            if (eventInfo.stop.called) {
                evt.stop();
            }
        });
        // On Android composition events are immediately applied to the model.
        // On non-Android the model is updated only on composition end.
        // On Android we can't rely on composition start/end to update model.
        if (!env.isAndroid) {
            // Note: The priority must be lower than the CompositionObserver handler to call it after the renderer is unblocked.
            // This is important for view to DOM position mapping.
            // This causes the effect of first remove composed DOM and then reapply it after model modification.
            viewDocument.on('compositionend', (evt, { data, domEvent })=>{
                if (!this.isEnabled) {
                    return;
                }
                // In case of aborted composition.
                if (!data) {
                    return;
                }
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'InsertTextObserver',
                // @if CK_DEBUG_TYPING // 		`%cFire insertText event, %c${ JSON.stringify( data ) }`,
                // @if CK_DEBUG_TYPING // 		'font-weight: bold',
                // @if CK_DEBUG_TYPING // 		 'color: blue'
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                // How do we know where to insert the composed text?
                // 1. The SelectionObserver is blocked and the view is not updated with the composition changes.
                // 2. The last moment before it's locked is the `compositionstart` event.
                // 3. The `SelectionObserver` is listening for `compositionstart` event and immediately converts
                //    the selection. Handle this at the low priority so after the rendering is blocked.
                viewDocument.fire('insertText', new ViewDocumentDomEventData(view, domEvent, {
                    text: data,
                    isComposing: true
                }));
            }, {
                priority: 'low'
            });
        }
    }
    /**
	 * @inheritDoc
	 */ observe() {}
    /**
	 * @inheritDoc
	 */ stopObserving() {}
}

// @if CK_DEBUG_TYPING // const { _debouncedLine, _buildLogMessage } = require( '@ckeditor/ckeditor5-engine/src/dev-utils/utils.js' );
/**
 * Handles text input coming from the keyboard or other input methods.
 */ class Input extends Plugin {
    /**
	 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
	 */ _typingQueue;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Input';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const view = editor.editing.view;
        const mapper = editor.editing.mapper;
        const modelSelection = model.document.selection;
        this._typingQueue = new TypingQueue(editor);
        view.addObserver(InsertTextObserver);
        // TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
        const insertTextCommand = new InsertTextCommand(editor, editor.config.get('typing.undoStep') || 20);
        // Register `insertText` command and add `input` command as an alias for backward compatibility.
        editor.commands.add('insertText', insertTextCommand);
        editor.commands.add('input', insertTextCommand);
        this.listenTo(view.document, 'beforeinput', ()=>{
            // Flush queue on the next beforeinput event because it could happen
            // that the mutation observer does not notice the DOM change in time.
            this._typingQueue.flush('next beforeinput');
        }, {
            priority: 'high'
        });
        this.listenTo(view.document, 'insertText', (evt, data)=>{
            const { text, selection: viewSelection } = data;
            // In case of a synthetic event, make sure that selection is not fake.
            if (view.document.selection.isFake && viewSelection && view.document.selection.isSimilar(viewSelection)) {
                data.preventDefault();
            }
            // In case of typing on a non-collapsed range, we have to handle it ourselves as a browser
            // could modify the DOM unpredictably.
            // Noticed cases:
            // * <pre><code>[foo</code></pre><p>]bar</p>
            // * <p>[foo</p><pre>]<code>bar</code></pre>
            // * <p>[foo</p><blockquote><p>]bar</p></blockquote>
            //
            // Especially tricky case is when a code block follows a paragraph as code block on the view side
            // is rendered as a <code> element inside a <pre> element, but only the <code> element is mapped to the model.
            // While mapping view position <pre>]<code> to model, the model position results before the <codeBlock> element,
            // and this triggers selection fixer to cover only text in the previous paragraph.
            //
            // This is safe for composition as those events are not cancellable
            // and the preventDefault() and defaultPrevented are not affected.
            if (viewSelection && Array.from(viewSelection.getRanges()).some((range)=>!range.isCollapsed)) {
                data.preventDefault();
            }
            if (!insertTextCommand.isEnabled) {
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		'%cInsertText command is disabled - prevent DOM change.',
                // @if CK_DEBUG_TYPING // 		'font-style: italic'
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                data.preventDefault();
                return;
            }
            let modelRanges;
            // If view selection was specified, translate it to model selection.
            if (viewSelection) {
                modelRanges = Array.from(viewSelection.getRanges()).filter((viewRange)=>{
                    // On Windows 11 with the US International keyboard, events are batched.
                    // In other words, the first backtick press does not send an `insertText` event,
                    // and only the second one sends it double (batched).
                    // This causes a race condition if during the first backtick insert the element is removed from the tree,
                    // and the second event flushes changes, and it's original targetRanges,
                    // which were initially good, now refer to a removed element.
                    // This is not reproducible on Mac/Linux as they enter composition mode.
                    // See more: https://github.com/ckeditor/ckeditor5/issues/18926.
                    return viewRange.root.is('rootElement');
                }).map((viewRange)=>mapper.toModelRange(viewRange)).map((modelRange)=>_tryFixingModelRange(modelRange, model.schema) || modelRange);
            }
            if (!modelRanges || !modelRanges.length) {
                modelRanges = Array.from(modelSelection.getRanges());
            }
            let insertText = text;
            // Typing in English on Android is firing composition events for the whole typed word.
            // We need to check the target range text to only apply the difference.
            if (env.isAndroid) {
                const selectedText = Array.from(modelRanges[0].getItems()).reduce((rangeText, node)=>{
                    return rangeText + (node.is('$textProxy') ? node.data : '');
                }, '');
                if (selectedText) {
                    if (selectedText.length <= insertText.length) {
                        if (insertText.startsWith(selectedText)) {
                            insertText = insertText.substring(selectedText.length);
                            modelRanges[0].start = modelRanges[0].start.getShiftedBy(selectedText.length);
                        }
                    } else {
                        if (selectedText.startsWith(insertText)) {
                            // TODO this should be mapped as delete?
                            modelRanges[0].start = modelRanges[0].start.getShiftedBy(insertText.length);
                            insertText = '';
                        }
                    }
                }
                if (insertText.length == 0 && modelRanges[0].isCollapsed) {
                    // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                    // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                    // @if CK_DEBUG_TYPING // 		'%cIgnore insertion of an empty data to the collapsed range.',
                    // @if CK_DEBUG_TYPING // 		'font-style: italic'
                    // @if CK_DEBUG_TYPING // 	) );
                    // @if CK_DEBUG_TYPING // }
                    return;
                }
            }
            // Note: the TypingQueue stores live-ranges internally as RTC could change the model while waiting for mutations.
            const commandData = {
                text: insertText,
                selection: model.createSelection(modelRanges)
            };
            // This is a beforeinput event, so we need to wait until the browser updates the DOM,
            // and we could apply changes to the model and verify if the DOM is valid.
            // The browser applies changes to the DOM not immediately on beforeinput event.
            // We just wait for mutation observer to notice changes or as a fallback a timeout.
            //
            // Previously we were cancelling the non-composition events, but it caused issues especially in Safari.
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
            // @if CK_DEBUG_TYPING // 		`%cQueue insertText:%c "${ commandData.text }"%c ` +
            // @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
            // @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]` +
            // @if CK_DEBUG_TYPING // 		` queue size: ${ this._typingQueue.length + 1 }`,
            // @if CK_DEBUG_TYPING // 		'font-weight: bold',
            // @if CK_DEBUG_TYPING // 		'color: blue',
            // @if CK_DEBUG_TYPING // 		''
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            this._typingQueue.push(commandData, Boolean(data.isComposing));
            if (data.domEvent.defaultPrevented) {
                this._typingQueue.flush('beforeinput default prevented');
            }
        });
        // Delete selected content on composition start.
        if (env.isAndroid) {
            // On Android with English keyboard, the composition starts just by putting caret
            // at the word end or by selecting a table column. This is not a real composition started.
            // Trigger delete content on first composition key pressed.
            this.listenTo(view.document, 'keydown', (evt, data)=>{
                if (modelSelection.isCollapsed || data.keyCode != 229 || !view.document.isComposing) {
                    return;
                }
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
                // @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		'%cKeyDown 229%c -> model.deleteContent() ' +
                // @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`,
                // @if CK_DEBUG_TYPING // 		'font-weight: bold',
                // @if CK_DEBUG_TYPING // 		''
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                deleteSelectionContent(model, insertTextCommand);
            });
        } else {
            // Note: The priority must precede the CompositionObserver handler to call it before
            // the renderer is blocked, because we want to render this change.
            this.listenTo(view.document, 'compositionstart', ()=>{
                if (modelSelection.isCollapsed) {
                    return;
                }
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
                // @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		'%cComposition start%c -> model.deleteContent() ' +
                // @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`,
                // @if CK_DEBUG_TYPING // 		'font-weight: bold',
                // @if CK_DEBUG_TYPING // 		'',
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                deleteSelectionContent(model, insertTextCommand);
            }, {
                priority: 'high'
            });
        }
        // Apply changes to the model as they are applied to the DOM by the browser.
        // On beforeinput event, the DOM is not yet modified. We wait for detected mutations to apply model changes.
        this.listenTo(view.document, 'mutations', (evt, { mutations })=>{
            // Check if mutations are relevant for queued changes.
            if (this._typingQueue.hasAffectedElements()) {
                for (const { node } of mutations){
                    const viewElement = findMappedViewAncestor(node, mapper);
                    const modelElement = mapper.toModelElement(viewElement);
                    if (this._typingQueue.isElementAffected(modelElement)) {
                        this._typingQueue.flush('mutations');
                        return;
                    }
                }
            }
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
        // @if CK_DEBUG_TYPING // 		'%cMutations not related to the composition.',
        // @if CK_DEBUG_TYPING // 		'font-style: italic'
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        });
        // Make sure that all changes are applied to the model before the end of composition.
        this.listenTo(view.document, 'compositionend', ()=>{
            this._typingQueue.flush('before composition end');
        }, {
            priority: 'high'
        });
        // Trigger mutations check after the composition completes to fix all DOM changes that got ignored during composition.
        // On Android, the Renderer is not disabled while composing. While updating DOM nodes, we ignore some changes
        // that are not that important (like NBSP vs. plain space character) and could break the composition flow.
        // After composition is completed, we trigger additional `mutations` event for elements affected by the composition
        // so the Renderer can adjust the DOM to the expected structure without breaking the composition.
        this.listenTo(view.document, 'compositionend', ()=>{
            // There could be new item queued on the composition end, so flush it.
            this._typingQueue.flush('after composition end');
            const mutations = [];
            if (this._typingQueue.hasAffectedElements()) {
                for (const element of this._typingQueue.flushAffectedElements()){
                    const viewElement = mapper.toViewElement(element);
                    if (!viewElement) {
                        continue;
                    }
                    mutations.push({
                        type: 'children',
                        node: viewElement
                    });
                }
            }
            // Fire composition mutations, if any.
            //
            // For non-Android:
            // After the composition end, we need to verify if there are no left-overs.
            // Listening at the lowest priority, so after the `InsertTextObserver` added above (all composed text
            // should already be applied to the model, view, and DOM).
            // On non-Android the `Renderer` is blocked while the user is composing, but the `MutationObserver` still collects
            // mutated nodes and fires `mutations` events.
            // Those events are recorded by the `Renderer` but not applied to the DOM while composing.
            // We need to trigger those checks (and fixes) once again but this time without specifying the exact mutations
            // since they are already recorded by the `Renderer`.
            // It in most cases just clears the internal record of mutated text nodes
            // since all changes should already be applied to the DOM.
            // This is especially needed when a user cancels composition, so we can clear nodes marked to sync.
            if (mutations.length || !env.isAndroid) {
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		'%cFire post-composition mutation fixes.',
                // @if CK_DEBUG_TYPING // 		'font-weight: bold'
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                view.document.fire('mutations', {
                    mutations
                });
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.groupEnd();
            // @if CK_DEBUG_TYPING // }
            }
        }, {
            priority: 'lowest'
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._typingQueue.destroy();
    }
}
/**
 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
 */ class TypingQueue {
    /**
	 * The editor instance.
	 */ editor;
    /**
	 * Debounced queue flush as a safety mechanism for cases of mutation observer not triggering.
	 */ flushDebounced = debounce(()=>this.flush('timeout'), 50);
    /**
	 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
	 */ _queue = [];
    /**
	 * Whether there is any composition enqueued or plain typing only.
	 */ _isComposing = false;
    /**
	 * A set of model elements. The typing happened in those elements. It's used for mutations check.
	 */ _affectedElements = new Set();
    /**
	 * @inheritDoc
	 */ constructor(editor){
        this.editor = editor;
    }
    /**
	 * Destroys the helper object.
	 */ destroy() {
        this.flushDebounced.cancel();
        this._affectedElements.clear();
        while(this._queue.length){
            this.shift();
        }
    }
    /**
	 * Returns the size of the queue.
	 */ get length() {
        return this._queue.length;
    }
    /**
	 * Push next insertText command data to the queue.
	 */ push(commandData, isComposing) {
        const commandLiveData = {
            text: commandData.text
        };
        if (commandData.selection) {
            commandLiveData.selectionRanges = [];
            for (const range of commandData.selection.getRanges()){
                commandLiveData.selectionRanges.push(ModelLiveRange.fromRange(range));
                // Keep reference to the model element for later mutation checks.
                this._affectedElements.add(range.start.parent);
            }
        }
        this._queue.push(commandLiveData);
        this._isComposing ||= isComposing;
        this.flushDebounced();
    }
    /**
	 * Shift the first item from the insertText command data queue.
	 */ shift() {
        const commandLiveData = this._queue.shift();
        const commandData = {
            text: commandLiveData.text
        };
        if (commandLiveData.selectionRanges) {
            const ranges = commandLiveData.selectionRanges.map((liveRange)=>detachLiveRange(liveRange)).filter((range)=>!!range);
            if (ranges.length) {
                commandData.selection = this.editor.model.createSelection(ranges);
            }
        }
        return commandData;
    }
    /**
	 * Applies all queued insertText command executions.
	 *
	 * @param reason Used only for debugging.
	 */ flush(reason) {
        const editor = this.editor;
        const model = editor.model;
        const view = editor.editing.view;
        this.flushDebounced.cancel();
        if (!this._queue.length) {
            return;
        }
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Input',
        // @if CK_DEBUG_TYPING // 		`%cFlush insertText queue on ${ reason }.`,
        // @if CK_DEBUG_TYPING // 		'font-weight: bold'
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        const insertTextCommand = editor.commands.get('insertText');
        const buffer = insertTextCommand.buffer;
        model.enqueueChange(buffer.batch, ()=>{
            buffer.lock();
            while(this._queue.length){
                const commandData = this.shift();
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		`%cExecute queued insertText:%c "${ commandData.text }"%c ` +
                // @if CK_DEBUG_TYPING // 			`[${ commandData.selection.getFirstPosition().path }]-` +
                // @if CK_DEBUG_TYPING // 			`[${ commandData.selection.getLastPosition().path }]`,
                // @if CK_DEBUG_TYPING // 		'font-weight: bold',
                // @if CK_DEBUG_TYPING // 		'color: blue',
                // @if CK_DEBUG_TYPING // 		''
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                editor.execute('insertText', commandData);
            }
            buffer.unlock();
            if (!this._isComposing) {
                // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
                // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Input',
                // @if CK_DEBUG_TYPING // 		'Clear affected elements set'
                // @if CK_DEBUG_TYPING // 	) );
                // @if CK_DEBUG_TYPING // }
                this._affectedElements.clear();
            }
            this._isComposing = false;
        });
        view.scrollToTheSelection();
    // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
    // @if CK_DEBUG_TYPING // 	console.groupEnd();
    // @if CK_DEBUG_TYPING // }
    }
    /**
	 * Returns `true` if the given model element is related to recent typing.
	 */ isElementAffected(element) {
        return this._affectedElements.has(element);
    }
    /**
	 * Returns `true` if there are any affected elements in the queue.
	 */ hasAffectedElements() {
        return this._affectedElements.size > 0;
    }
    /**
	 * Returns an array of typing-related elements and clears the internal list.
	 */ flushAffectedElements() {
        const result = Array.from(this._affectedElements);
        this._affectedElements.clear();
        return result;
    }
}
/**
 * Deletes the content selected by the document selection at the start of composition.
 */ function deleteSelectionContent(model, insertTextCommand) {
    // By relying on the state of the input command we allow disabling the entire input easily
    // by just disabling the input command. We could’ve used here the delete command but that
    // would mean requiring the delete feature which would block loading one without the other.
    // We could also check the editor.isReadOnly property, but that wouldn't allow to block
    // the input without blocking other features.
    if (!insertTextCommand.isEnabled) {
        return;
    }
    const buffer = insertTextCommand.buffer;
    buffer.lock();
    model.enqueueChange(buffer.batch, ()=>{
        model.deleteContent(model.document.selection);
    });
    buffer.unlock();
}
/**
 * Detaches a ModelLiveRange and returns the static range from it.
 */ function detachLiveRange(liveRange) {
    const range = liveRange.toRange();
    liveRange.detach();
    if (range.root.rootName == '$graveyard') {
        return null;
    }
    return range;
}
/**
 * For the given `viewNode`, finds and returns the closest ancestor of this node that has a mapping to the model.
 */ function findMappedViewAncestor(viewNode, mapper) {
    let node = viewNode.is('$text') ? viewNode.parent : viewNode;
    while(!mapper.toModelElement(node)){
        node = node.parent;
    }
    return node;
}

// @if CK_DEBUG_TYPING // const { _buildLogMessage } = require( '@ckeditor/ckeditor5-engine/src/dev-utils/utils.js' );
/**
 * The delete command. Used by the {@link module:typing/delete~Delete delete feature} to handle the <kbd>Delete</kbd> and
 * <kbd>Backspace</kbd> keys.
 */ class DeleteCommand extends Command {
    /**
	 * The directionality of the delete describing in what direction it should
	 * consume the content when the selection is collapsed.
	 */ direction;
    /**
	 * Delete's change buffer used to group subsequent changes into batches.
	 */ _buffer;
    /**
	 * Creates an instance of the command.
	 *
	 * @param direction The directionality of the delete describing in what direction it
	 * should consume the content when the selection is collapsed.
	 */ constructor(editor, direction){
        super(editor);
        this.direction = direction;
        this._buffer = new TypingChangeBuffer(editor.model, editor.config.get('typing.undoStep'));
        // Since this command may execute on different selectable than selection, it should be checked directly in execute block.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * The current change buffer.
	 */ get buffer() {
        return this._buffer;
    }
    /**
	 * Executes the delete command. Depending on whether the selection is collapsed or not, deletes its content
	 * or a piece of content in the {@link #direction defined direction}.
	 *
	 * @fires execute
	 * @param options The command options.
	 * @param options.unit See {@link module:engine/model/utils/modifyselection~modifySelection}'s options.
	 * @param options.sequence A number describing which subsequent delete event it is without the key being released.
	 * See the {@link module:engine/view/document~ViewDocument#event:delete} event data.
	 * @param options.selection Selection to remove. If not set, current model selection will be used.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const doc = model.document;
        model.enqueueChange(this._buffer.batch, (writer)=>{
            this._buffer.lock();
            const selection = writer.createSelection(options.selection || doc.selection);
            // Don't execute command when selection is in non-editable place.
            if (!model.canEditAt(selection)) {
                return;
            }
            const sequence = options.sequence || 1;
            // Do not replace the whole selected content if selection was collapsed.
            // This prevents such situation:
            //
            // <h1></h1><p>[]</p>	-->  <h1>[</h1><p>]</p> 		-->  <p></p>
            // starting content		-->   after `modifySelection`	-->  after `deleteContent`.
            const doNotResetEntireContent = selection.isCollapsed;
            // Try to extend the selection in the specified direction.
            if (selection.isCollapsed) {
                model.modifySelection(selection, {
                    direction: this.direction,
                    unit: options.unit,
                    treatEmojiAsSingleUnit: true
                });
            }
            // Check if deleting in an empty editor. See #61.
            if (this._shouldEntireContentBeReplacedWithParagraph(sequence)) {
                this._replaceEntireContentWithParagraph(writer);
                return;
            }
            // Check if deleting in the first empty block.
            // See https://github.com/ckeditor/ckeditor5/issues/8137.
            if (this._shouldReplaceFirstBlockWithParagraph(selection, sequence)) {
                this.editor.execute('paragraph', {
                    selection
                });
                return;
            }
            // If selection is still collapsed, then there's nothing to delete.
            if (selection.isCollapsed) {
                return;
            }
            let changeCount = 0;
            selection.getFirstRange().getMinimalFlatRanges().forEach((range)=>{
                changeCount += count(range.getWalker({
                    singleCharacters: true,
                    ignoreElementEnd: true,
                    shallow: true
                }));
            });
            // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
            // @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'DeleteCommand',
            // @if CK_DEBUG_TYPING // 		'Delete content',
            // @if CK_DEBUG_TYPING // 		`[${ selection.getFirstPosition()!.path }]-[${ selection.getLastPosition()!.path }]`,
            // @if CK_DEBUG_TYPING // 		options
            // @if CK_DEBUG_TYPING // 	) );
            // @if CK_DEBUG_TYPING // }
            model.deleteContent(selection, {
                doNotResetEntireContent,
                direction: this.direction
            });
            this._buffer.input(changeCount);
            writer.setSelection(selection);
            this._buffer.unlock();
        });
    }
    /**
	 * If the user keeps <kbd>Backspace</kbd> or <kbd>Delete</kbd> key pressed, the content of the current
	 * editable will be cleared. However, this will not yet lead to resetting the remaining block to a paragraph
	 * (which happens e.g. when the user does <kbd>Ctrl</kbd> + <kbd>A</kbd>, <kbd>Backspace</kbd>).
	 *
	 * But, if the user pressed the key in an empty editable for the first time,
	 * we want to replace the entire content with a paragraph if:
	 *
	 * * the current limit element is empty,
	 * * the paragraph is allowed in the limit element,
	 * * the limit doesn't already have a paragraph inside.
	 *
	 * See https://github.com/ckeditor/ckeditor5-typing/issues/61.
	 *
	 * @param sequence A number describing which subsequent delete event it is without the key being released.
	 */ _shouldEntireContentBeReplacedWithParagraph(sequence) {
        // Does nothing if user pressed and held the "Backspace" or "Delete" key.
        if (sequence > 1) {
            return false;
        }
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const limitElement = model.schema.getLimitElement(selection);
        // If a collapsed selection contains the whole content it means that the content is empty
        // (from the user perspective).
        const limitElementIsEmpty = selection.isCollapsed && selection.containsEntireContent(limitElement);
        if (!limitElementIsEmpty) {
            return false;
        }
        if (!model.schema.checkChild(limitElement, 'paragraph')) {
            return false;
        }
        const limitElementFirstChild = limitElement.getChild(0);
        // Does nothing if the limit element already contains only a paragraph.
        // We ignore the case when paragraph might have some inline elements (<p><inlineWidget>[]</inlineWidget></p>)
        // because we don't support such cases yet and it's unclear whether inlineWidget shouldn't be a limit itself.
        if (limitElementFirstChild && limitElementFirstChild.is('element', 'paragraph')) {
            return false;
        }
        return true;
    }
    /**
	 * The entire content is replaced with the paragraph. Selection is moved inside the paragraph.
	 *
	 * @param writer The model writer.
	 */ _replaceEntireContentWithParagraph(writer) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const limitElement = model.schema.getLimitElement(selection);
        const paragraph = writer.createElement('paragraph');
        writer.remove(writer.createRangeIn(limitElement));
        writer.insert(paragraph, limitElement);
        writer.setSelection(paragraph, 0);
    }
    /**
	 * Checks if the selection is inside an empty element that is the first child of the limit element
	 * and should be replaced with a paragraph.
	 *
	 * @param selection The selection.
	 * @param sequence A number describing which subsequent delete event it is without the key being released.
	 */ _shouldReplaceFirstBlockWithParagraph(selection, sequence) {
        const model = this.editor.model;
        // Does nothing if user pressed and held the "Backspace" key or it was a "Delete" button.
        if (sequence > 1 || this.direction != 'backward') {
            return false;
        }
        if (!selection.isCollapsed) {
            return false;
        }
        const position = selection.getFirstPosition();
        const limitElement = model.schema.getLimitElement(position);
        const limitElementFirstChild = limitElement.getChild(0);
        // Only elements that are direct children of the limit element can be replaced.
        // Unwrapping from a block quote should be handled in a dedicated feature.
        if (position.parent != limitElementFirstChild) {
            return false;
        }
        // A block should be replaced only if it was empty.
        if (!selection.containsEntireContent(limitElementFirstChild)) {
            return false;
        }
        // Replace with a paragraph only if it's allowed there.
        if (!model.schema.checkChild(limitElement, 'paragraph')) {
            return false;
        }
        // Does nothing if the limit element already contains only a paragraph.
        if (limitElementFirstChild.name == 'paragraph') {
            return false;
        }
        return true;
    }
}

const DELETE_CHARACTER = 'character';
const DELETE_WORD = 'word';
const DELETE_CODE_POINT = 'codePoint';
const DELETE_SELECTION = 'selection';
const DELETE_BACKWARD = 'backward';
const DELETE_FORWARD = 'forward';
const DELETE_EVENT_TYPES = {
    // --------------------------------------- Backward delete types -----------------------------------------------------
    // This happens in Safari on Mac when some content is selected and Ctrl + K is pressed.
    deleteContent: {
        unit: DELETE_SELECTION,
        // According to the Input Events Level 2 spec, this delete type has no direction
        // but to keep things simple, let's default to backward.
        direction: DELETE_BACKWARD
    },
    // Chrome and Safari on Mac: Backspace or Ctrl + H
    deleteContentBackward: {
        // This kind of deletions must be done on the code point-level instead of target range provided by the DOM beforeinput event.
        // Take for instance "👨‍👩‍👧‍👧", it equals:
        //
        //	* [ "👨", "ZERO WIDTH JOINER", "👩", "ZERO WIDTH JOINER", "👧", "ZERO WIDTH JOINER", "👧" ]
        //	* or simply "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F467}"
        //
        // The range provided by the browser would cause the entire multi-byte grapheme to disappear while the user
        // intention when deleting backwards ("👨‍👩‍👧‍👧[]", then backspace) is gradual "decomposition" (first to "👨‍👩‍👧‍[]",
        // then to "👨‍👩‍[]", etc.).
        //
        //	* "👨‍👩‍👧‍👧[]" + backward delete (by code point)  -> results in "👨‍👩‍👧[]", removed the last "👧" 👍
        //	* "👨‍👩‍👧‍👧[]" + backward delete (by character)  -> results in "[]", removed the whole grapheme 👎
        //
        // Deleting by code-point is simply a better UX. See "deleteContentForward" to learn more.
        unit: DELETE_CODE_POINT,
        direction: DELETE_BACKWARD
    },
    // On Mac: Option + Backspace.
    // On iOS: Hold the backspace for a while and the whole words will start to disappear.
    deleteWordBackward: {
        unit: DELETE_WORD,
        direction: DELETE_BACKWARD
    },
    // Safari on Mac: Cmd + Backspace
    deleteHardLineBackward: {
        unit: DELETE_SELECTION,
        direction: DELETE_BACKWARD
    },
    // Chrome on Mac: Cmd + Backspace.
    deleteSoftLineBackward: {
        unit: DELETE_SELECTION,
        direction: DELETE_BACKWARD
    },
    // --------------------------------------- Forward delete types -----------------------------------------------------
    // Chrome on Mac: Fn + Backspace or Ctrl + D
    // Safari on Mac: Ctrl + K or Ctrl + D
    deleteContentForward: {
        // Unlike backward delete, this delete must be performed by character instead of by code point, which
        // provides the best UX for working with accented letters.
        // Take, for example "b̂" ("\u0062\u0302", or [ "LATIN SMALL LETTER B", "COMBINING CIRCUMFLEX ACCENT" ]):
        //
        //	* "b̂[]" + backward delete (by code point)  -> results in "b[]", removed the combining mark 👍
        //	* "[]b̂" + forward delete (by code point)   -> results in "[]^", a bare combining mark does that not make sense when alone 👎
        //	* "[]b̂" + forward delete (by character)    -> results in "[]", removed both "b" and the combining mark 👍
        //
        // See: "deleteContentBackward" to learn more.
        unit: DELETE_CHARACTER,
        direction: DELETE_FORWARD
    },
    // On Mac: Fn + Option + Backspace.
    deleteWordForward: {
        unit: DELETE_WORD,
        direction: DELETE_FORWARD
    },
    // Chrome on Mac: Ctrl + K (you have to disable the Link plugin first, though, because it uses the same keystroke)
    // This is weird that it does not work in Safari on Mac despite being listed in the official shortcuts listing
    // on Apple's webpage.
    deleteHardLineForward: {
        unit: DELETE_SELECTION,
        direction: DELETE_FORWARD
    },
    // At this moment there is no known way to trigger this event type but let's keep it for the symmetry with
    // deleteSoftLineBackward.
    deleteSoftLineForward: {
        unit: DELETE_SELECTION,
        direction: DELETE_FORWARD
    }
};
/**
 * Delete observer introduces the {@link module:engine/view/document~ViewDocument#event:delete} event.
 *
 * @internal
 */ class DeleteObserver extends Observer {
    /**
	 * @inheritDoc
	 */ constructor(view){
        super(view);
        const document = view.document;
        // It matters how many subsequent deletions were made, e.g. when the backspace key was pressed and held
        // by the user for some time. For instance, if such scenario ocurred and the heading the selection was
        // anchored to was the only content of the editor, it will not be converted into a paragraph (the user
        // wanted to clean it up, not remove it, it's about UX). Check out the DeleteCommand implementation to learn more.
        //
        // Fun fact: Safari on Mac won't fire beforeinput for backspace in an empty heading (only content).
        let sequence = 0;
        document.on('keydown', ()=>{
            sequence++;
        });
        document.on('keyup', ()=>{
            sequence = 0;
        });
        document.on('beforeinput', (evt, data)=>{
            if (!this.isEnabled) {
                return;
            }
            const { targetRanges, domEvent, inputType } = data;
            const deleteEventSpec = DELETE_EVENT_TYPES[inputType];
            if (!deleteEventSpec) {
                return;
            }
            const deleteData = {
                direction: deleteEventSpec.direction,
                unit: deleteEventSpec.unit,
                sequence
            };
            if (deleteData.unit == DELETE_SELECTION) {
                deleteData.selectionToRemove = view.createSelection(targetRanges[0]);
            }
            // The default deletion unit for deleteContentBackward is a single code point
            // but if the browser provides a wider target range then we should use it.
            if (inputType === 'deleteContentBackward') {
                // On Android, deleteContentBackward has sequence 1 by default.
                if (env.isAndroid) {
                    deleteData.sequence = 1;
                }
                // The beforeInput event wants more than a single character to be removed.
                if (shouldUseTargetRanges(targetRanges)) {
                    deleteData.unit = DELETE_SELECTION;
                    deleteData.selectionToRemove = view.createSelection(targetRanges);
                }
            }
            const eventInfo = new BubblingEventInfo(document, 'delete', targetRanges[0]);
            document.fire(eventInfo, new ViewDocumentDomEventData(view, domEvent, deleteData));
            // Stop the beforeinput event if `delete` event was stopped.
            // https://github.com/ckeditor/ckeditor5/issues/753
            if (eventInfo.stop.called) {
                evt.stop();
            }
        });
        // TODO: to be removed when https://bugs.chromium.org/p/chromium/issues/detail?id=1365311 is solved.
        if (env.isBlink) {
            enableChromeWorkaround(this);
        }
    }
    /**
	 * @inheritDoc
	 */ observe() {}
    /**
	 * @inheritDoc
	 */ stopObserving() {}
}
/**
 * Enables workaround for the issue https://github.com/ckeditor/ckeditor5/issues/11904.
 */ function enableChromeWorkaround(observer) {
    const view = observer.view;
    const document = view.document;
    let pressedKeyCode = null;
    let beforeInputReceived = false;
    document.on('keydown', (evt, { keyCode })=>{
        pressedKeyCode = keyCode;
        beforeInputReceived = false;
    });
    document.on('keyup', (evt, { keyCode, domEvent })=>{
        const selection = document.selection;
        const shouldFireDeleteEvent = observer.isEnabled && keyCode == pressedKeyCode && isDeleteKeyCode(keyCode) && !selection.isCollapsed && !beforeInputReceived;
        pressedKeyCode = null;
        if (shouldFireDeleteEvent) {
            const targetRange = selection.getFirstRange();
            const eventInfo = new BubblingEventInfo(document, 'delete', targetRange);
            const deleteData = {
                unit: DELETE_SELECTION,
                direction: getDeleteDirection(keyCode),
                selectionToRemove: selection
            };
            document.fire(eventInfo, new ViewDocumentDomEventData(view, domEvent, deleteData));
        }
    });
    document.on('beforeinput', (evt, { inputType })=>{
        const deleteEventSpec = DELETE_EVENT_TYPES[inputType];
        const isMatchingBeforeInput = isDeleteKeyCode(pressedKeyCode) && deleteEventSpec && deleteEventSpec.direction == getDeleteDirection(pressedKeyCode);
        if (isMatchingBeforeInput) {
            beforeInputReceived = true;
        }
    }, {
        priority: 'high'
    });
    document.on('beforeinput', (evt, { inputType, data })=>{
        const shouldIgnoreBeforeInput = pressedKeyCode == keyCodes.delete && inputType == 'insertText' && data == '\x7f'; // Delete character :P
        if (shouldIgnoreBeforeInput) {
            evt.stop();
        }
    }, {
        priority: 'high'
    });
    function isDeleteKeyCode(keyCode) {
        return keyCode == keyCodes.backspace || keyCode == keyCodes.delete;
    }
    function getDeleteDirection(keyCode) {
        return keyCode == keyCodes.backspace ? DELETE_BACKWARD : DELETE_FORWARD;
    }
}
/**
 * Verifies whether the given target ranges cover more than a single character and should be used instead of a single code-point deletion.
 */ function shouldUseTargetRanges(targetRanges) {
    // The collapsed target range could happen for example while deleting inside an inline filler
    // (it's mapped to collapsed position before an inline filler).
    if (targetRanges.length != 1 || targetRanges[0].isCollapsed) {
        return false;
    }
    const walker = targetRanges[0].getWalker({
        direction: 'backward',
        singleCharacters: true,
        ignoreElementEnd: true
    });
    let count = 0;
    for (const { nextPosition, item } of walker){
        if (nextPosition.parent.is('$text')) {
            const data = nextPosition.parent.data;
            const offset = nextPosition.offset;
            // Count combined symbols and emoji sequences as a single character.
            if (isInsideSurrogatePair(data, offset) || isInsideCombinedSymbol(data, offset) || isInsideEmojiSequence(data, offset)) {
                continue;
            }
            count++;
        } else if (item.is('containerElement') || item.is('emptyElement')) {
            count++;
        }
        if (count > 1) {
            return true;
        }
    }
    return false;
}

/**
 * The delete and backspace feature. Handles keys such as <kbd>Delete</kbd> and <kbd>Backspace</kbd>, other
 * keystrokes and user actions that result in deleting content in the editor.
 */ class Delete extends Plugin {
    /**
	 * Whether pressing backspace should trigger undo action
	 */ _undoOnBackspace;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Delete';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const modelDocument = editor.model.document;
        view.addObserver(DeleteObserver);
        this._undoOnBackspace = false;
        const deleteForwardCommand = new DeleteCommand(editor, 'forward');
        // Register `deleteForward` command and add `forwardDelete` command as an alias for backward compatibility.
        editor.commands.add('deleteForward', deleteForwardCommand);
        editor.commands.add('forwardDelete', deleteForwardCommand);
        editor.commands.add('delete', new DeleteCommand(editor, 'backward'));
        this.listenTo(viewDocument, 'delete', (evt, data)=>{
            // When not in composition, we handle the action, so prevent the default one.
            // When in composition, it's the browser who modify the DOM (renderer is disabled).
            if (!viewDocument.isComposing) {
                data.preventDefault();
            }
            const { direction, sequence, selectionToRemove, unit } = data;
            const commandName = direction === 'forward' ? 'deleteForward' : 'delete';
            const commandData = {
                sequence
            };
            if (unit == 'selection') {
                const modelRanges = Array.from(selectionToRemove.getRanges()).map((viewRange)=>editor.editing.mapper.toModelRange(viewRange)).map((modelRange)=>_tryFixingModelRange(modelRange, editor.model.schema) || modelRange);
                commandData.selection = editor.model.createSelection(modelRanges);
            } else {
                commandData.unit = unit;
            }
            editor.execute(commandName, commandData);
            view.scrollToTheSelection();
        }, {
            priority: 'low'
        });
        // Handle the Backspace key while at the beginning of a nested editable. See https://github.com/ckeditor/ckeditor5/issues/17383.
        this.listenTo(viewDocument, 'keydown', (evt, data)=>{
            if (viewDocument.isComposing || data.keyCode != keyCodes.backspace || !modelDocument.selection.isCollapsed) {
                return;
            }
            const ancestorLimit = editor.model.schema.getLimitElement(modelDocument.selection);
            const limitStartPosition = editor.model.createPositionAt(ancestorLimit, 0);
            if (limitStartPosition.isTouching(modelDocument.selection.getFirstPosition())) {
                // Stop the beforeinput event as it could be invalid.
                data.preventDefault();
                // Create a fake delete event so all features can act on it and the target range is proper.
                const modelRange = editor.model.schema.getNearestSelectionRange(limitStartPosition, 'forward');
                if (!modelRange) {
                    return;
                }
                const viewSelection = view.createSelection(editor.editing.mapper.toViewRange(modelRange));
                const targetRange = viewSelection.getFirstRange();
                const eventInfo = new BubblingEventInfo(document, 'delete', targetRange);
                const deleteData = {
                    unit: 'selection',
                    direction: 'backward',
                    selectionToRemove: viewSelection
                };
                viewDocument.fire(eventInfo, new ViewDocumentDomEventData(view, data.domEvent, deleteData));
            }
        });
        if (this.editor.plugins.has('UndoEditing')) {
            this.listenTo(viewDocument, 'delete', (evt, data)=>{
                if (this._undoOnBackspace && data.direction == 'backward' && data.sequence == 1 && data.unit == 'codePoint') {
                    this._undoOnBackspace = false;
                    editor.execute('undo');
                    data.preventDefault();
                    evt.stop();
                }
            }, {
                context: '$capture'
            });
            this.listenTo(modelDocument, 'change', ()=>{
                this._undoOnBackspace = false;
            });
        }
    }
    /**
	 * If the next user action after calling this method is pressing backspace, it would undo the last change.
	 *
	 * Requires {@link module:undo/undoediting~UndoEditing} plugin. If not loaded, does nothing.
	 */ requestUndoOnBackspace() {
        if (this.editor.plugins.has('UndoEditing')) {
            this._undoOnBackspace = true;
        }
    }
}

/**
 * The typing feature. It handles typing.
 *
 * This is a "glue" plugin which loads the {@link module:typing/input~Input} and {@link module:typing/delete~Delete}
 * plugins.
 */ class Typing extends Plugin {
    static get requires() {
        return [
            Input,
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Typing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module typing/utils/getlasttextline
 */ /**
 * Returns the last text line from the given range.
 *
 * "The last text line" is understood as text (from one or more text nodes) which is limited either by a parent block
 * or by inline elements (e.g. `<softBreak>`).
 *
 * ```ts
 * const rangeToCheck = model.createRange(
 * 	model.createPositionAt( paragraph, 0 ),
 * 	model.createPositionAt( paragraph, 'end' )
 * );
 *
 * const { text, range } = getLastTextLine( rangeToCheck, model );
 * ```
 *
 * For model below, the returned `text` will be "Foo bar baz" and `range` will be set on whole `<paragraph>` content:
 *
 * ```xml
 * <paragraph>Foo bar baz<paragraph>
 * ```
 *
 * However, in below case, `text` will be set to "baz" and `range` will be set only on "baz".
 *
 * ```xml
 * <paragraph>Foo<softBreak></softBreak>bar<softBreak></softBreak>baz<paragraph>
 * ```
 */ function getLastTextLine(range, model) {
    let start = range.start;
    const text = Array.from(range.getWalker({
        ignoreElementEnd: false
    })).reduce((rangeText, { item })=>{
        // Trim text to a last occurrence of an inline element and update range start.
        if (!(item.is('$text') || item.is('$textProxy'))) {
            start = model.createPositionAfter(item);
            return '';
        }
        return rangeText + item.data;
    }, '');
    return {
        text,
        range: model.createRange(start, range.end)
    };
}

/**
 * The text watcher feature.
 *
 * Fires the {@link module:typing/textwatcher~TextWatcher#event:matched:data `matched:data`},
 * {@link module:typing/textwatcher~TextWatcher#event:matched:selection `matched:selection`} and
 * {@link module:typing/textwatcher~TextWatcher#event:unmatched `unmatched`} events on typing or selection changes.
 */ class TextWatcher extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * The editor's model.
	 */ model;
    /**
	 * The function used to match the text.
	 *
	 * The test callback can return 3 values:
	 *
	 * * `false` if there is no match,
	 * * `true` if there is a match,
	 * * an object if there is a match and we want to pass some additional information to the {@link #event:matched:data} event.
	 */ testCallback;
    /**
	 * Whether there is a match currently.
	 */ _hasMatch;
    /**
	 * Creates a text watcher instance.
	 *
	 * @param testCallback See {@link module:typing/textwatcher~TextWatcher#testCallback}.
	 */ constructor(model, testCallback){
        super();
        this.model = model;
        this.testCallback = testCallback;
        this._hasMatch = false;
        this.set('isEnabled', true);
        // Toggle text watching on isEnabled state change.
        this.on('change:isEnabled', ()=>{
            if (this.isEnabled) {
                this._startListening();
            } else {
                this.stopListening(model.document.selection);
                this.stopListening(model.document);
            }
        });
        this._startListening();
    }
    /**
	 * Flag indicating whether there is a match currently.
	 */ get hasMatch() {
        return this._hasMatch;
    }
    /**
	 * Starts listening to the editor for typing and selection events.
	 */ _startListening() {
        const model = this.model;
        const document = model.document;
        this.listenTo(document.selection, 'change:range', (evt, { directChange })=>{
            // Indirect changes (i.e. when the user types or external changes are applied) are handled in the document's change event.
            if (!directChange) {
                return;
            }
            // Act only on collapsed selection.
            if (!document.selection.isCollapsed) {
                if (this.hasMatch) {
                    this.fire('unmatched');
                    this._hasMatch = false;
                }
                return;
            }
            this._evaluateTextBeforeSelection('selection');
        });
        this.listenTo(document, 'change:data', (evt, batch)=>{
            if (batch.isUndo || !batch.isLocal) {
                return;
            }
            this._evaluateTextBeforeSelection('data', {
                batch
            });
        });
    }
    /**
	 * Checks the editor content for matched text.
	 *
	 * @fires matched:data
	 * @fires matched:selection
	 * @fires unmatched
	 *
	 * @param suffix A suffix used for generating the event name.
	 * @param data Data object for event.
	 */ _evaluateTextBeforeSelection(suffix, data = {}) {
        const model = this.model;
        const document = model.document;
        const selection = document.selection;
        const rangeBeforeSelection = model.createRange(model.createPositionAt(selection.focus.parent, 0), selection.focus);
        const { text, range } = getLastTextLine(rangeBeforeSelection, model);
        const testResult = this.testCallback(text);
        if (!testResult && this.hasMatch) {
            this.fire('unmatched');
        }
        this._hasMatch = !!testResult;
        if (testResult) {
            const eventData = Object.assign(data, {
                text,
                range
            });
            // If the test callback returns an object with additional data, assign the data as well.
            if (typeof testResult == 'object') {
                Object.assign(eventData, testResult);
            }
            this.fire(`matched:${suffix}`, eventData);
        }
    }
}

/**
 * This plugin enables the two-step caret (phantom) movement behavior for
 * {@link module:typing/twostepcaretmovement~TwoStepCaretMovement#registerAttribute registered attributes}
 * on arrow right (<kbd>→</kbd>) and left (<kbd>←</kbd>) key press.
 *
 * Thanks to this (phantom) caret movement the user is able to type before/after as well as at the
 * beginning/end of an attribute.
 *
 * **Note:** This plugin support right–to–left (Arabic, Hebrew, etc.) content by mirroring its behavior
 * but for the sake of simplicity examples showcase only left–to–right use–cases.
 *
 * # Forward movement
 *
 * ## "Entering" an attribute:
 *
 * When this plugin is enabled and registered for the `a` attribute and the selection is right before it
 * (at the attribute boundary), pressing the right arrow key will not move the selection but update its
 * attributes accordingly:
 *
 * * When enabled:
 *
 * ```xml
 * foo{}<$text a="true">bar</$text>
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * foo<$text a="true">{}bar</$text>
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * foo{}<$text a="true">bar</$text>
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * foo<$text a="true">b{}ar</$text>
 * ```
 *
 *
 * ## "Leaving" an attribute:
 *
 * * When enabled:
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * <$text a="true">bar</$text>b{}az
 * ```
 *
 * # Backward movement
 *
 * * When enabled:
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">ba{}r</$text>b{}az
 * ```
 *
 * # Multiple attributes
 *
 * * When enabled and many attributes starts or ends at the same position:
 *
 * ```xml
 * <$text a="true" b="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true" b="true">bar{}</$text>baz
 * ```
 *
 * * When enabled and one procedes another:
 *
 * ```xml
 * <$text a="true">bar</$text><$text b="true">{}bar</$text>
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">bar{}</$text><$text b="true">bar</$text>
 * ```
 *
 */ class TwoStepCaretMovement extends Plugin {
    /**
	 * A set of attributes to handle.
	 */ attributes;
    /**
	 * The current UID of the overridden gravity, as returned by
	 * {@link module:engine/model/writer~ModelWriter#overrideSelectionGravity}.
	 */ _overrideUid;
    /**
	 * A flag indicating that the automatic gravity restoration should not happen upon the next
	 * gravity restoration.
	 * {@link module:engine/model/selection~ModelSelection#event:change:range} event.
	 */ _isNextGravityRestorationSkipped = false;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TwoStepCaretMovement';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this.attributes = new Set();
        this._overrideUid = null;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const view = editor.editing.view;
        const locale = editor.locale;
        const modelSelection = model.document.selection;
        // Listen to keyboard events and handle the caret movement according to the 2-step caret logic.
        this.listenTo(view.document, 'arrowKey', (evt, data)=>{
            // This implementation works only for collapsed selection.
            if (!modelSelection.isCollapsed) {
                return;
            }
            // When user tries to expand the selection or jump over the whole word or to the beginning/end then
            // two-steps movement is not necessary.
            if (data.shiftKey || data.altKey || data.ctrlKey) {
                return;
            }
            const arrowRightPressed = data.keyCode == keyCodes.arrowright;
            const arrowLeftPressed = data.keyCode == keyCodes.arrowleft;
            // When neither left or right arrow has been pressed then do noting.
            if (!arrowRightPressed && !arrowLeftPressed) {
                return;
            }
            const contentDirection = locale.contentLanguageDirection;
            let isMovementHandled = false;
            if (contentDirection === 'ltr' && arrowRightPressed || contentDirection === 'rtl' && arrowLeftPressed) {
                isMovementHandled = this._handleForwardMovement(data);
            } else {
                isMovementHandled = this._handleBackwardMovement(data);
            }
            // Stop the keydown event if the two-step caret movement handled it. Avoid collisions
            // with other features which may also take over the caret movement (e.g. Widget).
            if (isMovementHandled === true) {
                evt.stop();
            }
        }, {
            context: '$text',
            priority: 'highest'
        });
        // The automatic gravity restoration logic.
        this.listenTo(modelSelection, 'change:range', (evt, data)=>{
            // Skipping the automatic restoration is needed if the selection should change
            // but the gravity must remain overridden afterwards. See the #handleBackwardMovement
            // to learn more.
            if (this._isNextGravityRestorationSkipped) {
                this._isNextGravityRestorationSkipped = false;
                return;
            }
            // Skip automatic restore when the gravity is not overridden — simply, there's nothing to restore
            // at this moment.
            if (!this._isGravityOverridden) {
                return;
            }
            // Skip automatic restore when the change is indirect AND the selection is at the attribute boundary.
            // It means that e.g. if the change was external (collaboration) and the user had their
            // selection around the link, its gravity should remain intact in this change:range event.
            if (!data.directChange && isBetweenDifferentAttributes(modelSelection.getFirstPosition(), this.attributes)) {
                return;
            }
            this._restoreGravity();
        });
        // Handle a click at the beginning/end of a two-step element.
        this._enableClickingAfterNode();
        // Change the attributes of the selection in certain situations after the two-step node was inserted into the document.
        this._enableInsertContentSelectionAttributesFixer();
        // Handle removing the content after the two-step node.
        this._handleDeleteContentAfterNode();
    }
    /**
	 * Registers a given attribute for the two-step caret movement.
	 *
	 * @param attribute Name of the attribute to handle.
	 */ registerAttribute(attribute) {
        this.attributes.add(attribute);
    }
    /**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **forwards**. Executed upon `keypress` in the {@link module:engine/view/view~EditingView}.
	 *
	 * @internal
	 * @param eventData Data of the key press.
	 * @returns `true` when the handler prevented caret movement.
	 */ _handleForwardMovement(eventData) {
        const attributes = this.attributes;
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = selection.getFirstPosition();
        // DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we just entered
        //
        // 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
        //
        // or left the attribute
        //
        // 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
        //
        // and the gravity will be restored automatically.
        if (this._isGravityOverridden) {
            return false;
        }
        // DON'T ENGAGE 2-SCM when the selection is at the beginning of the block AND already has the
        // attribute:
        // * when the selection was initially set there using the mouse,
        // * when the editor has just started
        //
        //		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
        //
        if (position.isAtStart && hasAnyAttribute(selection, attributes)) {
            return false;
        }
        // ENGAGE 2-SCM When at least one of the observed attributes changes its value (incl. starts, ends).
        //
        //		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
        //		<paragraph>foo<$text attribute>bar{}</$text><$text otherAttribute>baz</$text></paragraph>
        //		<paragraph>foo<$text attribute=1>bar{}</$text><$text attribute=2>baz</$text></paragraph>
        //		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
        //
        if (isBetweenDifferentAttributes(position, attributes)) {
            if (eventData) {
                preventCaretMovement(eventData);
            }
            // CLEAR 2-SCM attributes if we are at the end of one 2-SCM and before
            // the next one with a different value of the same attribute.
            //
            //		<paragraph>foo<$text attribute=1>bar{}</$text><$text attribute=2>bar</$text>baz</paragraph>
            //
            if (hasAnyAttribute(selection, attributes) && isBetweenDifferentAttributes(position, attributes, true)) {
                clearSelectionAttributes(model, attributes);
            } else {
                this._overrideGravity();
            }
            return true;
        }
        return false;
    }
    /**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **backwards**. Executed upon `keypress` in the {@link module:engine/view/view~EditingView}.
	 *
	 * @internal
	 * @param eventData Data of the key press.
	 * @returns `true` when the handler prevented caret movement
	 */ _handleBackwardMovement(eventData) {
        const attributes = this.attributes;
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = selection.getFirstPosition();
        // When the gravity is already overridden (by this plugin), it means we are on the two-step position.
        // Prevent the movement, restore the gravity and update selection attributes.
        //
        //		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>{}baz</$text></paragraph>
        //		<paragraph>foo<$text attribute>bar</$text><$text otherAttribute>{}baz</$text></paragraph>
        //		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
        //		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
        //
        if (this._isGravityOverridden) {
            if (eventData) {
                preventCaretMovement(eventData);
            }
            this._restoreGravity();
            // CLEAR 2-SCM attributes if we are at the end of one 2-SCM and before
            // the next one with a different value of the same attribute.
            //
            //		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>{}bar</$text>baz</paragraph>
            //
            if (isBetweenDifferentAttributes(position, attributes, true)) {
                clearSelectionAttributes(model, attributes);
            } else {
                setSelectionAttributesFromTheNodeBefore(model, attributes, position);
            }
            return true;
        } else {
            // REMOVE SELECTION ATTRIBUTE when restoring gravity towards a non-existent content at the
            // beginning of the block.
            //
            // 		<paragraph>{}<$text attribute>bar</$text></paragraph>
            //
            if (position.isAtStart) {
                if (hasAnyAttribute(selection, attributes)) {
                    if (eventData) {
                        preventCaretMovement(eventData);
                    }
                    setSelectionAttributesFromTheNodeBefore(model, attributes, position);
                    return true;
                }
                return false;
            }
            // SET 2-SCM attributes if we are between nodes with the same attribute but with different values.
            //
            //		<paragraph>foo<$text attribute=1>bar</$text>[]<$text attribute=2>bar</$text>baz</paragraph>
            //
            if (!hasAnyAttribute(selection, attributes) && isBetweenDifferentAttributes(position, attributes, true)) {
                if (eventData) {
                    preventCaretMovement(eventData);
                }
                setSelectionAttributesFromTheNodeBefore(model, attributes, position);
                return true;
            }
            // When we are moving from natural gravity, to the position of the 2SCM, we need to override the gravity,
            // and make sure it won't be restored. Unless it's at the end of the block and an observed attribute.
            // We need to check if the caret is a one position before the attribute boundary:
            //
            //		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>b{}az</$text></paragraph>
            //		<paragraph>foo<$text attribute>bar</$text><$text otherAttribute>b{}az</$text></paragraph>
            //		<paragraph>foo<$text attribute>b{}ar</$text>baz</paragraph>
            //		<paragraph>foo<$text attribute>bar</$text>b{}az</paragraph>
            //
            if (isStepAfterAnyAttributeBoundary(position, attributes)) {
                // ENGAGE 2-SCM if the selection has no attribute. This may happen when the user
                // left the attribute using a FORWARD 2-SCM.
                //
                // 		<paragraph><$text attribute>bar</$text>{}</paragraph>
                //
                if (position.isAtEnd && !hasAnyAttribute(selection, attributes) && isBetweenDifferentAttributes(position, attributes)) {
                    if (eventData) {
                        preventCaretMovement(eventData);
                    }
                    setSelectionAttributesFromTheNodeBefore(model, attributes, position);
                    return true;
                }
                // Skip the automatic gravity restore upon the next selection#change:range event.
                // If not skipped, it would automatically restore the gravity, which should remain
                // overridden.
                this._isNextGravityRestorationSkipped = true;
                this._overrideGravity();
                // Don't return "true" here because we didn't call _preventCaretMovement.
                // Returning here will destabilize the filler logic, which also listens to
                // keydown (and the event would be stopped).
                return false;
            }
        }
        return false;
    }
    /**
	 * Starts listening to {@link module:engine/view/document~ViewDocument#event:mousedown} and
	 * {@link module:engine/view/document~ViewDocument#event:selectionChange} and puts the selection before/after a 2-step node
	 * if clicked at the beginning/ending of the 2-step node.
	 *
	 * The purpose of this action is to allow typing around the 2-step node directly after a click.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/1016.
	 */ _enableClickingAfterNode() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const document = editor.editing.view.document;
        editor.editing.view.addObserver(MouseObserver);
        editor.editing.view.addObserver(TouchObserver);
        let touched = false;
        let clicked = false;
        // This event should be fired before selection on mobile devices.
        this.listenTo(document, 'touchstart', ()=>{
            clicked = false;
            touched = true;
        });
        // Track mouse click event.
        // Keep in mind that it's often called after the selection change on iOS devices.
        // On the Android devices, it's called before the selection change.
        // That's why we watch `touchstart` event on mobile and set `touched` flag, as it's fired before the selection change.
        // See more: https://github.com/ckeditor/ckeditor5/issues/17171
        this.listenTo(document, 'mousedown', ()=>{
            clicked = true;
        });
        // When the selection has changed...
        this.listenTo(document, 'selectionChange', ()=>{
            const attributes = this.attributes;
            if (!clicked && !touched) {
                return;
            }
            // ...and it was caused by the click or touch...
            clicked = false;
            touched = false;
            // ...and no text is selected...
            if (!selection.isCollapsed) {
                return;
            }
            // ...and clicked text is the 2-step node...
            if (!hasAnyAttribute(selection, attributes)) {
                return;
            }
            const position = selection.getFirstPosition();
            if (!isBetweenDifferentAttributes(position, attributes)) {
                return;
            }
            // The selection at the start of a block would use surrounding attributes
            // from text after the selection so just clear 2-SCM attributes.
            //
            // Also, clear attributes for selection between same attribute with different values.
            if (position.isAtStart || isBetweenDifferentAttributes(position, attributes, true)) {
                clearSelectionAttributes(model, attributes);
            } else if (!this._isGravityOverridden) {
                this._overrideGravity();
            }
        });
    }
    /**
	 * Starts listening to {@link module:engine/model/model~Model#event:insertContent} and corrects the model
	 * selection attributes if the selection is at the end of a two-step node after inserting the content.
	 *
	 * The purpose of this action is to improve the overall UX because the user is no longer "trapped" by the
	 * two-step attribute of the selection, and they can type a "clean" (`linkHref`–less) text right away.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/6053.
	 */ _enableInsertContentSelectionAttributesFixer() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const attributes = this.attributes;
        this.listenTo(model, 'insertContent', ()=>{
            const position = selection.getFirstPosition();
            if (hasAnyAttribute(selection, attributes) && isBetweenDifferentAttributes(position, attributes)) {
                clearSelectionAttributes(model, attributes);
            }
        }, {
            priority: 'low'
        });
    }
    /**
	 * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether
	 * removing a content right after the tow-step attribute.
	 *
	 * If so, the selection should not preserve the two-step attribute. However, if
	 * the {@link module:typing/twostepcaretmovement~TwoStepCaretMovement} plugin is active and
	 * the selection has the two-step attribute due to overridden gravity (at the end), the two-step attribute should stay untouched.
	 *
	 * The purpose of this action is to allow removing the link text and keep the selection outside the link.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/7521.
	 */ _handleDeleteContentAfterNode() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const view = editor.editing.view;
        let isBackspace = false;
        let shouldPreserveAttributes = false;
        // Detect pressing `Backspace`.
        this.listenTo(view.document, 'delete', (evt, data)=>{
            isBackspace = data.direction === 'backward';
        }, {
            priority: 'high'
        });
        // Before removing the content, check whether the selection is inside a two-step attribute.
        // If so, we want to preserve those attributes.
        this.listenTo(model, 'deleteContent', ()=>{
            if (!isBackspace) {
                return;
            }
            const position = selection.getFirstPosition();
            shouldPreserveAttributes = hasAnyAttribute(selection, this.attributes) && !isStepAfterAnyAttributeBoundary(position, this.attributes);
        }, {
            priority: 'high'
        });
        // After removing the content, check whether the current selection should preserve the `linkHref` attribute.
        this.listenTo(model, 'deleteContent', ()=>{
            if (!isBackspace) {
                return;
            }
            isBackspace = false;
            // Do not escape two-step attribute if it was inside it before content deletion.
            if (shouldPreserveAttributes) {
                return;
            }
            // Use `model.enqueueChange()` in order to execute the callback at the end of the changes process.
            editor.model.enqueueChange(()=>{
                const position = selection.getFirstPosition();
                if (hasAnyAttribute(selection, this.attributes) && isBetweenDifferentAttributes(position, this.attributes)) {
                    if (position.isAtStart || isBetweenDifferentAttributes(position, this.attributes, true)) {
                        clearSelectionAttributes(model, this.attributes);
                    } else if (!this._isGravityOverridden) {
                        this._overrideGravity();
                    }
                }
            });
        }, {
            priority: 'low'
        });
    }
    /**
	 * `true` when the gravity is overridden for the plugin.
	 */ get _isGravityOverridden() {
        return !!this._overrideUid;
    }
    /**
	 * Overrides the gravity using the {@link module:engine/model/writer~ModelWriter model writer}
	 * and stores the information about this fact in the {@link #_overrideUid}.
	 *
	 * A shorthand for {@link module:engine/model/writer~ModelWriter#overrideSelectionGravity}.
	 */ _overrideGravity() {
        this._overrideUid = this.editor.model.change((writer)=>{
            return writer.overrideSelectionGravity();
        });
    }
    /**
	 * Restores the gravity using the {@link module:engine/model/writer~ModelWriter model writer}.
	 *
	 * A shorthand for {@link module:engine/model/writer~ModelWriter#restoreSelectionGravity}.
	 */ _restoreGravity() {
        this.editor.model.change((writer)=>{
            writer.restoreSelectionGravity(this._overrideUid);
            this._overrideUid = null;
        });
    }
}
/**
 * Checks whether the selection has any of given attributes.
 */ function hasAnyAttribute(selection, attributes) {
    for (const observedAttribute of attributes){
        if (selection.hasAttribute(observedAttribute)) {
            return true;
        }
    }
    return false;
}
/**
 * Applies the given attributes to the current selection using using the
 * values from the node before the current position. Uses
 * the {@link module:engine/model/writer~ModelWriter model writer}.
 */ function setSelectionAttributesFromTheNodeBefore(model, attributes, position) {
    const nodeBefore = position.nodeBefore;
    model.change((writer)=>{
        if (nodeBefore) {
            const attributes = [];
            const isInlineObject = model.schema.isObject(nodeBefore) && model.schema.isInline(nodeBefore);
            for (const [key, value] of nodeBefore.getAttributes()){
                if (model.schema.checkAttribute('$text', key) && (!isInlineObject || model.schema.getAttributeProperties(key).copyFromObject !== false)) {
                    attributes.push([
                        key,
                        value
                    ]);
                }
            }
            writer.setSelectionAttribute(attributes);
        } else {
            writer.removeSelectionAttribute(attributes);
        }
    });
}
/**
 * Removes 2-SCM attributes from the selection.
 */ function clearSelectionAttributes(model, attributes) {
    model.change((writer)=>{
        writer.removeSelectionAttribute(attributes);
    });
}
/**
 * Prevents the caret movement in the view by calling `preventDefault` on the event data.
 *
 * @alias data.preventDefault
 */ function preventCaretMovement(data) {
    data.preventDefault();
}
/**
 * Checks whether the step before `isBetweenDifferentAttributes()`.
 */ function isStepAfterAnyAttributeBoundary(position, attributes) {
    const positionBefore = position.getShiftedBy(-1);
    return isBetweenDifferentAttributes(positionBefore, attributes);
}
/**
 * Checks whether the given position is between different values of given attributes.
 */ function isBetweenDifferentAttributes(position, attributes, isStrict = false) {
    const { nodeBefore, nodeAfter } = position;
    for (const observedAttribute of attributes){
        const attrBefore = nodeBefore ? nodeBefore.getAttribute(observedAttribute) : undefined;
        const attrAfter = nodeAfter ? nodeAfter.getAttribute(observedAttribute) : undefined;
        if (isStrict && (attrBefore === undefined || attrAfter === undefined)) {
            continue;
        }
        if (attrAfter !== attrBefore) {
            return true;
        }
    }
    return false;
}

// All named transformations.
const TRANSFORMATIONS = {
    // Common symbols:
    copyright: {
        from: '(c)',
        to: '©'
    },
    registeredTrademark: {
        from: '(r)',
        to: '®'
    },
    trademark: {
        from: '(tm)',
        to: '™'
    },
    // Mathematical:
    oneHalf: {
        from: /(^|[^/a-z0-9])(1\/2)([^/a-z0-9])$/i,
        to: [
            null,
            '½',
            null
        ]
    },
    oneThird: {
        from: /(^|[^/a-z0-9])(1\/3)([^/a-z0-9])$/i,
        to: [
            null,
            '⅓',
            null
        ]
    },
    twoThirds: {
        from: /(^|[^/a-z0-9])(2\/3)([^/a-z0-9])$/i,
        to: [
            null,
            '⅔',
            null
        ]
    },
    oneForth: {
        from: /(^|[^/a-z0-9])(1\/4)([^/a-z0-9])$/i,
        to: [
            null,
            '¼',
            null
        ]
    },
    threeQuarters: {
        from: /(^|[^/a-z0-9])(3\/4)([^/a-z0-9])$/i,
        to: [
            null,
            '¾',
            null
        ]
    },
    lessThanOrEqual: {
        from: '<=',
        to: '≤'
    },
    greaterThanOrEqual: {
        from: '>=',
        to: '≥'
    },
    notEqual: {
        from: '!=',
        to: '≠'
    },
    arrowLeft: {
        from: '<-',
        to: '←'
    },
    arrowRight: {
        from: '->',
        to: '→'
    },
    // Typography:
    horizontalEllipsis: {
        from: '...',
        to: '…'
    },
    enDash: {
        from: /(^| )(--)( )$/,
        to: [
            null,
            '–',
            null
        ]
    },
    emDash: {
        from: /(^| )(---)( )$/,
        to: [
            null,
            '—',
            null
        ]
    },
    // Quotations:
    // English, US
    quotesPrimary: {
        from: buildQuotesRegExp('"'),
        to: [
            null,
            '“',
            null,
            '”'
        ]
    },
    quotesSecondary: {
        from: buildQuotesRegExp('\''),
        to: [
            null,
            '‘',
            null,
            '’'
        ]
    },
    // English, UK
    quotesPrimaryEnGb: {
        from: buildQuotesRegExp('\''),
        to: [
            null,
            '‘',
            null,
            '’'
        ]
    },
    quotesSecondaryEnGb: {
        from: buildQuotesRegExp('"'),
        to: [
            null,
            '“',
            null,
            '”'
        ]
    },
    // Polish
    quotesPrimaryPl: {
        from: buildQuotesRegExp('"'),
        to: [
            null,
            '„',
            null,
            '”'
        ]
    },
    quotesSecondaryPl: {
        from: buildQuotesRegExp('\''),
        to: [
            null,
            '‚',
            null,
            '’'
        ]
    }
};
// Transformation groups.
const TRANSFORMATION_GROUPS = {
    symbols: [
        'copyright',
        'registeredTrademark',
        'trademark'
    ],
    mathematical: [
        'oneHalf',
        'oneThird',
        'twoThirds',
        'oneForth',
        'threeQuarters',
        'lessThanOrEqual',
        'greaterThanOrEqual',
        'notEqual',
        'arrowLeft',
        'arrowRight'
    ],
    typography: [
        'horizontalEllipsis',
        'enDash',
        'emDash'
    ],
    quotes: [
        'quotesPrimary',
        'quotesSecondary'
    ]
};
// A set of default transformations provided by the feature.
const DEFAULT_TRANSFORMATIONS = [
    'symbols',
    'mathematical',
    'typography',
    'quotes'
];
/**
 * The text transformation plugin.
 */ class TextTransformation extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            'Delete',
            'Input'
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TextTransformation';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('typing', {
            transformations: {
                include: DEFAULT_TRANSFORMATIONS
            }
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const model = this.editor.model;
        const modelSelection = model.document.selection;
        modelSelection.on('change:range', ()=>{
            // Disable plugin when selection is inside a code block or inline code.
            const anchor = modelSelection.anchor;
            const isInCodeBlock = !!anchor && anchor.parent.is('element', 'codeBlock');
            const isInInlineCode = modelSelection.hasAttribute('code');
            this.isEnabled = !(isInCodeBlock || isInInlineCode);
        });
        this._enableTransformationWatchers();
    }
    /**
	 * Create new TextWatcher listening to the editor for typing and selection events.
	 */ _enableTransformationWatchers() {
        const editor = this.editor;
        const model = editor.model;
        const deletePlugin = editor.plugins.get('Delete');
        const normalizedTransformations = normalizeTransformations(editor.config.get('typing.transformations'));
        const testCallback = (text)=>{
            for (const normalizedTransformation of normalizedTransformations){
                const from = normalizedTransformation.from;
                const match = from.test(text);
                if (match) {
                    return {
                        normalizedTransformation
                    };
                }
            }
        };
        const watcher = new TextWatcher(editor.model, testCallback);
        watcher.on('matched:data', (evt, data)=>{
            if (!data.batch.isTyping) {
                return;
            }
            const { from, to } = data.normalizedTransformation;
            const matches = from.exec(data.text);
            const replaces = to(matches.slice(1));
            const matchedRange = data.range;
            let changeIndex = matches.index;
            model.enqueueChange((writer)=>{
                for(let i = 1; i < matches.length; i++){
                    const match = matches[i];
                    const replaceWith = replaces[i - 1];
                    if (replaceWith == null) {
                        changeIndex += match.length;
                        continue;
                    }
                    const replacePosition = matchedRange.start.getShiftedBy(changeIndex);
                    const replaceRange = model.createRange(replacePosition, replacePosition.getShiftedBy(match.length));
                    const attributes = getTextAttributesAfterPosition(replacePosition);
                    model.insertContent(writer.createText(replaceWith, attributes), replaceRange);
                    changeIndex += replaceWith.length;
                }
                model.enqueueChange(()=>{
                    deletePlugin.requestUndoOnBackspace();
                });
            });
        });
        watcher.bind('isEnabled').to(this);
    }
}
/**
 * Normalizes the configuration `from` parameter value.
 * The normalized value for the `from` parameter is a RegExp instance. If the passed `from` is already a RegExp instance,
 * it is returned unchanged.
 */ function normalizeFrom(from) {
    if (typeof from == 'string') {
        return new RegExp(`(${escapeRegExp(from)})$`);
    }
    // `from` is already a regular expression.
    return from;
}
/**
 * Normalizes the configuration `to` parameter value.
 * The normalized value for the `to` parameter is a function that takes an array and returns an array. See more in the
 * configuration description. If the passed `to` is already a function, it is returned unchanged.
 */ function normalizeTo(to) {
    if (typeof to == 'string') {
        return ()=>[
                to
            ];
    } else if (to instanceof Array) {
        return ()=>to;
    }
    // `to` is already a function.
    return to;
}
/**
 * For given `position` returns attributes for the text that is after that position.
 * The text can be in the same text node as the position (`foo[]bar`) or in the next text node (`foo[]<$text bold="true">bar</$text>`).
 */ function getTextAttributesAfterPosition(position) {
    const textNode = position.textNode ? position.textNode : position.nodeAfter;
    return textNode.getAttributes();
}
/**
 * Returns a RegExp pattern string that detects a sentence inside a quote.
 *
 * @param quoteCharacter The character to create a pattern for.
 */ function buildQuotesRegExp(quoteCharacter) {
    return new RegExp(`(^|\\s)(${quoteCharacter})([^${quoteCharacter}]*)(${quoteCharacter})$`);
}
/**
 * Reads text transformation config and returns normalized array of transformations objects.
 */ function normalizeTransformations(config) {
    const extra = config.extra || [];
    const remove = config.remove || [];
    const isNotRemoved = (transformation)=>!remove.includes(transformation);
    const configured = config.include.concat(extra).filter(isNotRemoved);
    return expandGroupsAndRemoveDuplicates(configured).filter(isNotRemoved) // Filter out 'remove' transformations as they might be set in group.
    .map((transformation)=>typeof transformation == 'string' && TRANSFORMATIONS[transformation] ? TRANSFORMATIONS[transformation] : transformation)// Filter out transformations set as string that has not been found.
    .filter((transformation)=>typeof transformation === 'object').map((transformation)=>({
            from: normalizeFrom(transformation.from),
            to: normalizeTo(transformation.to)
        }));
}
/**
 * Reads definitions and expands named groups if needed to transformation names.
 * This method also removes duplicated named transformations if any.
 */ function expandGroupsAndRemoveDuplicates(definitions) {
    // Set is using to make sure that transformation names are not duplicated.
    const definedTransformations = new Set();
    for (const transformationOrGroup of definitions){
        if (typeof transformationOrGroup == 'string' && TRANSFORMATION_GROUPS[transformationOrGroup]) {
            for (const transformation of TRANSFORMATION_GROUPS[transformationOrGroup]){
                definedTransformations.add(transformation);
            }
        } else {
            definedTransformations.add(transformationOrGroup);
        }
    }
    return Array.from(definedTransformations);
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module typing/utils/findattributerange
 */ /**
 * Returns a model range that covers all consecutive nodes with the same `attributeName` and its `value`
 * that intersect the given `position`.
 *
 * It can be used e.g. to get the entire range on which the `linkHref` attribute needs to be changed when having a
 * selection inside a link.
 *
 * @param position The start position.
 * @param attributeName The attribute name.
 * @param value The attribute value.
 * @param model The model instance.
 * @returns The link range.
 */ function findAttributeRange(position, attributeName, value, model) {
    return model.createRange(findAttributeRangeBound(position, attributeName, value, true, model), findAttributeRangeBound(position, attributeName, value, false, model));
}
/**
 * Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
 * and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
 *
 * @param position The start position.
 * @param attributeName The attribute name.
 * @param value The attribute value.
 * @param lookBack Whether the walk direction is forward (`false`) or backward (`true`).
 * @returns The position just before the last matched node.
 */ function findAttributeRangeBound(position, attributeName, value, lookBack, model) {
    // Get node before or after position (depends on `lookBack` flag).
    // When position is inside text node then start searching from text node.
    let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);
    let lastNode = null;
    while(node && node.getAttribute(attributeName) == value){
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }
    return lastNode ? model.createPositionAt(lastNode, lookBack ? 'before' : 'after') : position;
}

/**
 * Adds a visual highlight style to an attribute element in which the selection is anchored.
 * Together with two-step caret movement, they indicate that the user is typing inside the element.
 *
 * Highlight is turned on by adding the given class to the attribute element in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * Usage:
 *
 * ```ts
 * import { inlineHighlight } from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';
 *
 * // Make `ck-link_selected` class be applied on an `a` element
 * // whenever the corresponding `linkHref` attribute element is selected.
 * inlineHighlight( editor, 'linkHref', 'a', 'ck-link_selected' );
 * ```
 *
 * @param editor The editor instance.
 * @param attributeName The attribute name to check.
 * @param tagName The tagName of a view item.
 * @param className The class name to apply in the view.
 */ function inlineHighlight(editor, attributeName, tagName, className) {
    const view = editor.editing.view;
    const highlightedElements = new Set();
    // Adding the class.
    view.document.registerPostFixer((writer)=>{
        const selection = editor.model.document.selection;
        let changed = false;
        if (selection.hasAttribute(attributeName)) {
            const modelRange = findAttributeRange(selection.getFirstPosition(), attributeName, selection.getAttribute(attributeName), editor.model);
            const viewRange = editor.editing.mapper.toViewRange(modelRange);
            // There might be multiple view elements in the `viewRange`, for example, when the `a` element is
            // broken by a UIElement.
            for (const item of viewRange.getItems()){
                if (item.is('element', tagName) && !item.hasClass(className)) {
                    writer.addClass(className, item);
                    highlightedElements.add(item);
                    changed = true;
                }
            }
        }
        return changed;
    });
    // Removing the class.
    editor.conversion.for('editingDowncast').add((dispatcher)=>{
        // Make sure the highlight is removed on every possible event, before conversion is started.
        dispatcher.on('insert', removeHighlight, {
            priority: 'highest'
        });
        dispatcher.on('remove', removeHighlight, {
            priority: 'highest'
        });
        dispatcher.on('attribute', removeHighlight, {
            priority: 'highest'
        });
        dispatcher.on('selection', removeHighlight, {
            priority: 'highest'
        });
        function removeHighlight() {
            view.change((writer)=>{
                for (const item of highlightedElements.values()){
                    writer.removeClass(className, item);
                    highlightedElements.delete(item);
                }
            });
        }
    });
}

export { Delete, DeleteCommand, Input, InsertTextCommand, TextTransformation, TextWatcher, TwoStepCaretMovement, Typing, TypingChangeBuffer, DeleteObserver as _DeleteObserver, findAttributeRange, findAttributeRangeBound, getLastTextLine, inlineHighlight };
//# sourceMappingURL=index.js.map

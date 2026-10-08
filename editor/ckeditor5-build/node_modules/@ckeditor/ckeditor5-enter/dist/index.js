/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Observer, BubblingEventInfo, ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { env } from '@ckeditor/ckeditor5-utils/dist/index.js';

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module enter/utils
 */ /**
 * Returns attributes that should be preserved on the enter keystroke.
 *
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~ModelSchema#setAttributeProperties here}.
 *
 * @param schema Model's schema.
 * @param allAttributes Attributes to filter.
 * @internal
 */ function* getCopyOnEnterAttributes(schema, allAttributes) {
    for (const attribute of allAttributes){
        if (attribute && schema.getAttributeProperties(attribute[0]).copyOnEnter) {
            yield attribute;
        }
    }
}

/**
 * Enter command used by the {@link module:enter/enter~Enter Enter feature} to handle the <kbd>Enter</kbd> keystroke.
 */ class EnterCommand extends Command {
    /**
	 * @inheritDoc
	 */ execute() {
        this.editor.model.change((writer)=>{
            this.enterBlock(writer);
            this.fire('afterExecute', {
                writer
            });
        });
    }
    /**
	 * Splits a block where the document selection is placed, in the way how the <kbd>Enter</kbd> key is expected to work:
	 *
	 * ```
	 * <p>Foo[]bar</p>   ->   <p>Foo</p><p>[]bar</p>
	 * <p>Foobar[]</p>   ->   <p>Foobar</p><p>[]</p>
	 * <p>Fo[ob]ar</p>   ->   <p>Fo</p><p>[]ar</p>
	 * ```
	 *
	 * In some cases, the split will not happen:
	 *
	 * ```
	 * // The selection parent is a limit element:
	 * <figcaption>A[bc]d</figcaption>   ->   <figcaption>A[]d</figcaption>
	 *
	 * // The selection spans over multiple elements:
	 * <h>x[x</h><p>y]y<p>   ->   <h>x</h><p>[]y</p>
	 * ```
	 *
	 * @param writer Writer to use when performing the enter action.
	 * @returns Boolean indicating if the block was split.
	 */ enterBlock(writer) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        const isSelectionEmpty = selection.isCollapsed;
        const range = selection.getFirstRange();
        const startElement = range.start.parent;
        const endElement = range.end.parent;
        // Don't touch the roots and other limit elements.
        if (schema.isLimit(startElement) || schema.isLimit(endElement)) {
            // Delete the selected content but only if inside a single limit element.
            // Abort, when crossing limit elements boundary (e.g. <limit1>x[x</limit1>donttouchme<limit2>y]y</limit2>).
            // This is an edge case and it's hard to tell what should actually happen because such a selection
            // is not entirely valid.
            if (!isSelectionEmpty && startElement == endElement) {
                model.deleteContent(selection);
            }
            return false;
        }
        if (isSelectionEmpty) {
            const attributesToCopy = getCopyOnEnterAttributes(writer.model.schema, selection.getAttributes());
            splitBlock(writer, range.start);
            writer.setSelectionAttribute(attributesToCopy);
            return true;
        } else {
            const leaveUnmerged = !(range.start.isAtStart && range.end.isAtEnd);
            const isContainedWithinOneElement = startElement == endElement;
            model.deleteContent(selection, {
                leaveUnmerged
            });
            if (leaveUnmerged) {
                // Partially selected elements.
                //
                // <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x</h><h>^x</h>
                if (isContainedWithinOneElement) {
                    splitBlock(writer, selection.focus);
                    return true;
                } else {
                    writer.setSelection(endElement, 0);
                }
            }
        }
        return false;
    }
}
function splitBlock(writer, splitPos) {
    writer.split(splitPos);
    writer.setSelection(splitPos.parent.nextSibling, 0);
}

const ENTER_EVENT_TYPES = {
    insertParagraph: {
        isSoft: false
    },
    insertLineBreak: {
        isSoft: true
    }
};
/**
 * Enter observer introduces the {@link module:engine/view/document~ViewDocument#event:enter `Document#enter`} event.
 */ class EnterObserver extends Observer {
    /**
	 * @inheritDoc
	 */ constructor(view){
        super(view);
        const doc = this.document;
        let shiftPressed = false;
        doc.on('keydown', (evt, data)=>{
            shiftPressed = data.shiftKey;
        });
        doc.on('beforeinput', (evt, data)=>{
            if (!this.isEnabled) {
                return;
            }
            let inputType = data.inputType;
            // See https://github.com/ckeditor/ckeditor5/issues/13321.
            if (env.isSafari && shiftPressed && inputType == 'insertParagraph') {
                inputType = 'insertLineBreak';
            }
            const domEvent = data.domEvent;
            const enterEventSpec = ENTER_EVENT_TYPES[inputType];
            if (!enterEventSpec) {
                return;
            }
            const event = new BubblingEventInfo(doc, 'enter', data.targetRanges[0]);
            doc.fire(event, new ViewDocumentDomEventData(view, domEvent, {
                isSoft: enterEventSpec.isSoft
            }));
            // Stop `beforeinput` event if `enter` event was stopped.
            // https://github.com/ckeditor/ckeditor5/issues/753
            if (event.stop.called) {
                evt.stop();
            }
        });
    }
    /**
	 * @inheritDoc
	 */ observe() {}
    /**
	 * @inheritDoc
	 */ stopObserving() {}
}

/**
 * This plugin handles the <kbd>Enter</kbd> keystroke (hard line break) in the editor.
 *
 * See also the {@link module:enter/shiftenter~ShiftEnter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */ class Enter extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Enter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    init() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const t = this.editor.t;
        view.addObserver(EnterObserver);
        editor.commands.add('enter', new EnterCommand(editor));
        this.listenTo(viewDocument, 'enter', (evt, data)=>{
            // When not in composition, we handle the action, so prevent the default one.
            // When in composition, it's the browser who modify the DOM (renderer is disabled).
            if (!viewDocument.isComposing) {
                data.preventDefault();
            }
            // The soft enter key is handled by the ShiftEnter plugin.
            if (data.isSoft) {
                return;
            }
            editor.execute('enter');
            view.scrollToTheSelection();
        }, {
            priority: 'low'
        });
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Insert a hard break (a new paragraph)'),
                    keystroke: 'Enter'
                }
            ]
        });
    }
}

/**
 * ShiftEnter command. It is used by the {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature} to handle
 * the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke.
 */ class ShiftEnterCommand extends Command {
    /**
	 * @inheritDoc
	 */ execute() {
        const model = this.editor.model;
        const doc = model.document;
        model.change((writer)=>{
            softBreakAction(model, writer, doc.selection);
            this.fire('afterExecute', {
                writer
            });
        });
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.isEnabled = isEnabled(model.schema, doc.selection);
    }
}
/**
 * Checks whether the ShiftEnter command should be enabled in the specified selection.
 */ function isEnabled(schema, selection) {
    // At this moment it is okay to support single range selections only.
    // But in the future we may need to change that.
    if (selection.rangeCount > 1) {
        return false;
    }
    const anchorPos = selection.anchor;
    // Check whether the break element can be inserted in the current selection anchor.
    if (!anchorPos || !schema.checkChild(anchorPos, 'softBreak')) {
        return false;
    }
    const range = selection.getFirstRange();
    const startElement = range.start.parent;
    const endElement = range.end.parent;
    // Do not modify the content if selection is cross-limit elements.
    if ((isInsideLimitElement(startElement, schema) || isInsideLimitElement(endElement, schema)) && startElement !== endElement) {
        return false;
    }
    return true;
}
/**
 * Creates a break in the way that the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke is expected to work.
 */ function softBreakAction(model, writer, selection) {
    const isSelectionEmpty = selection.isCollapsed;
    const range = selection.getFirstRange();
    const startElement = range.start.parent;
    const endElement = range.end.parent;
    const isContainedWithinOneElement = startElement == endElement;
    if (isSelectionEmpty) {
        const attributesToCopy = getCopyOnEnterAttributes(model.schema, selection.getAttributes());
        insertBreak(model, writer, range.end);
        writer.removeSelectionAttribute(selection.getAttributeKeys());
        writer.setSelectionAttribute(attributesToCopy);
    } else {
        const leaveUnmerged = !(range.start.isAtStart && range.end.isAtEnd);
        model.deleteContent(selection, {
            leaveUnmerged
        });
        // Selection within one element:
        //
        // <h>x[xx]x</h>		-> <h>x^x</h>			-> <h>x<br>^x</h>
        if (isContainedWithinOneElement) {
            insertBreak(model, writer, selection.focus);
        } else {
            // Move the selection to the 2nd element (last step of the example above).
            if (leaveUnmerged) {
                writer.setSelection(endElement, 0);
            }
        }
    }
}
function insertBreak(model, writer, position) {
    const breakLineElement = writer.createElement('softBreak');
    model.insertContent(breakLineElement, position);
    writer.setSelection(breakLineElement, 'after');
}
/**
 * Checks whether the specified `element` is a child of the limit element.
 *
 * Checking whether the `<p>` element is inside a limit element:
 *   - `<$root><p>Text.</p></$root> => false`
 *   - `<$root><limitElement><p>Text</p></limitElement></$root> => true`
 */ function isInsideLimitElement(element, schema) {
    // `$root` is a limit element but in this case is an invalid element.
    if (element.is('rootElement')) {
        return false;
    }
    return schema.isLimit(element) || isInsideLimitElement(element.parent, schema);
}

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */ class ShiftEnter extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ShiftEnter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const t = this.editor.t;
        // Configure the schema.
        schema.register('softBreak', {
            allowWhere: '$text',
            isInline: true
        });
        // Configure converters.
        conversion.for('upcast').elementToElement({
            model: 'softBreak',
            view: 'br'
        });
        conversion.for('downcast').elementToElement({
            model: 'softBreak',
            view: (modelElement, { writer })=>writer.createEmptyElement('br')
        });
        view.addObserver(EnterObserver);
        editor.commands.add('shiftEnter', new ShiftEnterCommand(editor));
        this.listenTo(viewDocument, 'enter', (evt, data)=>{
            // When not in composition, we handle the action, so prevent the default one.
            // When in composition, it's the browser who modify the DOM (renderer is disabled).
            if (!viewDocument.isComposing) {
                data.preventDefault();
            }
            // The hard enter key is handled by the Enter plugin.
            if (!data.isSoft) {
                return;
            }
            editor.execute('shiftEnter');
            view.scrollToTheSelection();
        }, {
            priority: 'low'
        });
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Insert a soft break (a <code>&lt;br&gt;</code> element)'),
                    keystroke: 'Shift+Enter'
                }
            ]
        });
    }
}

export { Enter, EnterCommand, EnterObserver, ShiftEnter, ShiftEnterCommand, getCopyOnEnterAttributes as _getCopyOnEnterAttributes };
//# sourceMappingURL=index.js.map

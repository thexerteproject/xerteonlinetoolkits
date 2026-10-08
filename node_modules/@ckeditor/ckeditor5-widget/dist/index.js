/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { MouseObserver, PointerObserver, ModelTreeWalker } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { EmitterMixin, Rect, CKEditorError, toArray, isForwardArrowKeyCode, env, keyCodes, getLocalizedArrowKeyCodeDirection, compareArrays, getRangeFromMouseEvent, logWarning, ObservableMixin, global, DomEmitterMixin } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconDragHandle, IconReturnArrow } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { IconView, Template, ContextualBalloon, ToolbarView, BalloonPanelView, View } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { Enter } from '@ckeditor/ckeditor5-enter/dist/index.js';
import { throttle } from 'es-toolkit/compat';

/**
 * Class used to handle the correct order of highlights on elements.
 *
 * When different highlights are applied to same element the correct order should be preserved:
 *
 * * highlight with highest priority should be applied,
 * * if two highlights have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor}.
 *
 * This way, highlight will be applied with the same rules it is applied on texts.
 */ class WidgetHighlightStack extends /* #__PURE__ */ EmitterMixin() {
    _stack = [];
    /**
	 * Adds highlight descriptor to the stack.
	 *
	 * @fires change:top
	 */ add(descriptor, writer) {
        const stack = this._stack;
        // Save top descriptor and insert new one. If top is changed - fire event.
        const oldTop = stack[0];
        this._insertDescriptor(descriptor);
        const newTop = stack[0];
        // When new object is at the top and stores different information.
        if (oldTop !== newTop && !compareDescriptors(oldTop, newTop)) {
            this.fire('change:top', {
                oldDescriptor: oldTop,
                newDescriptor: newTop,
                writer
            });
        }
    }
    /**
	 * Removes highlight descriptor from the stack.
	 *
	 * @fires change:top
	 * @param id Id of the descriptor to remove.
	 */ remove(id, writer) {
        const stack = this._stack;
        const oldTop = stack[0];
        this._removeDescriptor(id);
        const newTop = stack[0];
        // When new object is at the top and stores different information.
        if (oldTop !== newTop && !compareDescriptors(oldTop, newTop)) {
            this.fire('change:top', {
                oldDescriptor: oldTop,
                newDescriptor: newTop,
                writer
            });
        }
    }
    /**
	 * Inserts a given descriptor in correct place in the stack. It also takes care about updating information
	 * when descriptor with same id is already present.
	 */ _insertDescriptor(descriptor) {
        const stack = this._stack;
        const index = stack.findIndex((item)=>item.id === descriptor.id);
        // Inserting exact same descriptor - do nothing.
        if (compareDescriptors(descriptor, stack[index])) {
            return;
        }
        // If descriptor with same id but with different information is on the stack - remove it.
        if (index > -1) {
            stack.splice(index, 1);
        }
        // Find correct place to insert descriptor in the stack.
        // It has different information (for example priority) so it must be re-inserted in correct place.
        let i = 0;
        while(stack[i] && shouldABeBeforeB(stack[i], descriptor)){
            i++;
        }
        stack.splice(i, 0, descriptor);
    }
    /**
	 * Removes descriptor with given id from the stack.
	 *
	 * @param id Descriptor's id.
	 */ _removeDescriptor(id) {
        const stack = this._stack;
        const index = stack.findIndex((item)=>item.id === id);
        // If descriptor with same id is on the list - remove it.
        if (index > -1) {
            stack.splice(index, 1);
        }
    }
}
/**
 * Compares two descriptors by checking their priority and class list.
 *
 * @returns Returns true if both descriptors are defined and have same priority and classes.
 */ function compareDescriptors(a, b) {
    return a && b && a.priority == b.priority && classesToString(a.classes) == classesToString(b.classes);
}
/**
 * Checks whenever first descriptor should be placed in the stack before second one.
 */ function shouldABeBeforeB(a, b) {
    if (a.priority > b.priority) {
        return true;
    } else if (a.priority < b.priority) {
        return false;
    }
    // When priorities are equal and names are different - use classes to compare.
    return classesToString(a.classes) > classesToString(b.classes);
}
/**
 * Converts CSS classes passed with {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor} to
 * sorted string.
 */ function classesToString(classes) {
    return Array.isArray(classes) ? classes.sort().join(',') : classes;
}

/**
 * CSS class added to each widget element.
 */ const WIDGET_CLASS_NAME = 'ck-widget';
/**
 * CSS class added to currently selected widget element.
 */ const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';
/**
 * Returns `true` if given {@link module:engine/view/node~ViewNode} is an {@link module:engine/view/element~ViewElement} and a widget.
 */ function isWidget(node) {
    if (!node.is('element')) {
        return false;
    }
    return !!node.getCustomProperty('widget');
}
/**
 * Converts the given {@link module:engine/view/element~ViewElement} to a widget in the following way:
 *
 * * sets the `contenteditable` attribute to `"false"`,
 * * adds the `ck-widget` CSS class,
 * * adds a custom {@link module:engine/view/element~ViewElement#getFillerOffset `getFillerOffset()`} method returning `null`,
 * * adds a custom property allowing to recognize widget elements by using {@link ~isWidget `isWidget()`},
 * * implements the {@link ~setHighlightHandling view highlight on widgets}.
 *
 * This function needs to be used in conjunction with
 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers downcast conversion helpers}
 * like {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 * Moreover, typically you will want to use `toWidget()` only for `editingDowncast`, while keeping the `dataDowncast` clean.
 *
 * For example, in order to convert a `<widget>` model element to `<div class="widget">` in the view, you can define
 * such converters:
 *
 * ```ts
 * editor.conversion.for( 'editingDowncast' )
 * 	.elementToElement( {
 * 		model: 'widget',
 * 		view: ( modelItem, { writer } ) => {
 * 			const div = writer.createContainerElement( 'div', { class: 'widget' } );
 *
 * 			return toWidget( div, writer, { label: 'some widget' } );
 * 		}
 * 	} );
 *
 * editor.conversion.for( 'dataDowncast' )
 * 	.elementToElement( {
 * 		model: 'widget',
 * 		view: ( modelItem, { writer } ) => {
 * 			return writer.createContainerElement( 'div', { class: 'widget' } );
 * 		}
 * 	} );
 * ```
 *
 * See the full source code of the widget (with a nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param options Additional options.
 * @param options.label Element's label provided to the {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string. It represents the widget for assistive technologies (like screen readers).
 * @param options.hasSelectionHandle If `true`, the widget will have a selection handle added.
 * @returns Returns the same element.
 */ function toWidget(element, writer, options = {}) {
    if (!element.is('containerElement')) {
        /**
		 * The element passed to `toWidget()` must be a {@link module:engine/view/containerelement~ViewContainerElement}
		 * instance.
		 *
		 * @error widget-to-widget-wrong-element-type
		 * @param {any} element The view element passed to `toWidget()`.
		 */ throw new CKEditorError('widget-to-widget-wrong-element-type', null, {
            element
        });
    }
    writer.setAttribute('contenteditable', 'false', element);
    writer.addClass(WIDGET_CLASS_NAME, element);
    writer.setCustomProperty('widget', true, element);
    element.getFillerOffset = getFillerOffset;
    writer.setCustomProperty('widgetLabel', [], element);
    if (options.label) {
        setLabel(element, options.label);
    }
    if (options.hasSelectionHandle) {
        addSelectionHandle(element, writer);
    }
    setHighlightHandling(element, writer);
    return element;
}
/**
 * Default handler for adding a highlight on a widget.
 * It adds CSS class and attributes basing on the given highlight descriptor.
 */ function addHighlight(element, descriptor, writer) {
    if (descriptor.classes) {
        writer.addClass(toArray(descriptor.classes), element);
    }
    if (descriptor.attributes) {
        for(const key in descriptor.attributes){
            writer.setAttribute(key, descriptor.attributes[key], element);
        }
    }
}
/**
 * Default handler for removing a highlight from a widget.
 * It removes CSS class and attributes basing on the given highlight descriptor.
 */ function removeHighlight(element, descriptor, writer) {
    if (descriptor.classes) {
        writer.removeClass(toArray(descriptor.classes), element);
    }
    if (descriptor.attributes) {
        for(const key in descriptor.attributes){
            writer.removeAttribute(key, element);
        }
    }
}
/**
 * Sets highlight handling methods. Uses {@link module:widget/highlightstack~WidgetHighlightStack} to
 * properly determine which highlight descriptor should be used at given time.
 */ function setHighlightHandling(element, writer, add = addHighlight, remove = removeHighlight) {
    const stack = new WidgetHighlightStack();
    stack.on('change:top', (evt, data)=>{
        if (data.oldDescriptor) {
            remove(element, data.oldDescriptor, data.writer);
        }
        if (data.newDescriptor) {
            add(element, data.newDescriptor, data.writer);
        }
    });
    const addHighlightCallback = (element, descriptor, writer)=>stack.add(descriptor, writer);
    const removeHighlightCallback = (element, id, writer)=>stack.remove(id, writer);
    writer.setCustomProperty('addHighlight', addHighlightCallback, element);
    writer.setCustomProperty('removeHighlight', removeHighlightCallback, element);
}
/**
 * Sets label for given element.
 * It can be passed as a plain string or a function returning a string. Function will be called each time label is retrieved by
 * {@link ~getLabel `getLabel()`}.
 */ function setLabel(element, labelOrCreator) {
    const widgetLabel = element.getCustomProperty('widgetLabel');
    widgetLabel.push(labelOrCreator);
}
/**
 * Returns the label of the provided element.
 */ function getLabel(element) {
    const widgetLabel = element.getCustomProperty('widgetLabel');
    return widgetLabel.reduce((prev, current)=>{
        if (typeof current === 'function') {
            return prev ? prev + '. ' + current() : current();
        } else {
            return prev ? prev + '. ' + current : current;
        }
    }, '');
}
/**
 * Adds functionality to the provided {@link module:engine/view/editableelement~ViewEditableElement} to act as a widget's editable:
 *
 * * sets the `contenteditable` attribute to `true` when
 * {@link module:engine/view/editableelement~ViewEditableElement#isReadOnly} is `false`,
 * otherwise sets it to `false`,
 * * adds the `ck-editor__editable` and `ck-editor__nested-editable` CSS classes,
 * * adds the `ck-editor__nested-editable_focused` CSS class when the editable is focused and removes it when it is blurred.
 * * implements the {@link ~setHighlightHandling view highlight on widget's editable}.
 * * sets the `role` attribute to `textbox` for accessibility purposes.
 *
 * Similarly to {@link ~toWidget `toWidget()`} this function should be used in `editingDowncast` only and it is usually
 * used together with {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 *
 * For example, in order to convert a `<nested>` model element to `<div class="nested">` in the view, you can define
 * such converters:
 *
 * ```ts
 * editor.conversion.for( 'editingDowncast' )
 * 	.elementToElement( {
 * 		model: 'nested',
 * 		view: ( modelItem, { writer } ) => {
 * 			const div = writer.createEditableElement( 'div', { class: 'nested' } );
 *
 * 			return toWidgetEditable( nested, writer, { label: 'label for editable' } );
 * 		}
 * 	} );
 *
 * editor.conversion.for( 'dataDowncast' )
 * 	.elementToElement( {
 * 		model: 'nested',
 * 		view: ( modelItem, { writer } ) => {
 * 			return writer.createContainerElement( 'div', { class: 'nested' } );
 * 		}
 * 	} );
 * ```
 *
 * See the full source code of the widget (with nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param options Additional options.
 * @param options.label Editable's label used by assistive technologies (e.g. screen readers).
 * @param options.withAriaRole Whether to add the role="textbox" attribute on the editable. Defaults to `true`.
 * @returns Returns the same element that was provided in the `editable` parameter
 */ function toWidgetEditable(editable, writer, options = {}) {
    writer.addClass([
        'ck-editor__editable',
        'ck-editor__nested-editable'
    ], editable);
    // Set role="textbox" only if explicitly requested (defaults to true for backward compatibility).
    if (options.withAriaRole !== false) {
        writer.setAttribute('role', 'textbox', editable);
    }
    // Setting tabindex=-1 on contenteditable=false makes it focusable. It propagates focus to the editable
    // element and makes it possible to highlight nested editables as focused. It's not what we want
    // for read-only editables though.
    // See more: https://github.com/ckeditor/ckeditor5/issues/18965
    if (!editable.isReadOnly) {
        writer.setAttribute('tabindex', '-1', editable);
    }
    if (options.label) {
        writer.setAttribute('aria-label', options.label, editable);
    }
    // Set initial contenteditable value.
    writer.setAttribute('contenteditable', editable.isReadOnly ? 'false' : 'true', editable);
    // Bind the contenteditable property to element#isReadOnly.
    editable.on('change:isReadOnly', (evt, property, isReadonly)=>{
        writer.setAttribute('contenteditable', isReadonly ? 'false' : 'true', editable);
        if (isReadonly) {
            writer.removeAttribute('tabindex', editable);
        } else {
            writer.setAttribute('tabindex', '-1', editable);
        }
    });
    editable.on('change:isFocused', (evt, property, is)=>{
        if (is) {
            writer.addClass('ck-editor__nested-editable_focused', editable);
        } else {
            writer.removeClass('ck-editor__nested-editable_focused', editable);
        }
    });
    setHighlightHandling(editable, writer);
    return editable;
}
/**
 * Returns a model range which is optimal (in terms of UX) for inserting a widget block.
 *
 * For instance, if a selection is in the middle of a paragraph, the collapsed range before this paragraph
 * will be returned so that it is not split. If the selection is at the end of a paragraph,
 * the collapsed range after this paragraph will be returned.
 *
 * Note: If the selection is placed in an empty block, the range in that block will be returned. If that range
 * is then passed to {@link module:engine/model/model~Model#insertContent}, the block will be fully replaced
 * by the inserted widget block.
 *
 * @param selection The selection based on which the insertion position should be calculated.
 * @param model Model instance.
 * @returns The optimal range.
 */ function findOptimalInsertionRange(selection, model) {
    const selectedElement = selection.getSelectedElement();
    if (selectedElement) {
        const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(selection);
        // If the WidgetTypeAround "fake caret" is displayed, use its position for the insertion
        // to provide the most predictable UX (https://github.com/ckeditor/ckeditor5/issues/7438).
        if (typeAroundFakeCaretPosition) {
            return model.createRange(model.createPositionAt(selectedElement, typeAroundFakeCaretPosition));
        }
    }
    return model.schema.findOptimalInsertionRange(selection);
}
/**
 * A util to be used in order to map view positions to correct model positions when implementing a widget
 * which renders non-empty view element for an empty model element.
 *
 * For example:
 *
 * ```
 * // Model:
 * <placeholder type="name"></placeholder>
 *
 * // View:
 * <span class="placeholder">name</span>
 * ```
 *
 * In such case, view positions inside `<span>` cannot be correctly mapped to the model (because the model element is empty).
 * To handle mapping positions inside `<span class="placeholder">` to the model use this util as follows:
 *
 * ```ts
 * editor.editing.mapper.on(
 * 	'viewToModelPosition',
 * 	viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
 * );
 * ```
 *
 * The callback will try to map the view offset of selection to an expected model position.
 *
 * 1. When the position is at the end (or in the middle) of the inline widget:
 *
 * ```
 * // View:
 * <p>foo <span class="placeholder">name|</span> bar</p>
 *
 * // Model:
 * <paragraph>foo <placeholder type="name"></placeholder>| bar</paragraph>
 * ```
 *
 * 2. When the position is at the beginning of the inline widget:
 *
 * ```
 * // View:
 * <p>foo <span class="placeholder">|name</span> bar</p>
 *
 * // Model:
 * <paragraph>foo |<placeholder type="name"></placeholder> bar</paragraph>
 * ```
 *
 * @param model Model instance on which the callback operates.
 * @param viewElementMatcher Function that is passed a view element and should return `true` if the custom mapping
 * should be applied to the given view element.
 */ function viewToModelPositionOutsideModelElement(model, viewElementMatcher) {
    return (evt, data)=>{
        const { mapper, viewPosition } = data;
        const viewParent = mapper.findMappedViewAncestor(viewPosition);
        if (!viewElementMatcher(viewParent)) {
            return;
        }
        const modelParent = mapper.toModelElement(viewParent);
        data.modelPosition = model.createPositionAt(modelParent, viewPosition.isAtStart ? 'before' : 'after');
    };
}
/**
 * Default filler offset function applied to all widget elements.
 */ function getFillerOffset() {
    return null;
}
/**
 * Adds a drag handle to the widget.
 */ function addSelectionHandle(widgetElement, writer) {
    const selectionHandle = writer.createUIElement('div', {
        class: 'ck ck-widget__selection-handle'
    }, function(domDocument) {
        const domElement = this.toDomElement(domDocument);
        // Use the IconView from the ui library.
        const icon = new IconView();
        icon.set('content', IconDragHandle);
        // Render the icon view right away to append its #element to the selectionHandle DOM element.
        icon.render();
        domElement.appendChild(icon.element);
        return domElement;
    });
    // Append the selection handle into the widget wrapper.
    writer.insert(writer.createPositionAt(widgetElement, 0), selectionHandle);
    writer.addClass([
        'ck-widget_with-selection-handle'
    ], widgetElement);
}
/**
 * Starting from a DOM resize host element (an element that receives dimensions as a result of resizing),
 * this helper returns the width of the found ancestor element.
 *
 *	* It searches up to 5 levels of ancestors only.
 *
 * @param domResizeHost Resize host DOM element that receives dimensions as a result of resizing.
 * @returns Width of ancestor element in pixels or 0 if no ancestor with a computed width has been found.
 */ function calculateResizeHostAncestorWidth(domResizeHost) {
    const getElementComputedWidth = (element)=>{
        const { width, paddingLeft, paddingRight } = element.ownerDocument.defaultView.getComputedStyle(element);
        return parseFloat(width) - (parseFloat(paddingLeft) || 0) - (parseFloat(paddingRight) || 0);
    };
    const domResizeHostParent = domResizeHost.parentElement;
    if (!domResizeHostParent) {
        return 0;
    }
    // Need to use computed style as it properly excludes parent's paddings from the returned value.
    let parentWidth = getElementComputedWidth(domResizeHostParent);
    // Sometimes parent width cannot be accessed. If that happens we should go up in the elements tree
    // and try to get width from next ancestor.
    // https://github.com/ckeditor/ckeditor5/issues/10776
    const ancestorLevelLimit = 5;
    let currentLevel = 0;
    let checkedElement = domResizeHostParent;
    while(isNaN(parentWidth)){
        checkedElement = checkedElement.parentElement;
        if (++currentLevel > ancestorLevelLimit) {
            return 0;
        }
        parentWidth = getElementComputedWidth(checkedElement);
    }
    return parentWidth;
}
/**
 * Calculates a relative width of a `domResizeHost` compared to its ancestor in percents.
 *
 * @param domResizeHost Resize host DOM element.
 * @returns Percentage value between 0 and 100.
 */ function calculateResizeHostPercentageWidth(domResizeHost, resizeHostRect = new Rect(domResizeHost)) {
    const parentWidth = calculateResizeHostAncestorWidth(domResizeHost);
    if (!parentWidth) {
        return 0;
    }
    return resizeHostRect.width / parentWidth * 100;
}

/**
 * The name of the type around model selection attribute responsible for
 * displaying a fake caret next to a selected widget.
 *
 * @internal
 */ const TYPE_AROUND_SELECTION_ATTRIBUTE = 'widget-type-around';
/**
 * Checks if an element is a widget that qualifies to get the widget type around UI.
 */ function isTypeAroundWidget(viewElement, modelElement, schema) {
    return !!viewElement && isWidget(viewElement) && !schema.isInline(modelElement);
}
/**
 * For the passed HTML element, this helper finds the closest widget type around button ancestor.
 *
 * @internal
 */ function getClosestTypeAroundDomButton(domElement) {
    return domElement.closest('.ck-widget__type-around__button');
}
/**
 * For the passed widget type around button element, this helper determines at which position
 * the paragraph would be inserted into the content if, for instance, the button was
 * clicked by the user.
 *
 * @internal
 * @returns The position of the button.
 */ function getTypeAroundButtonPosition(domElement) {
    return domElement.classList.contains('ck-widget__type-around__button_before') ? 'before' : 'after';
}
/**
 * For the passed HTML element, this helper returns the closest view widget ancestor.
 *
 * @internal
 */ function getClosestWidgetViewElement(domElement, domConverter) {
    const widgetDomElement = domElement.closest('.ck-widget');
    return domConverter.mapDomToView(widgetDomElement);
}
/**
 * For the passed selection instance, it returns the position of the fake caret displayed next to a widget.
 *
 * **Note**: If the fake caret is not currently displayed, `null` is returned.
 *
 * @internal
 * @returns The position of the fake caret or `null` when none is present.
 */ function getTypeAroundFakeCaretPosition(selection) {
    return selection.getAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
}

const POSSIBLE_INSERTION_POSITIONS = [
    'before',
    'after'
];
// Do the SVG parsing once and then clone the result <svg> DOM element for each new button.
const RETURN_ARROW_ICON_ELEMENT = new DOMParser().parseFromString(IconReturnArrow, 'image/svg+xml').firstChild;
const PLUGIN_DISABLED_EDITING_ROOT_CLASS = 'ck-widget__type-around_disabled';
/**
 * A plugin that allows users to type around widgets where normally it is impossible to place the caret due
 * to limitations of web browsers. These "tight spots" occur, for instance, before (or after) a widget being
 * the first (or last) child of its parent or between two block widgets.
 *
 * This plugin extends the {@link module:widget/widget~Widget `Widget`} plugin and injects the user interface
 * with two buttons into each widget instance in the editor. Each of the buttons can be clicked by the
 * user if the widget is next to the "tight spot". Once clicked, a paragraph is created with the selection anchored
 * in it so that users can type (or insert content, paste, etc.) straight away.
 */ class WidgetTypeAround extends Plugin {
    /**
	 * A reference to the model widget element that has the fake caret active
	 * on either side of it. It is later used to remove CSS classes associated with the fake caret
	 * when the widget no longer needs it.
	 */ _currentFakeCaretModelElement = null;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'WidgetTypeAround';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Enter,
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        // Set a CSS class on the view editing root when the plugin is disabled so all the buttons
        // and lines visually disappear. All the interactions are disabled in individual plugin methods.
        this.on('change:isEnabled', (evt, data, isEnabled)=>{
            editingView.change((writer)=>{
                for (const root of editingView.document.roots){
                    if (isEnabled) {
                        writer.removeClass(PLUGIN_DISABLED_EDITING_ROOT_CLASS, root);
                    } else {
                        writer.addClass(PLUGIN_DISABLED_EDITING_ROOT_CLASS, root);
                    }
                }
            });
            if (!isEnabled) {
                editor.model.change((writer)=>{
                    writer.removeSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
                });
            }
        });
        this._enableTypeAroundUIInjection();
        this._enableInsertingParagraphsOnButtonClick();
        this._enableInsertingParagraphsOnEnterKeypress();
        this._enableInsertingParagraphsOnTypingKeystroke();
        this._enableTypeAroundFakeCaretActivationUsingKeyboardArrows();
        this._enableDeleteIntegration();
        this._enableInsertContentIntegration();
        this._enableInsertObjectIntegration();
        this._enableDeleteContentIntegration();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._currentFakeCaretModelElement = null;
    }
    /**
	 * Inserts a new paragraph next to a widget element with the selection anchored in it.
	 *
	 * **Note**: This method is heavily user-oriented and will both focus the editing view and scroll
	 * the viewport to the selection in the inserted paragraph.
	 *
	 * @param widgetModelElement The model widget element next to which a paragraph is inserted.
	 * @param position The position where the paragraph is inserted. Either `'before'` or `'after'` the widget.
	 */ _insertParagraph(widgetModelElement, position) {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const attributesToCopy = editor.model.schema.getAttributesWithProperty(widgetModelElement, 'copyOnReplace', true);
        editor.execute('insertParagraph', {
            position: editor.model.createPositionAt(widgetModelElement, position),
            attributes: attributesToCopy
        });
        editingView.focus();
        editingView.scrollToTheSelection();
    }
    /**
	 * A wrapper for the {@link module:utils/emittermixin~Emitter#listenTo} method that executes the callbacks only
	 * when the plugin {@link #isEnabled is enabled}.
	 *
	 * @param emitter The object that fires the event.
	 * @param event The name of the event.
	 * @param callback The function to be called on event.
	 * @param options Additional options.
	 */ _listenToIfEnabled(emitter, event, callback, options) {
        this.listenTo(emitter, event, (...args)=>{
            // Do not respond if the plugin is disabled.
            if (this.isEnabled) {
                callback(...args);
            }
        }, options);
    }
    /**
	 * Similar to {@link #_insertParagraph}, this method inserts a paragraph except that it
	 * does not expect a position. Instead, it performs the insertion next to a selected widget
	 * according to the `widget-type-around` model selection attribute value (fake caret position).
	 *
	 * Because this method requires the `widget-type-around` attribute to be set,
	 * the insertion can only happen when the widget's fake caret is active (e.g. activated
	 * using the keyboard).
	 *
	 * @returns Returns `true` when the paragraph was inserted (the attribute was present) and `false` otherwise.
	 */ _insertParagraphAccordingToFakeCaretPosition() {
        const editor = this.editor;
        const model = editor.model;
        const modelSelection = model.document.selection;
        const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(modelSelection);
        if (!typeAroundFakeCaretPosition) {
            return false;
        }
        // @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
        // @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'WidgetTypeAround',
        // @if CK_DEBUG_TYPING // 		'Fake caret -> insert paragraph',
        // @if CK_DEBUG_TYPING // 	) );
        // @if CK_DEBUG_TYPING // }
        const selectedModelElement = modelSelection.getSelectedElement();
        this._insertParagraph(selectedModelElement, typeAroundFakeCaretPosition);
        return true;
    }
    /**
	 * Creates a listener in the editing conversion pipeline that injects the widget type around
	 * UI into every single widget instance created in the editor.
	 *
	 * The UI is delivered as a {@link module:engine/view/uielement~ViewUIElement}
	 * wrapper which renders DOM buttons that users can use to insert paragraphs.
	 */ _enableTypeAroundUIInjection() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const t = editor.locale.t;
        const buttonTitles = {
            before: t('Insert paragraph before block'),
            after: t('Insert paragraph after block')
        };
        editor.editing.downcastDispatcher.on('insert', (evt, data, conversionApi)=>{
            const viewElement = conversionApi.mapper.toViewElement(data.item);
            if (!viewElement) {
                return;
            }
            // Filter out non-widgets and inline widgets.
            if (isTypeAroundWidget(viewElement, data.item, schema)) {
                injectUIIntoWidget(conversionApi.writer, buttonTitles, viewElement);
                const widgetLabel = viewElement.getCustomProperty('widgetLabel');
                widgetLabel.push(()=>{
                    return this.isEnabled ? t('Press Enter to type after or press Shift + Enter to type before the widget') : '';
                });
            }
        }, {
            priority: 'low'
        });
    }
    /**
	 * Brings support for the fake caret that appears when either:
	 *
	 * * the selection moves to a widget from a position next to it using arrow keys,
	 * * the arrow key is pressed when the widget is already selected.
	 *
	 * The fake caret lets the user know that they can start typing or just press
	 * <kbd>Enter</kbd> to insert a paragraph at the position next to a widget as suggested by the fake caret.
	 *
	 * The fake caret disappears when the user changes the selection or the editor
	 * gets blurred.
	 *
	 * The whole idea is as follows:
	 *
	 * 1. A user does one of the 2 scenarios described at the beginning.
	 * 2. The "keydown" listener is executed and the decision is made whether to show or hide the fake caret.
	 * 3. If it should show up, the `widget-type-around` model selection attribute is set indicating
	 *    on which side of the widget it should appear.
	 * 4. The selection dispatcher reacts to the selection attribute and sets CSS classes responsible for the
	 *    fake caret on the view widget.
	 * 5. If the fake caret should disappear, the selection attribute is removed and the dispatcher
	 *    does the CSS class clean-up in the view.
	 * 6. Additionally, `change:range` and `FocusTracker#isFocused` listeners also remove the selection
	 *    attribute (the former also removes widget CSS classes).
	 */ _enableTypeAroundFakeCaretActivationUsingKeyboardArrows() {
        const editor = this.editor;
        const model = editor.model;
        const modelSelection = model.document.selection;
        const schema = model.schema;
        const editingView = editor.editing.view;
        // This is the main listener responsible for the fake caret.
        // Note: The priority must precede the default Widget class keydown handler ("high").
        this._listenToIfEnabled(editingView.document, 'arrowKey', (evt, domEventData)=>{
            this._handleArrowKeyPress(evt, domEventData);
        }, {
            context: [
                isWidget,
                '$text'
            ],
            priority: 'high'
        });
        // This listener makes sure the widget type around selection attribute will be gone from the model
        // selection as soon as the model range changes. This attribute only makes sense when a widget is selected
        // (and the "fake horizontal caret" is visible) so whenever the range changes (e.g. selection moved somewhere else),
        // let's get rid of the attribute so that the selection downcast dispatcher isn't even bothered.
        this._listenToIfEnabled(modelSelection, 'change:range', (evt, data)=>{
            // Do not reset the selection attribute when the change was indirect.
            if (!data.directChange) {
                return;
            }
            // Get rid of the widget type around attribute of the selection on every change:range.
            // If the range changes, it means for sure, the user is no longer in the active ("fake horizontal caret") mode.
            editor.model.change((writer)=>{
                writer.removeSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
            });
        });
        // Get rid of the widget type around attribute of the selection on every document change
        // that makes widget not selected any more (i.e. widget was removed).
        this._listenToIfEnabled(model.document, 'change:data', ()=>{
            const selectedModelElement = modelSelection.getSelectedElement();
            if (selectedModelElement) {
                const selectedViewElement = editor.editing.mapper.toViewElement(selectedModelElement);
                if (isTypeAroundWidget(selectedViewElement, selectedModelElement, schema)) {
                    return;
                }
            }
            editor.model.change((writer)=>{
                writer.removeSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
            });
        });
        // React to changes of the model selection attribute made by the arrow keys listener.
        // If the block widget is selected and the attribute changes, downcast the attribute to special
        // CSS classes associated with the active ("fake horizontal caret") mode of the widget.
        this._listenToIfEnabled(editor.editing.downcastDispatcher, 'selection', (evt, data, conversionApi)=>{
            const writer = conversionApi.writer;
            if (this._currentFakeCaretModelElement) {
                const selectedViewElement = conversionApi.mapper.toViewElement(this._currentFakeCaretModelElement);
                if (selectedViewElement) {
                    // Get rid of CSS classes associated with the active ("fake horizontal caret") mode from the view widget.
                    writer.removeClass(POSSIBLE_INSERTION_POSITIONS.map(positionToWidgetCssClass), selectedViewElement);
                    this._currentFakeCaretModelElement = null;
                }
            }
            const selectedModelElement = data.selection.getSelectedElement();
            if (!selectedModelElement) {
                return;
            }
            const selectedViewElement = conversionApi.mapper.toViewElement(selectedModelElement);
            if (!isTypeAroundWidget(selectedViewElement, selectedModelElement, schema)) {
                return;
            }
            const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(data.selection);
            if (!typeAroundFakeCaretPosition) {
                return;
            }
            writer.addClass(positionToWidgetCssClass(typeAroundFakeCaretPosition), selectedViewElement);
            // Remember the view widget that got the "fake-caret" CSS class. This class should be removed ASAP when the
            // selection changes
            this._currentFakeCaretModelElement = selectedModelElement;
        });
        this._listenToIfEnabled(editor.ui.focusTracker, 'change:isFocused', (evt, name, isFocused)=>{
            if (!isFocused) {
                editor.model.change((writer)=>{
                    writer.removeSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
                });
            }
        });
        function positionToWidgetCssClass(position) {
            return `ck-widget_type-around_show-fake-caret_${position}`;
        }
    }
    /**
	 * A listener executed on each "keydown" in the view document, a part of
	 * {@link #_enableTypeAroundFakeCaretActivationUsingKeyboardArrows}.
	 *
	 * It decides whether the arrow keypress should activate the fake caret or not (also whether it should
	 * be deactivated).
	 *
	 * The fake caret activation is done by setting the `widget-type-around` model selection attribute
	 * in this listener, and stopping and preventing the event that would normally be handled by the widget
	 * plugin that is responsible for the regular keyboard navigation near/across all widgets (that
	 * includes inline widgets, which are ignored by the widget type around plugin).
	 */ _handleArrowKeyPress(evt, domEventData) {
        const editor = this.editor;
        const model = editor.model;
        const modelSelection = model.document.selection;
        const schema = model.schema;
        const editingView = editor.editing.view;
        // Selection expanding/shrinking is handled without the fake caret by the widget plugin.
        if (domEventData.shiftKey) {
            return;
        }
        const keyCode = domEventData.keyCode;
        const isForward = isForwardArrowKeyCode(keyCode, editor.locale.contentLanguageDirection);
        const selectedViewElement = editingView.document.selection.getSelectedElement();
        const selectedModelElement = editor.editing.mapper.toModelElement(selectedViewElement);
        let shouldStopAndPreventDefault;
        // Handle keyboard navigation when a type-around-compatible widget is currently selected.
        if (isTypeAroundWidget(selectedViewElement, selectedModelElement, schema)) {
            shouldStopAndPreventDefault = this._handleArrowKeyPressOnSelectedWidget(isForward);
        } else if (modelSelection.isCollapsed) {
            shouldStopAndPreventDefault = this._handleArrowKeyPressWhenSelectionNextToAWidget(isForward);
        } else if (!domEventData.shiftKey) {
            shouldStopAndPreventDefault = this._handleArrowKeyPressWhenNonCollapsedSelection(isForward);
        }
        if (shouldStopAndPreventDefault) {
            domEventData.preventDefault();
            evt.stop();
        }
    }
    /**
	 * Handles the keyboard navigation on "keydown" when a widget is currently selected and activates or deactivates
	 * the fake caret for that widget, depending on the current value of the `widget-type-around` model
	 * selection attribute and the direction of the pressed arrow key.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */ _handleArrowKeyPressOnSelectedWidget(isForward) {
        const editor = this.editor;
        const model = editor.model;
        const modelSelection = model.document.selection;
        const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(modelSelection);
        return model.change((writer)=>{
            // If the fake caret is displayed...
            if (typeAroundFakeCaretPosition) {
                const isLeavingWidget = typeAroundFakeCaretPosition === (isForward ? 'after' : 'before');
                // If the keyboard arrow works against the value of the selection attribute...
                // then remove the selection attribute but prevent default DOM actions
                // and do not let the Widget plugin listener move the selection. This brings
                // the widget back to the state, for instance, like if was selected using the mouse.
                //
                // **Note**: If leaving the widget when the fake caret is active, then the default
                // Widget handler will change the selection and, in turn, this will automatically discard
                // the selection attribute.
                if (!isLeavingWidget) {
                    writer.removeSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
                    return true;
                }
            } else {
                writer.setSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'after' : 'before');
                return true;
            }
            return false;
        });
    }
    /**
	 * Handles the keyboard navigation on "keydown" when **no** widget is selected but the selection is **directly** next
	 * to one and upon the fake caret should become active for this widget upon arrow keypress
	 * (AKA entering/selecting the widget).
	 *
	 * **Note**: This code mirrors the implementation from the widget plugin but also adds the selection attribute.
	 * Unfortunately, there is no safe way to let the widget plugin do the selection part first and then just set the
	 * selection attribute here in the widget type around plugin. This is why this code must duplicate some from the widget plugin.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */ _handleArrowKeyPressWhenSelectionNextToAWidget(isForward) {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        const widgetPlugin = editor.plugins.get('Widget');
        // This is the widget the selection is about to be set on.
        const modelElementNextToSelection = widgetPlugin._getObjectElementNextToSelection(isForward);
        const viewElementNextToSelection = editor.editing.mapper.toViewElement(modelElementNextToSelection);
        if (isTypeAroundWidget(viewElementNextToSelection, modelElementNextToSelection, schema)) {
            model.change((writer)=>{
                widgetPlugin._setSelectionOverElement(modelElementNextToSelection);
                writer.setSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'before' : 'after');
            });
            // The change() block above does the same job as the Widget plugin. The event can
            // be safely canceled.
            return true;
        }
        return false;
    }
    /**
	 * Handles the keyboard navigation on "keydown" when a widget is currently selected (together with some other content)
	 * and the widget is the first or last element in the selection. It activates or deactivates the fake caret for that widget.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */ _handleArrowKeyPressWhenNonCollapsedSelection(isForward) {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        const mapper = editor.editing.mapper;
        const modelSelection = model.document.selection;
        const selectedModelNode = isForward ? modelSelection.getLastPosition().nodeBefore : modelSelection.getFirstPosition().nodeAfter;
        const selectedViewNode = mapper.toViewElement(selectedModelNode);
        // There is a widget at the collapse position so collapse the selection to the fake caret on it.
        if (isTypeAroundWidget(selectedViewNode, selectedModelNode, schema)) {
            model.change((writer)=>{
                writer.setSelection(selectedModelNode, 'on');
                writer.setSelectionAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'after' : 'before');
            });
            return true;
        }
        return false;
    }
    /**
	 * Registers a `mousedown` listener for the view document which intercepts events
	 * coming from the widget type around UI, which happens when a user clicks one of the buttons
	 * that insert a paragraph next to a widget.
	 */ _enableInsertingParagraphsOnButtonClick() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        this._listenToIfEnabled(editingView.document, 'mousedown', (evt, domEventData)=>{
            const button = getClosestTypeAroundDomButton(domEventData.domTarget);
            if (!button) {
                return;
            }
            const buttonPosition = getTypeAroundButtonPosition(button);
            const widgetViewElement = getClosestWidgetViewElement(button, editingView.domConverter);
            const widgetModelElement = editor.editing.mapper.toModelElement(widgetViewElement);
            this._insertParagraph(widgetModelElement, buttonPosition);
            domEventData.preventDefault();
            evt.stop();
        });
    }
    /**
	 * Creates the <kbd>Enter</kbd> key listener on the view document that allows the user to insert a paragraph
	 * near the widget when either:
	 *
	 * * The fake caret was first activated using the arrow keys,
	 * * The entire widget is selected in the model.
	 *
	 * In the first case, the new paragraph is inserted according to the `widget-type-around` selection
	 * attribute (see {@link #_handleArrowKeyPress}).
	 *
	 * In the second case, the new paragraph is inserted based on whether a soft (<kbd>Shift</kbd>+<kbd>Enter</kbd>) keystroke
	 * was pressed or not.
	 */ _enableInsertingParagraphsOnEnterKeypress() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const editingView = editor.editing.view;
        this._listenToIfEnabled(editingView.document, 'enter', (evt, domEventData)=>{
            // This event could be triggered from inside the widget but we are interested
            // only when the widget is selected itself.
            if (evt.eventPhase != 'atTarget') {
                return;
            }
            const selectedModelElement = selection.getSelectedElement();
            const selectedViewElement = editor.editing.mapper.toViewElement(selectedModelElement);
            const schema = editor.model.schema;
            let wasHandled;
            // First check if the widget is selected and there's a type around selection attribute associated
            // with the fake caret that would tell where to insert a new paragraph.
            if (this._insertParagraphAccordingToFakeCaretPosition()) {
                wasHandled = true;
            } else if (isTypeAroundWidget(selectedViewElement, selectedModelElement, schema)) {
                this._insertParagraph(selectedModelElement, domEventData.isSoft ? 'before' : 'after');
                wasHandled = true;
            }
            if (wasHandled) {
                domEventData.preventDefault();
                evt.stop();
            }
        }, {
            context: isWidget
        });
    }
    /**
	 * Similar to the {@link #_enableInsertingParagraphsOnEnterKeypress}, it allows the user
	 * to insert a paragraph next to a widget when the fake caret was activated using arrow
	 * keys but it responds to typing instead of <kbd>Enter</kbd>.
	 *
	 * Listener enabled by this method will insert a new paragraph according to the `widget-type-around`
	 * model selection attribute as the user simply starts typing, which creates the impression that the fake caret
	 * behaves like a real one rendered by the browser (AKA your text appears where the caret was).
	 *
	 * **Note**: At the moment this listener creates 2 undo steps: one for the `insertParagraph` command
	 * and another one for actual typing. It is not a disaster but this may need to be fixed
	 * sooner or later.
	 */ _enableInsertingParagraphsOnTypingKeystroke() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        // Note: The priority must precede the default Input plugin insertText handler.
        this._listenToIfEnabled(viewDocument, 'insertText', (evt, data)=>{
            if (this._insertParagraphAccordingToFakeCaretPosition()) {
                // The view selection in the event data contains the widget. If the new paragraph
                // was inserted, modify the view selection passed along with the insertText event
                // so the default event handler in the Input plugin starts typing inside the paragraph.
                // Otherwise, the typing would be over the widget.
                data.selection = viewDocument.selection;
            }
        }, {
            priority: 'high'
        });
        if (env.isAndroid) {
            // On Android with English keyboard, the composition starts just by putting caret
            // at the word end or by selecting a table column. This is not a real composition started.
            // Trigger delete content on first composition key pressed.
            this._listenToIfEnabled(viewDocument, 'keydown', (evt, data)=>{
                if (data.keyCode == 229) {
                    this._insertParagraphAccordingToFakeCaretPosition();
                }
            });
        } else {
            // Note: The priority must precede the default Input plugin compositionstart handler (to call it before delete content).
            this._listenToIfEnabled(viewDocument, 'compositionstart', ()=>{
                this._insertParagraphAccordingToFakeCaretPosition();
            }, {
                priority: 'highest'
            });
        }
    }
    /**
	 * It creates a "delete" event listener on the view document to handle cases when the <kbd>Delete</kbd> or <kbd>Backspace</kbd>
	 * is pressed and the fake caret is currently active.
	 *
	 * The fake caret should create an illusion of a real browser caret so that when it appears before or after
	 * a widget, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> should remove a widget or delete the content
	 * before or after a widget (depending on the content surrounding the widget).
	 */ _enableDeleteIntegration() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const model = editor.model;
        const schema = model.schema;
        this._listenToIfEnabled(editingView.document, 'delete', (evt, domEventData)=>{
            // This event could be triggered from inside the widget but we are interested
            // only when the widget is selected itself.
            if (evt.eventPhase != 'atTarget') {
                return;
            }
            const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(model.document.selection);
            // This listener handles only these cases when the fake caret is active.
            if (!typeAroundFakeCaretPosition) {
                return;
            }
            const direction = domEventData.direction;
            const selectedModelWidget = model.document.selection.getSelectedElement();
            const isFakeCaretBefore = typeAroundFakeCaretPosition === 'before';
            const isDeleteForward = direction == 'forward';
            const shouldDeleteEntireWidget = isFakeCaretBefore === isDeleteForward;
            if (shouldDeleteEntireWidget) {
                editor.execute('delete', {
                    selection: model.createSelection(selectedModelWidget, 'on')
                });
            } else {
                const range = schema.getNearestSelectionRange(model.createPositionAt(selectedModelWidget, typeAroundFakeCaretPosition), direction);
                // If there is somewhere to move selection to, then there will be something to delete.
                if (range) {
                    // If the range is NOT collapsed, then we know that the range contains an object (see getNearestSelectionRange() docs).
                    if (!range.isCollapsed) {
                        model.change((writer)=>{
                            writer.setSelection(range);
                            editor.execute(isDeleteForward ? 'deleteForward' : 'delete');
                        });
                    } else {
                        const probe = model.createSelection(range.start);
                        model.modifySelection(probe, {
                            direction
                        });
                        // If the range is collapsed, let's see if a non-collapsed range exists that can could be deleted.
                        // If such range exists, use the editor command because it it safe for collaboration (it merges where it can).
                        if (!probe.focus.isEqual(range.start)) {
                            model.change((writer)=>{
                                writer.setSelection(range);
                                editor.execute(isDeleteForward ? 'deleteForward' : 'delete');
                            });
                        } else {
                            const deepestEmptyRangeAncestor = getDeepestEmptyElementAncestor(schema, range.start.parent);
                            model.deleteContent(model.createSelection(deepestEmptyRangeAncestor, 'on'), {
                                doNotAutoparagraph: true
                            });
                        }
                    }
                }
            }
            // If some content was deleted, don't let the handler from the Widget plugin kick in.
            // If nothing was deleted, then the default handler will have nothing to do anyway.
            domEventData.preventDefault();
            evt.stop();
        }, {
            context: isWidget
        });
    }
    /**
	 * Attaches the {@link module:engine/model/model~Model#event:insertContent} event listener that, for instance, allows the user to paste
	 * content near a widget when the fake caret is first activated using the arrow keys.
	 *
	 * The content is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
	 */ _enableInsertContentIntegration() {
        const editor = this.editor;
        const model = this.editor.model;
        const documentSelection = model.document.selection;
        this._listenToIfEnabled(editor.model, 'insertContent', (evt, [content, selectable])=>{
            if (selectable && !selectable.is('documentSelection')) {
                return;
            }
            const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(documentSelection);
            if (!typeAroundFakeCaretPosition) {
                return;
            }
            evt.stop();
            return model.change((writer)=>{
                const selectedElement = documentSelection.getSelectedElement();
                const position = model.createPositionAt(selectedElement, typeAroundFakeCaretPosition);
                const selection = writer.createSelection(position);
                const result = model.insertContent(content, selection);
                writer.setSelection(selection);
                return result;
            });
        }, {
            priority: 'high'
        });
    }
    /**
	 * Attaches the {@link module:engine/model/model~Model#event:insertObject} event listener that modifies the
	 * `options.findOptimalPosition`parameter to position of fake caret in relation to selected element
	 * to reflect user's intent of desired insertion position.
	 *
	 * The object is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
	 */ _enableInsertObjectIntegration() {
        const editor = this.editor;
        const model = this.editor.model;
        const documentSelection = model.document.selection;
        this._listenToIfEnabled(editor.model, 'insertObject', (evt, args)=>{
            const [, selectable, options = {}] = args;
            if (selectable && !selectable.is('documentSelection')) {
                return;
            }
            const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(documentSelection);
            if (!typeAroundFakeCaretPosition) {
                return;
            }
            options.findOptimalPosition = typeAroundFakeCaretPosition;
            args[3] = options;
        }, {
            priority: 'high'
        });
    }
    /**
	 * Attaches the {@link module:engine/model/model~Model#event:deleteContent} event listener to block the event when the fake
	 * caret is active.
	 *
	 * This is required for cases that trigger {@link module:engine/model/model~Model#deleteContent `model.deleteContent()`}
	 * before calling {@link module:engine/model/model~Model#insertContent `model.insertContent()`} like, for instance,
	 * plain text pasting.
	 */ _enableDeleteContentIntegration() {
        const editor = this.editor;
        const model = this.editor.model;
        const documentSelection = model.document.selection;
        this._listenToIfEnabled(editor.model, 'deleteContent', (evt, [selection])=>{
            if (selection && !selection.is('documentSelection')) {
                return;
            }
            const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(documentSelection);
            // Disable removing the selection content while pasting plain text.
            if (typeAroundFakeCaretPosition) {
                evt.stop();
            }
        }, {
            priority: 'high'
        });
    }
}
/**
 * Injects the type around UI into a view widget instance.
 */ function injectUIIntoWidget(viewWriter, buttonTitles, widgetViewElement) {
    const typeAroundWrapper = viewWriter.createUIElement('div', {
        class: 'ck ck-reset_all ck-widget__type-around'
    }, function(domDocument) {
        const wrapperDomElement = this.toDomElement(domDocument);
        injectButtons(wrapperDomElement, buttonTitles);
        injectFakeCaret(wrapperDomElement);
        return wrapperDomElement;
    });
    // Inject the type around wrapper into the widget's wrapper.
    viewWriter.insert(viewWriter.createPositionAt(widgetViewElement, 'end'), typeAroundWrapper);
}
/**
 * FYI: Not using the IconView class because each instance would need to be destroyed to avoid memory leaks
 * and it's pretty hard to figure out when a view (widget) is gone for good so it's cheaper to use raw
 * <svg> here.
 */ function injectButtons(wrapperDomElement, buttonTitles) {
    for (const position of POSSIBLE_INSERTION_POSITIONS){
        const buttonTemplate = new Template({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-widget__type-around__button',
                    `ck-widget__type-around__button_${position}`
                ],
                title: buttonTitles[position],
                'aria-hidden': 'true'
            },
            children: [
                wrapperDomElement.ownerDocument.importNode(RETURN_ARROW_ICON_ELEMENT, true)
            ]
        });
        wrapperDomElement.appendChild(buttonTemplate.render());
    }
}
function injectFakeCaret(wrapperDomElement) {
    const caretTemplate = new Template({
        tag: 'div',
        attributes: {
            class: [
                'ck',
                'ck-widget__type-around__fake-caret'
            ]
        }
    });
    wrapperDomElement.appendChild(caretTemplate.render());
}
/**
 * Returns the ancestor of an element closest to the root which is empty. For instance,
 * for `<baz>`:
 *
 * ```
 * <foo>abc<bar><baz></baz></bar></foo>
 * ```
 *
 * it returns `<bar>`.
 */ function getDeepestEmptyElementAncestor(schema, element) {
    let deepestEmptyAncestor = element;
    for (const ancestor of element.getAncestors({
        parentFirst: true
    })){
        if (ancestor.childCount > 1 || schema.isLimit(ancestor)) {
            break;
        }
        deepestEmptyAncestor = ancestor;
    }
    return deepestEmptyAncestor;
}

/**
 * Returns 'keydown' handler for up/down arrow keys that modifies the caret movement if it's in a text line next to an object.
 *
 * @param editing The editing controller.
 */ function verticalWidgetNavigationHandler(editing) {
    const model = editing.model;
    return (evt, data)=>{
        const arrowUpPressed = data.keyCode == keyCodes.arrowup;
        const arrowDownPressed = data.keyCode == keyCodes.arrowdown;
        const expandSelection = data.shiftKey;
        const selection = model.document.selection;
        if (!arrowUpPressed && !arrowDownPressed) {
            return;
        }
        const isForward = arrowDownPressed;
        // Find a range between selection and closest limit element.
        const range = findTextRangeFromSelection(editing, selection, isForward);
        // There is no selection position inside the limit element.
        if (!range) {
            return;
        }
        // If already at the edge of a limit element.
        if (range.isCollapsed) {
            // A collapsed selection at limit edge - nothing more to do.
            if (selection.isCollapsed) {
                return;
            } else if (expandSelection) {
                return;
            }
        }
        // If the range is a single line (there is no word wrapping) then move the selection to the position closest to the limit element.
        //
        // We can't move the selection directly to the isObject element (eg. table cell) because of dual position at the end/beginning
        // of wrapped line (it's at the same time at the end of one line and at the start of the next line).
        if (range.isCollapsed || isSingleLineRange(editing, range, isForward)) {
            model.change((writer)=>{
                const newPosition = isForward ? range.end : range.start;
                if (expandSelection) {
                    const newSelection = model.createSelection(selection.anchor);
                    newSelection.setFocus(newPosition);
                    writer.setSelection(newSelection);
                } else {
                    writer.setSelection(newPosition);
                }
            });
            evt.stop();
            data.preventDefault();
            data.stopPropagation();
        }
    };
}
/**
 * Finds the range between selection and closest limit element (in the direction of navigation).
 * The position next to limit element is adjusted to the closest allowed `$text` position.
 *
 * Returns `null` if, according to the schema, the resulting range cannot contain a `$text` element.
 *
 * @param editing The editing controller.
 * @param selection The current selection.
 * @param isForward The expected navigation direction.
 */ function findTextRangeFromSelection(editing, selection, isForward) {
    const model = editing.model;
    if (isForward) {
        const startPosition = selection.focus;
        const endPosition = getNearestNonInlineLimit(model, startPosition, 'forward');
        // There is no limit element, browser should handle this.
        if (!endPosition) {
            return;
        }
        const range = model.createRange(startPosition, endPosition);
        const lastRangePosition = getNearestTextPosition(model.schema, range, 'backward');
        if (lastRangePosition) {
            return model.createRange(startPosition, lastRangePosition);
        }
    } else {
        const endPosition = selection.focus;
        const startPosition = getNearestNonInlineLimit(model, endPosition, 'backward');
        // There is no limit element, browser should handle this.
        if (!startPosition) {
            return;
        }
        const range = model.createRange(startPosition, endPosition);
        const firstRangePosition = getNearestTextPosition(model.schema, range, 'forward');
        if (firstRangePosition) {
            return model.createRange(firstRangePosition, endPosition);
        }
    }
}
/**
 * Finds the limit element position that is closest to startPosition.
 *
 * @param direction Search direction.
 */ function getNearestNonInlineLimit(model, startPosition, direction) {
    const schema = model.schema;
    const range = model.createRangeIn(startPosition.root);
    const walkerValueType = direction == 'forward' ? 'elementStart' : 'elementEnd';
    for (const { previousPosition, item, type } of range.getWalker({
        startPosition,
        direction
    })){
        if (schema.isLimit(item) && !schema.isInline(item)) {
            return previousPosition;
        }
        // Stop looking for isLimit element if the next element is a block element (it is for sure not single line).
        if (type == walkerValueType && schema.isBlock(item)) {
            return null;
        }
    }
    return null;
}
/**
 * Basing on the provided range, finds the first or last (depending on `direction`) position inside the range
 * that can contain `$text` (according to schema).
 *
 * @param schema The schema.
 * @param range The range to find the position in.
 * @param direction Search direction.
 * @returns The nearest selection position.
 *
 */ function getNearestTextPosition(schema, range, direction) {
    const position = direction == 'backward' ? range.end : range.start;
    if (schema.checkChild(position, '$text')) {
        return position;
    }
    for (const { nextPosition } of range.getWalker({
        direction
    })){
        if (schema.checkChild(nextPosition, '$text')) {
            return nextPosition;
        }
    }
}
/**
 * Checks if the DOM range corresponding to the provided model range renders as a single line by analyzing DOMRects
 * (verifying if they visually wrap content to the next line).
 *
 * @param editing The editing controller.
 * @param modelRange The current table cell content range.
 * @param isForward The expected navigation direction.
 */ function isSingleLineRange(editing, modelRange, isForward) {
    const model = editing.model;
    const domConverter = editing.view.domConverter;
    // Wrapped lines contain exactly the same position at the end of current line
    // and at the beginning of next line. That position's client rect is at the end
    // of current line. In case of caret at first position of the last line that 'dual'
    // position would be detected as it's not the last line.
    if (isForward) {
        const probe = model.createSelection(modelRange.start);
        model.modifySelection(probe);
        // If the new position is at the end of the container then we can't use this position
        // because it would provide incorrect result for eg caption of image and selection
        // just before end of it. Also in this case there is no "dual" position.
        if (!probe.focus.isAtEnd && !modelRange.start.isEqual(probe.focus)) {
            modelRange = model.createRange(probe.focus, modelRange.end);
        }
    }
    const viewRange = editing.mapper.toViewRange(modelRange);
    const domRange = domConverter.viewRangeToDom(viewRange);
    const rects = Rect.getDomRangeRects(domRange);
    let boundaryVerticalPosition;
    for (const rect of rects){
        if (boundaryVerticalPosition === undefined) {
            boundaryVerticalPosition = Math.round(rect.bottom);
            continue;
        }
        // Let's check if this rect is in new line.
        if (Math.round(rect.top) >= boundaryVerticalPosition) {
            return false;
        }
        boundaryVerticalPosition = Math.max(boundaryVerticalPosition, Math.round(rect.bottom));
    }
    return true;
}

/**
 * The widget plugin. It enables base support for widgets.
 *
 * See {@glink api/widget package page} for more details and documentation.
 *
 * This plugin enables multiple behaviors required by widgets:
 *
 * * The model to view selection converter for the editing pipeline (it handles widget custom selection rendering).
 * If a converted selection wraps around a widget element, that selection is marked as
 * {@link module:engine/view/selection~ViewSelection#isFake fake}. Additionally, the `ck-widget_selected` CSS class
 * is added to indicate that widget has been selected.
 * * The mouse and keyboard events handling on and around widget elements.
 */ class Widget extends Plugin {
    /**
	 * Holds previously selected widgets.
	 */ _previouslySelected = new Set();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Widget';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            WidgetTypeAround,
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const t = editor.t;
        // Model to view selection converter.
        // Converts selection placed over widget element to fake selection.
        //
        // By default, the selection is downcasted by the engine to surround the attribute element, even though its only
        // child is an inline widget. A similar thing also happens when a collapsed marker is rendered as a UI element
        // next to an inline widget: the view selection contains both the widget and the marker.
        //
        // This prevents creating a correct fake selection when this inline widget is selected. Normalize the selection
        // in these cases based on the model:
        //
        //		[<attributeElement><inlineWidget /></attributeElement>] -> <attributeElement>[<inlineWidget />]</attributeElement>
        //		[<uiElement></uiElement><inlineWidget />] -> <uiElement></uiElement>[<inlineWidget />]
        //
        // Thanks to this:
        //
        // * fake selection can be set correctly,
        // * any logic depending on (View)Selection#getSelectedElement() also works OK.
        //
        // See https://github.com/ckeditor/ckeditor5/issues/9524.
        this.editor.editing.downcastDispatcher.on('selection', (evt, data, conversionApi)=>{
            const viewWriter = conversionApi.writer;
            const modelSelection = data.selection;
            // The collapsed selection can't contain any widget.
            if (modelSelection.isCollapsed) {
                return;
            }
            const selectedModelElement = modelSelection.getSelectedElement();
            if (!selectedModelElement) {
                return;
            }
            const selectedViewElement = editor.editing.mapper.toViewElement(selectedModelElement);
            if (!isWidget(selectedViewElement)) {
                return;
            }
            if (!conversionApi.consumable.consume(modelSelection, 'selection')) {
                return;
            }
            viewWriter.setSelection(viewWriter.createRangeOn(selectedViewElement), {
                fake: true,
                label: getLabel(selectedViewElement)
            });
        });
        // Mark all widgets inside the selection with the css class.
        // This handler is registered at the 'low' priority so it's triggered after the real selection conversion.
        this.editor.editing.downcastDispatcher.on('selection', (evt, data, conversionApi)=>{
            // Remove selected class from previously selected widgets.
            this._clearPreviouslySelectedWidgets(conversionApi.writer);
            const viewWriter = conversionApi.writer;
            const viewSelection = viewWriter.document.selection;
            let lastMarked = null;
            for (const range of viewSelection.getRanges()){
                // Note: There could be multiple selected widgets in a range but no fake selection.
                // All of them must be marked as selected, for instance [<widget></widget><widget></widget>]
                for (const value of range){
                    const node = value.item;
                    // Do not mark nested widgets in selected one. See: #4594
                    if (isWidget(node) && !isChild(node, lastMarked)) {
                        viewWriter.addClass(WIDGET_SELECTED_CLASS_NAME, node);
                        this._previouslySelected.add(node);
                        lastMarked = node;
                    }
                }
            }
        }, {
            priority: 'low'
        });
        // If mouse down is pressed on widget - create selection over whole widget.
        view.addObserver(MouseObserver);
        view.addObserver(PointerObserver);
        this.listenTo(viewDocument, 'mousedown', (...args)=>this._onMousedown(...args));
        this.listenTo(viewDocument, 'pointerdown', (...args)=>this._onPointerdown(...args));
        // There are two keydown listeners working on different priorities. This allows other
        // features such as WidgetTypeAround or TableKeyboard to attach their listeners in between
        // and customize the behavior even further in different content/selection scenarios.
        //
        // * The first listener handles changing the selection on arrow key press
        // if the widget is selected or if the selection is next to a widget and the widget
        // should become selected upon the arrow key press.
        //
        // * The second (late) listener makes sure the default browser action on arrow key press is
        // prevented when a widget is selected. This prevents the selection from being moved
        // from a fake selection container.
        this.listenTo(viewDocument, 'arrowKey', (...args)=>{
            this._handleSelectionChangeOnArrowKeyPress(...args);
        }, {
            context: [
                isWidget,
                '$text'
            ]
        });
        this.listenTo(viewDocument, 'arrowKey', (...args)=>{
            this._preventDefaultOnArrowKeyPress(...args);
        }, {
            context: '$root'
        });
        this.listenTo(viewDocument, 'arrowKey', verticalWidgetNavigationHandler(this.editor.editing), {
            context: '$text'
        });
        // Handle custom delete behaviour.
        this.listenTo(viewDocument, 'delete', (evt, data)=>{
            if (this._handleDelete(data.direction == 'forward')) {
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: '$root'
        });
        // Handle Tab/Shift+Tab key.
        this.listenTo(viewDocument, 'tab', (evt, data)=>{
            if (this._selectNextEditable(data.shiftKey ? 'backward' : 'forward')) {
                view.scrollToTheSelection();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: (node)=>isWidget(node) || node.is('editableElement'),
            priority: 'low'
        });
        // Handle Esc key while inside a nested editable.
        this.listenTo(viewDocument, 'keydown', (evt, data)=>{
            if (data.keystroke != keyCodes.esc) {
                return;
            }
            if (this._selectAncestorWidget()) {
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: (node)=>node.is('editableElement'),
            priority: 'low'
        });
        // Add the information about the keystrokes to the accessibility database.
        editor.accessibility.addKeystrokeInfoGroup({
            id: 'widget',
            label: t('Keystrokes that can be used when a widget is selected (for example: image, table, etc.)'),
            keystrokes: [
                {
                    label: t('Move focus from an editable area back to the parent widget'),
                    keystroke: 'Esc'
                },
                {
                    label: t('Insert a new paragraph directly after a widget'),
                    keystroke: 'Enter'
                },
                {
                    label: t('Insert a new paragraph directly before a widget'),
                    keystroke: 'Shift+Enter'
                },
                {
                    label: t('Move the caret to allow typing directly before a widget'),
                    keystroke: [
                        [
                            'arrowup'
                        ],
                        [
                            'arrowleft'
                        ]
                    ]
                },
                {
                    label: t('Move the caret to allow typing directly after a widget'),
                    keystroke: [
                        [
                            'arrowdown'
                        ],
                        [
                            'arrowright'
                        ]
                    ]
                }
            ]
        });
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:mousedown mousedown} events on widget elements.
	 */ _onMousedown(eventInfo, domEventData) {
        const element = domEventData.target;
        // Some of DOM elements have no view element representation so it may be null.
        if (!element) {
            return;
        }
        // If triple click should select entire paragraph.
        if (domEventData.domEvent.detail >= 3) {
            if (this._selectBlockContent(element)) {
                domEventData.preventDefault();
            }
        }
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:pointerdown pointerdown} events on widget elements.
	 */ _onPointerdown(eventInfo, domEventData) {
        if (!domEventData.domEvent.isPrimary) {
            return;
        }
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        let element = domEventData.target;
        // Some of DOM elements have no view element representation so it may be null.
        if (!element) {
            return;
        }
        // If target is not a widget element - check if one of the ancestors is.
        if (!isWidget(element)) {
            const editableOrWidgetElement = findClosestEditableOrWidgetAncestor(element);
            if (!editableOrWidgetElement) {
                return;
            }
            if (isWidget(editableOrWidgetElement)) {
                element = editableOrWidgetElement;
            } else {
                // Pick view range from the point where the mouse was clicked.
                const clickTargetFromPoint = getElementFromMouseEvent(view, domEventData);
                if (clickTargetFromPoint && isWidget(clickTargetFromPoint)) {
                    element = clickTargetFromPoint;
                } else {
                    return;
                }
            }
        }
        // On Android and iOS selection would jump to the first table cell, on other devices
        // we can't block it (and don't need to) because of drag and drop support.
        // In iOS drag and drop works anyway on a long press.
        if (env.isAndroid || env.isiOS) {
            domEventData.preventDefault();
        }
        // Focus editor if is not focused already.
        if (!viewDocument.isFocused) {
            view.focus();
        }
        // Create model selection over widget.
        const modelElement = editor.editing.mapper.toModelElement(element);
        this._setSelectionOverElement(modelElement);
    }
    /**
	 * Selects entire block content, e.g. on triple click it selects entire paragraph.
	 */ _selectBlockContent(element) {
        const editor = this.editor;
        const model = editor.model;
        const mapper = editor.editing.mapper;
        const schema = model.schema;
        const viewElement = mapper.findMappedViewAncestor(this.editor.editing.view.createPositionAt(element, 0));
        const modelElement = findTextBlockAncestor(mapper.toModelElement(viewElement), model.schema);
        if (!modelElement) {
            return false;
        }
        model.change((writer)=>{
            const nextTextBlock = !schema.isLimit(modelElement) ? findNextTextBlock(writer.createPositionAfter(modelElement), schema) : null;
            const start = writer.createPositionAt(modelElement, 0);
            const end = nextTextBlock ? writer.createPositionAt(nextTextBlock, 0) : writer.createPositionAt(modelElement, 'end');
            writer.setSelection(writer.createRange(start, end));
        });
        return true;
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:keydown keydown} events and changes
	 * the model selection when:
	 *
	 * * arrow key is pressed when the widget is selected,
	 * * the selection is next to a widget and the widget should become selected upon the arrow key press.
	 *
	 * See {@link #_preventDefaultOnArrowKeyPress}.
	 */ _handleSelectionChangeOnArrowKeyPress(eventInfo, domEventData) {
        const keyCode = domEventData.keyCode;
        const model = this.editor.model;
        const schema = model.schema;
        const modelSelection = model.document.selection;
        const selectedElement = modelSelection.getSelectedElement();
        const direction = getLocalizedArrowKeyCodeDirection(keyCode, this.editor.locale.contentLanguageDirection);
        const isForward = direction == 'down' || direction == 'right';
        const isVerticalNavigation = direction == 'up' || direction == 'down';
        // Collapsing a non-collapsed selection.
        if (!domEventData.shiftKey && !modelSelection.isCollapsed) {
            // If object element is selected or object is at the edge of selection.
            if (hasObjectAtEdge(modelSelection, schema)) {
                const position = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
                const newRange = schema.getNearestSelectionRange(position, isForward ? 'forward' : 'backward');
                if (newRange) {
                    model.change((writer)=>{
                        writer.setSelection(newRange);
                    });
                    domEventData.preventDefault();
                    eventInfo.stop();
                }
            }
            // Else is handled by the browser.
            return;
        }
        // Adjust selection for fake caret and for selection direction when single object is selected.
        const originalSelection = getModelSelectionAdjusted(model, isForward);
        // Clone current selection to use it as a probe. We must leave default selection as it is so it can return
        // to its current state after undo.
        const probe = model.createSelection(originalSelection);
        model.modifySelection(probe, {
            direction: isForward ? 'forward' : 'backward'
        });
        // The selection didn't change so there is nothing there.
        if (probe.isEqual(originalSelection)) {
            return;
        }
        // Move probe one step further to make it visually recognizable
        // but only when there is a block allowing text, and we are not already on the exiting edge of it.
        if (probe.focus.isTouching(originalSelection.focus) && schema.checkChild(probe.focus.parent, '$text') && (isForward ? !probe.focus.isAtEnd : !probe.focus.isAtStart)) {
            model.modifySelection(probe, {
                direction: isForward ? 'forward' : 'backward'
            });
        }
        const lastSelectedNode = isForward ? originalSelection.focus.nodeBefore : originalSelection.focus.nodeAfter;
        const nodeBeforeProbe = probe.focus.nodeBefore;
        const nodeAfterProbe = probe.focus.nodeAfter;
        const lastProbeNode = isForward ? nodeBeforeProbe : nodeAfterProbe;
        if (domEventData.shiftKey) {
            // Expand selection from a selected object or include object in selection.
            if (selectedElement && schema.isObject(selectedElement) || lastProbeNode && schema.isObject(lastProbeNode) || lastSelectedNode && schema.isObject(lastSelectedNode)) {
                model.change((writer)=>{
                    writer.setSelection(probe);
                });
                domEventData.preventDefault();
                eventInfo.stop();
            }
        } else {
            // Select an object when moving caret over it.
            if (lastProbeNode && schema.isObject(lastProbeNode)) {
                if (schema.isInline(lastProbeNode) && isVerticalNavigation) {
                    return;
                }
                model.change((writer)=>{
                    writer.setSelection(lastProbeNode, 'on');
                });
                domEventData.preventDefault();
                eventInfo.stop();
            }
        }
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:keydown keydown} events and prevents
	 * the default browser behavior to make sure the fake selection is not being moved from a fake selection
	 * container.
	 *
	 * See {@link #_handleSelectionChangeOnArrowKeyPress}.
	 */ _preventDefaultOnArrowKeyPress(eventInfo, domEventData) {
        const model = this.editor.model;
        const schema = model.schema;
        const objectElement = model.document.selection.getSelectedElement();
        // If object element is selected.
        if (objectElement && schema.isObject(objectElement)) {
            domEventData.preventDefault();
            eventInfo.stop();
        }
    }
    /**
	 * Handles delete keys: backspace and delete.
	 *
	 * @param isForward Set to true if delete was performed in forward direction.
	 * @returns Returns `true` if keys were handled correctly.
	 */ _handleDelete(isForward) {
        const modelDocument = this.editor.model.document;
        const modelSelection = modelDocument.selection;
        // Do nothing when the read only mode is enabled.
        if (!this.editor.model.canEditAt(modelSelection)) {
            return;
        }
        // Do nothing on non-collapsed selection.
        if (!modelSelection.isCollapsed) {
            return;
        }
        const objectElement = this._getObjectElementNextToSelection(isForward);
        if (objectElement) {
            this.editor.model.change((writer)=>{
                let previousNode = modelSelection.anchor.parent;
                // Remove previous element if empty.
                while(previousNode.isEmpty){
                    const nodeToRemove = previousNode;
                    previousNode = nodeToRemove.parent;
                    writer.remove(nodeToRemove);
                }
                this._setSelectionOverElement(objectElement);
            });
            return true;
        }
    }
    /**
	 * Sets {@link module:engine/model/selection~ModelSelection document's selection} over given element.
	 *
	 * @internal
	 */ _setSelectionOverElement(element) {
        this.editor.model.change((writer)=>{
            writer.setSelection(writer.createRangeOn(element));
        });
    }
    /**
	 * Checks if {@link module:engine/model/element~ModelElement element} placed next to the current
	 * {@link module:engine/model/selection~ModelSelection model selection} exists and is marked in
	 * {@link module:engine/model/schema~ModelSchema schema} as `object`.
	 *
	 * @internal
	 * @param forward Direction of checking.
	 */ _getObjectElementNextToSelection(forward) {
        const model = this.editor.model;
        const schema = model.schema;
        const modelSelection = model.document.selection;
        // Clone current selection to use it as a probe. We must leave default selection as it is so it can return
        // to its current state after undo.
        const probe = model.createSelection(modelSelection);
        model.modifySelection(probe, {
            direction: forward ? 'forward' : 'backward'
        });
        // The selection didn't change so there is nothing there.
        if (probe.isEqual(modelSelection)) {
            return null;
        }
        const objectElement = forward ? probe.focus.nodeBefore : probe.focus.nodeAfter;
        if (objectElement && schema.isObject(objectElement)) {
            return objectElement;
        }
        return null;
    }
    /**
	 * Removes CSS class from previously selected widgets.
	 */ _clearPreviouslySelectedWidgets(writer) {
        for (const widget of this._previouslySelected){
            writer.removeClass(WIDGET_SELECTED_CLASS_NAME, widget);
        }
        this._previouslySelected.clear();
    }
    /**
	 * Moves the document selection into the next editable or block widget.
	 */ _selectNextEditable(direction) {
        const editing = this.editor.editing;
        const view = editing.view;
        const model = this.editor.model;
        const viewSelection = view.document.selection;
        const modelSelection = model.document.selection;
        // Find start position.
        let startPosition;
        // Multiple table cells are selected - use focus cell.
        if (modelSelection.rangeCount > 1) {
            const selectionRange = modelSelection.isBackward ? modelSelection.getFirstRange() : modelSelection.getLastRange();
            startPosition = editing.mapper.toViewPosition(direction == 'forward' ? selectionRange.end : selectionRange.start);
        } else {
            startPosition = direction == 'forward' ? viewSelection.getFirstPosition() : viewSelection.getLastPosition();
        }
        const modelRange = this._findNextFocusRange(startPosition, direction);
        if (modelRange) {
            model.change((writer)=>{
                writer.setSelection(modelRange);
            });
            return true;
        }
        return false;
    }
    /**
	 * Looks for next focus point in the document starting from the given view position and direction.
	 * The focus point is either a block widget or an editable.
	 *
	 * @internal
	 */ _findNextFocusRange(startPosition, direction) {
        const editing = this.editor.editing;
        const view = editing.view;
        const model = this.editor.model;
        const viewSelection = view.document.selection;
        const editableElement = viewSelection.editableElement;
        const editablePath = editableElement.getPath();
        let selectedElement = viewSelection.getSelectedElement();
        if (selectedElement && !isWidget(selectedElement)) {
            selectedElement = null;
        }
        // Look for the next editable.
        const viewRange = direction == 'forward' ? view.createRange(startPosition, view.createPositionAt(startPosition.root, 'end')) : view.createRange(view.createPositionAt(startPosition.root, 0), startPosition);
        for (const { nextPosition } of viewRange.getWalker({
            direction
        })){
            const item = nextPosition.parent;
            // Some widget along the way except the currently selected one.
            if (isWidget(item) && item != selectedElement) {
                const modelElement = editing.mapper.toModelElement(item);
                // Do not select inline widgets.
                if (!model.schema.isBlock(modelElement)) {
                    continue;
                }
                // Do not select widget itself when going out of widget or iterating over sibling elements in a widget.
                if (compareArrays(editablePath, item.getPath()) != 'extension') {
                    return model.createRangeOn(modelElement);
                }
            } else if (item.is('editableElement')) {
                // Ignore the current editable for text selection,
                // but use it when widget was selected to be able to jump after the widget.
                if (item == editableElement && !selectedElement) {
                    continue;
                }
                const modelPosition = editing.mapper.toModelPosition(nextPosition);
                const newRange = model.schema.getNearestSelectionRange(modelPosition, direction);
                // There is nothing to select so just jump to the next one.
                if (!newRange) {
                    continue;
                }
                // In the same editable while widget was selected - do not select the editable content.
                if (item == editableElement && selectedElement) {
                    return newRange;
                }
                // Select the content of editable element when iterating over sibling editable elements
                // or going deeper into nested widgets.
                if (compareArrays(editablePath, item.getPath()) != 'extension') {
                    // Find a limit element closest to the new selection range.
                    return model.createRangeIn(model.schema.getLimitElement(newRange));
                }
                return newRange;
            }
        }
        return null;
    }
    /**
	 * Updates the document selection so that it selects first ancestor widget.
	 */ _selectAncestorWidget() {
        const editor = this.editor;
        const mapper = editor.editing.mapper;
        const selection = editor.editing.view.document.selection;
        const positionParent = selection.getFirstPosition().parent;
        const positionParentElement = positionParent.is('$text') ? positionParent.parent : positionParent;
        const viewElement = positionParentElement.findAncestor(isWidget);
        if (!viewElement) {
            return false;
        }
        const modelElement = mapper.toModelElement(viewElement);
        /* istanbul ignore next -- @preserve */ if (!modelElement) {
            return false;
        }
        editor.model.change((writer)=>{
            writer.setSelection(modelElement, 'on');
        });
        return true;
    }
}
/**
 * Returns true if there is an object on an edge of the given selection.
 */ function hasObjectAtEdge(modelSelection, schema) {
    const firstPosition = modelSelection.getFirstPosition();
    const lastPosition = modelSelection.getLastPosition();
    const firstSelectedNode = firstPosition.nodeAfter;
    const lastSelectedNode = lastPosition.nodeBefore;
    return !!firstSelectedNode && schema.isObject(firstSelectedNode) || !!lastSelectedNode && schema.isObject(lastSelectedNode);
}
/**
 * Returns new instance of the model selection adjusted for fake caret and selection direction on widgets.
 */ function getModelSelectionAdjusted(model, isForward) {
    const modelSelection = model.document.selection;
    const selectedElement = modelSelection.getSelectedElement();
    // Adjust selection for fake caret.
    const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition(modelSelection);
    if (selectedElement && typeAroundFakeCaretPosition == 'before') {
        return model.createSelection(selectedElement, 'before');
    } else if (selectedElement && typeAroundFakeCaretPosition == 'after') {
        return model.createSelection(selectedElement, 'after');
    }
    // Make a copy of selection with adjusted direction for object selected.
    return model.createSelection(modelSelection.getRanges(), {
        backward: !!selectedElement && model.schema.isObject(selectedElement) ? !isForward : modelSelection.isBackward
    });
}
/**
 * Finds the closest ancestor element that is either an editable element or a widget.
 *
 * @param element The element from which to start searching.
 * @returns The closest ancestor element that is either an editable element or a widget, or null if none is found.
 */ function findClosestEditableOrWidgetAncestor(element) {
    let currentElement = element;
    while(currentElement){
        if (currentElement.is('editableElement') || isWidget(currentElement)) {
            return currentElement;
        }
        currentElement = currentElement.parent;
    }
    return null;
}
/**
 * Retrieves the ViewElement associated with a mouse event in the editing view.
 *
 * @param view The editing view.
 * @param domEventData The DOM event data containing the mouse event.
 * @returns The ViewElement associated with the mouse event, or null if not found.
 */ function getElementFromMouseEvent(view, domEventData) {
    const domRange = getRangeFromMouseEvent(domEventData.domEvent);
    let viewRange = null;
    if (domRange) {
        viewRange = view.domConverter.domRangeToView(domRange);
    } else {
        // Fallback to create range in target element. It happens frequently on Safari browser.
        // See more: https://github.com/ckeditor/ckeditor5/issues/16978
        viewRange = view.createRange(view.createPositionAt(domEventData.target, 0));
    }
    if (!viewRange) {
        return null;
    }
    const viewPosition = viewRange.start;
    if (!viewPosition.parent) {
        return null;
    }
    let viewNode = viewPosition.parent;
    if (viewPosition.parent.is('editableElement')) {
        if (viewPosition.isAtEnd && viewPosition.nodeBefore) {
            // Click after a widget tend to return position at the end of the editable element
            // so use the node before it if range is at the end of a parent.
            viewNode = viewPosition.nodeBefore;
        } else if (viewPosition.isAtStart && viewPosition.nodeAfter) {
            // Click before a widget tend to return position at the start of the editable element
            // so use the node after it if range is at the start of a parent.
            // See more: https://github.com/ckeditor/ckeditor5/issues/16992
            viewNode = viewPosition.nodeAfter;
        }
    }
    if (viewNode.is('$text')) {
        return viewNode.parent;
    }
    return viewNode;
}
/**
 * Checks whether the specified `element` is a child of the `parent` element.
 *
 * @param element An element to check.
 * @param parent A parent for the element.
 */ function isChild(element, parent) {
    if (!parent) {
        return false;
    }
    return Array.from(element.getAncestors()).includes(parent);
}
/**
 * Returns nearest text block ancestor.
 */ function findTextBlockAncestor(modelElement, schema) {
    for (const element of modelElement.getAncestors({
        includeSelf: true,
        parentFirst: true
    })){
        if (schema.checkChild(element, '$text')) {
            return element;
        }
        // Do not go beyond nested editable.
        if (schema.isLimit(element) && !schema.isObject(element)) {
            break;
        }
    }
    return null;
}
/**
 * Returns next text block where could put selection.
 */ function findNextTextBlock(position, schema) {
    const treeWalker = new ModelTreeWalker({
        startPosition: position
    });
    for (const { item } of treeWalker){
        if (schema.isLimit(item) || !item.is('element')) {
            return null;
        }
        if (schema.checkChild(item, '$text')) {
            return item;
        }
    }
    return null;
}

/**
 * Widget toolbar repository plugin. A central point for registering widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes a concise API.
 *
 * To add a toolbar for your widget use the {@link ~WidgetToolbarRepository#register `WidgetToolbarRepository#register()`} method.
 *
 * The following example comes from the {@link module:image/imagetoolbar~ImageToolbar} plugin:
 *
 * ```ts
 * class ImageToolbar extends Plugin {
 * 	static get requires() {
 * 		return [ WidgetToolbarRepository ];
 * 	}
 *
 * 	afterInit() {
 * 		const editor = this.editor;
 * 		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
 *
 * 		widgetToolbarRepository.register( 'image', {
 * 			items: editor.config.get( 'image.toolbar' ),
 * 			getRelatedElement: getClosestSelectedImageWidget
 * 		} );
 * 	}
 * }
 * ```
 */ class WidgetToolbarRepository extends Plugin {
    /**
	 * A map of toolbar definitions.
	 */ _toolbarDefinitions = new Map();
    _balloon;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'WidgetToolbarRepository';
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
        // Disables the default balloon toolbar for all widgets.
        if (editor.plugins.has('BalloonToolbar')) {
            const balloonToolbar = editor.plugins.get('BalloonToolbar');
            this.listenTo(balloonToolbar, 'show', (evt)=>{
                if (isWidgetSelected(editor.editing.view.document.selection)) {
                    evt.stop();
                }
            }, {
                priority: 'high'
            });
        }
        this._balloon = this.editor.plugins.get('ContextualBalloon');
        this.on('change:isEnabled', ()=>{
            this._updateToolbarsVisibility();
        });
        this.listenTo(editor.ui, 'update', ()=>{
            this._updateToolbarsVisibility();
        });
        // UI#update is not fired after focus is back in editor, we need to check if balloon panel should be visible.
        this.listenTo(editor.ui.focusTracker, 'change:isFocused', ()=>{
            this._updateToolbarsVisibility();
        }, {
            priority: 'low'
        });
    }
    destroy() {
        super.destroy();
        for (const toolbarConfig of this._toolbarDefinitions.values()){
            toolbarConfig.view.destroy();
        }
    }
    /**
	 * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
	 * `getRelatedElement` function. Toolbar items are gathered from `items` array.
	 * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
	 *
	 * Note: This method should be called in the {@link module:core/plugin~PluginInterface#afterInit `Plugin#afterInit()`}
	 * callback (or later) to make sure that the given toolbar items were already registered by other plugins.
	 *
	 * @param toolbarId An id for the toolbar. Used to
	 * @param options Detailed options
	 * @param options.ariaLabel Label used by assistive technologies to describe this toolbar element.
	 * @param options.items Array of toolbar items.
	 * @param options.getRelatedElement Callback which returns an element the toolbar should be attached to.
	 * @param options.balloonClassName CSS class for the widget balloon.
	 */ register(toolbarId, { ariaLabel, items, getRelatedElement, balloonClassName = 'ck-toolbar-container', positions }) {
        // Trying to register a toolbar without any item.
        if (!items.length) {
            /**
			 * When {@link module:widget/widgettoolbarrepository~WidgetToolbarRepository#register registering} a new widget toolbar, you
			 * need to provide a non-empty array with the items that will be inserted into the toolbar.
			 *
			 * If you see this error when integrating the editor, you likely forgot to configure one of the widget toolbars.
			 *
			 * See for instance:
			 *
			 * * {@link module:table/tableconfig~TableConfig#contentToolbar `config.table.contentToolbar`}
			 * * {@link module:image/imageconfig~ImageConfig#toolbar `config.image.toolbar`}
			 *
			 * @error widget-toolbar-no-items
			 * @param {string} toolbarId The id of the toolbar that has not been configured correctly.
			 */ logWarning('widget-toolbar-no-items', {
                toolbarId
            });
            return;
        }
        const editor = this.editor;
        const t = editor.t;
        const toolbarView = new ToolbarView(editor.locale);
        toolbarView.ariaLabel = ariaLabel || t('Widget toolbar');
        if (this._toolbarDefinitions.has(toolbarId)) {
            /**
			 * Toolbar with the given id was already added.
			 *
			 * @error widget-toolbar-duplicated
			 * @param {string} toolbarId Toolbar id.
			 */ throw new CKEditorError('widget-toolbar-duplicated', this, {
                toolbarId
            });
        }
        const toolbarDefinition = {
            view: toolbarView,
            getRelatedElement,
            balloonClassName,
            itemsConfig: items,
            positions,
            initialized: false
        };
        // Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
        editor.ui.addToolbar(toolbarView, {
            isContextual: true,
            beforeFocus: ()=>{
                const relatedElement = getRelatedElement(editor.editing.view.document.selection);
                if (relatedElement) {
                    this._showToolbar(toolbarDefinition, relatedElement);
                }
            },
            afterBlur: ()=>{
                this._hideToolbar(toolbarDefinition);
            }
        });
        this._toolbarDefinitions.set(toolbarId, toolbarDefinition);
    }
    /**
	 * Iterates over stored toolbars and makes them visible or hidden.
	 */ _updateToolbarsVisibility() {
        let maxRelatedElementDepth = 0;
        let deepestRelatedElement = null;
        let deepestToolbarDefinition = null;
        for (const definition of this._toolbarDefinitions.values()){
            const relatedElement = definition.getRelatedElement(this.editor.editing.view.document.selection);
            if (!this.isEnabled || !relatedElement) {
                if (this._isToolbarInBalloon(definition)) {
                    this._hideToolbar(definition);
                }
            } else if (!this.editor.ui.focusTracker.isFocused) {
                if (this._isToolbarVisible(definition)) {
                    this._hideToolbar(definition);
                }
            } else {
                const relatedElementDepth = relatedElement.getAncestors().length;
                // Many toolbars can express willingness to be displayed but they do not know about
                // each other. Figure out which toolbar is deepest in the view tree to decide which
                // should be displayed. For instance, if a selected image is inside a table cell, display
                // the ImageToolbar rather than the TableToolbar (#60).
                if (relatedElementDepth > maxRelatedElementDepth) {
                    maxRelatedElementDepth = relatedElementDepth;
                    deepestRelatedElement = relatedElement;
                    deepestToolbarDefinition = definition;
                }
            }
        }
        if (deepestToolbarDefinition) {
            this._showToolbar(deepestToolbarDefinition, deepestRelatedElement);
        }
    }
    /**
	 * Hides the given toolbar.
	 */ _hideToolbar(toolbarDefinition) {
        this._balloon.remove(toolbarDefinition.view);
        this.stopListening(this._balloon, 'change:visibleView');
    }
    /**
	 * Shows up the toolbar if the toolbar is not visible.
	 * Otherwise, repositions the toolbar's balloon when toolbar's view is the most top view in balloon stack.
	 *
	 * It might happen here that the toolbar's view is under another view. Then do nothing as the other toolbar view
	 * should be still visible after the {@link module:ui/editorui/editorui~EditorUI#event:update}.
	 */ _showToolbar(toolbarDefinition, relatedElement) {
        if (this._isToolbarVisible(toolbarDefinition)) {
            repositionContextualBalloon(this.editor, relatedElement, toolbarDefinition.positions);
        } else if (!this._isToolbarInBalloon(toolbarDefinition)) {
            if (!toolbarDefinition.initialized) {
                toolbarDefinition.initialized = true;
                toolbarDefinition.view.fillFromConfig(toolbarDefinition.itemsConfig, this.editor.ui.componentFactory);
            }
            this._balloon.add({
                view: toolbarDefinition.view,
                position: getBalloonPositionData(this.editor, relatedElement, toolbarDefinition.positions),
                balloonClassName: toolbarDefinition.balloonClassName
            });
            // Update toolbar position each time stack with toolbar view is switched to visible.
            // This is in a case target element has changed when toolbar was in invisible stack
            // e.g. target image was wrapped by a block quote.
            // See https://github.com/ckeditor/ckeditor5-widget/issues/92.
            this.listenTo(this._balloon, 'change:visibleView', ()=>{
                for (const definition of this._toolbarDefinitions.values()){
                    if (this._isToolbarVisible(definition)) {
                        const relatedElement = definition.getRelatedElement(this.editor.editing.view.document.selection);
                        repositionContextualBalloon(this.editor, relatedElement, toolbarDefinition.positions);
                    }
                }
            });
        }
    }
    _isToolbarVisible(toolbar) {
        return this._balloon.visibleView === toolbar.view;
    }
    _isToolbarInBalloon(toolbar) {
        return this._balloon.hasView(toolbar.view);
    }
}
function repositionContextualBalloon(editor, relatedElement, positions) {
    const balloon = editor.plugins.get('ContextualBalloon');
    const position = getBalloonPositionData(editor, relatedElement, positions);
    balloon.updatePosition(position);
}
function getBalloonPositionData(editor, relatedElement, positions) {
    const editingView = editor.editing.view;
    const defaultPositions = BalloonPanelView.defaultPositions;
    return {
        target: editingView.domConverter.mapViewToDom(relatedElement),
        positions: positions || [
            defaultPositions.northArrowSouth,
            defaultPositions.northArrowSouthWest,
            defaultPositions.northArrowSouthEast,
            defaultPositions.southArrowNorth,
            defaultPositions.southArrowNorthWest,
            defaultPositions.southArrowNorthEast,
            defaultPositions.viewportStickyNorth
        ]
    };
}
function isWidgetSelected(selection) {
    const viewElement = selection.getSelectedElement();
    return !!(viewElement && isWidget(viewElement));
}

/**
 * Stores the internal state of a single resizable object.
 */ class WidgetResizeState extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * The reference point of the resizer where the dragging started. It is used to measure the distance the user cursor
	 * traveled, so how much the image should be enlarged.
	 * This information is only known after the DOM was rendered, so it will be updated later.
	 *
	 * @internal
	 */ _referenceCoordinates;
    /**
	 * Resizer options.
	 */ _options;
    /**
	 * The original width (pixels) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */ _originalWidth;
    /**
	 * The original height (pixels) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */ _originalHeight;
    /**
	 * The original width (percents) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */ _originalWidthPercents;
    /**
	 * A width to height ratio of the resized image.
	 *
	 * @readonly
	 */ _aspectRatio;
    /**
	 * @param options Resizer options.
	 */ constructor(options){
        super();
        this.set('activeHandlePosition', null);
        this.set('proposedWidthPercents', null);
        this.set('proposedWidth', null);
        this.set('proposedHeight', null);
        this.set('proposedHandleHostWidth', null);
        this.set('proposedHandleHostHeight', null);
        this._options = options;
        this._referenceCoordinates = null;
    }
    /**
	 * The original width (pixels) of the resized object when the resize process was started.
	 */ get originalWidth() {
        return this._originalWidth;
    }
    /**
	 * The original height (pixels) of the resized object when the resize process was started.
	 */ get originalHeight() {
        return this._originalHeight;
    }
    /**
	 * The original width (percents) of the resized object when the resize process was started.
	 */ get originalWidthPercents() {
        return this._originalWidthPercents;
    }
    /**
	 * A width to height ratio of the resized image.
	 */ get aspectRatio() {
        return this._aspectRatio;
    }
    /**
	 *
	 * @param domResizeHandle The handle used to calculate the reference point.
	 */ begin(domResizeHandle, domHandleHost, domResizeHost) {
        const clientRect = new Rect(domHandleHost);
        this.activeHandlePosition = getHandlePosition(domResizeHandle);
        this._referenceCoordinates = getAbsoluteBoundaryPoint(domHandleHost, getOppositePosition(this.activeHandlePosition));
        this._originalWidth = clientRect.width;
        this._originalHeight = clientRect.height;
        this._aspectRatio = clientRect.width / clientRect.height;
        const widthStyle = domResizeHost.style.width;
        if (widthStyle && widthStyle.match(/^\d+(\.\d*)?%$/)) {
            this._originalWidthPercents = parseFloat(widthStyle);
        } else {
            this._originalWidthPercents = calculateResizeHostPercentageWidth(domResizeHost, clientRect);
        }
    }
    update(newSize) {
        this.proposedWidth = newSize.width;
        this.proposedHeight = newSize.height;
        this.proposedWidthPercents = newSize.widthPercents;
        this.proposedHandleHostWidth = newSize.handleHostWidth;
        this.proposedHandleHostHeight = newSize.handleHostHeight;
    }
}
/**
 * Returns coordinates of the top-left corner of an element, relative to the document's top-left corner.
 *
 * @param resizerPosition The position of the resize handle, e.g. `"top-left"`, `"bottom-right"`.
 */ function getAbsoluteBoundaryPoint(element, resizerPosition) {
    const elementRect = new Rect(element);
    const positionParts = resizerPosition.split('-');
    const ret = {
        x: positionParts[1] == 'right' ? elementRect.right : elementRect.left,
        y: positionParts[0] == 'bottom' ? elementRect.bottom : elementRect.top
    };
    ret.x += element.ownerDocument.defaultView.scrollX;
    ret.y += element.ownerDocument.defaultView.scrollY;
    return ret;
}
/**
 * @param resizerPosition The expected resizer position, like `"top-left"`, `"bottom-right"`.
 * @returns A prefixed HTML class name for the resizer element.
 */ function getResizerHandleClass(resizerPosition) {
    return `ck-widget__resizer__handle-${resizerPosition}`;
}
/**
 * Determines the position of a given resize handle.
 *
 * @param domHandle Handle used to calculate the reference point.
 * @returns Returns a string like `"top-left"` or `undefined` if not matched.
 */ function getHandlePosition(domHandle) {
    const resizerPositions = [
        'top-left',
        'top-right',
        'bottom-right',
        'bottom-left'
    ];
    for (const position of resizerPositions){
        if (domHandle.classList.contains(getResizerHandleClass(position))) {
            return position;
        }
    }
}
/**
 * @param position Like `"top-left"`.
 * @returns Inverted `position`, e.g. it returns `"bottom-right"` if `"top-left"` was given as `position`.
 */ function getOppositePosition(position) {
    const parts = position.split('-');
    const replacements = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    };
    return `${replacements[parts[0]]}-${replacements[parts[1]]}`;
}

/**
 * A view displaying the proposed new element size during the resizing.
 *
 * @internal
 */ class SizeView extends View {
    constructor(){
        super();
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-size-view',
                    bind.to('_viewPosition', (value)=>value ? `ck-orientation-${value}` : '')
                ],
                style: {
                    display: bind.if('_isVisible', 'none', (visible)=>!visible)
                }
            },
            children: [
                {
                    text: bind.to('_label')
                }
            ]
        });
    }
    /**
	 * A method used for binding the `SizeView` instance properties to the `ResizeState` instance observable properties.
	 *
	 * @internal
	 * @param options An object defining the resizer options, used for setting the proper size label.
	 * @param resizeState The `ResizeState` class instance, used for keeping the `SizeView` state up to date.
	 */ _bindToState(options, resizeState) {
        this.bind('_isVisible').to(resizeState, 'proposedWidth', resizeState, 'proposedHeight', (width, height)=>width !== null && height !== null);
        this.bind('_label').to(resizeState, 'proposedHandleHostWidth', resizeState, 'proposedHandleHostHeight', resizeState, 'proposedWidthPercents', (width, height, widthPercents)=>{
            if (options.unit === 'px') {
                return `${width}×${height}`;
            } else {
                return `${widthPercents}%`;
            }
        });
        this.bind('_viewPosition').to(resizeState, 'activeHandlePosition', resizeState, 'proposedHandleHostWidth', resizeState, 'proposedHandleHostHeight', // If the widget is too small to contain the size label, display the label above.
        (position, width, height)=>width < 50 || height < 50 ? 'above-center' : position);
    }
    /**
	 * A method used for cleaning up. It removes the bindings and hides the view.
	 *
	 * @internal
	 */ _dismiss() {
        this.unbind();
        this._isVisible = false;
    }
}

/**
 * Represents a resizer for a single resizable object.
 */ class WidgetResizer extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
	 *
	 * Note that a new state is created for each resize transaction.
	 */ _state;
    /**
	 * A view displaying the proposed new element size during the resizing.
	 */ _sizeView;
    /**
	 * Options passed to the {@link #constructor}.
	 */ _options;
    /**
	 * A wrapper that is controlled by the resizer. This is usually a widget element.
	 */ _viewResizerWrapper = null;
    /**
	 * The width of the resized {@link module:widget/widgetresize~WidgetResizerOptions#viewElement viewElement} before the resizing started.
	 */ _initialViewWidth;
    /**
	 * @param options Resizer options.
	 */ constructor(options){
        super();
        this._options = options;
        this.set('isEnabled', true);
        this.set('isSelected', false);
        this.bind('isVisible').to(this, 'isEnabled', this, 'isSelected', (isEnabled, isSelected)=>isEnabled && isSelected);
        this.decorate('begin');
        this.decorate('cancel');
        this.decorate('commit');
        this.decorate('updateSize');
        this.on('commit', (event)=>{
            // State might not be initialized yet. In this case, prevent further handling and make sure that the resizer is
            // cleaned up (#5195).
            if (!this.state.proposedWidth && !this.state.proposedWidthPercents) {
                this._cleanup();
                event.stop();
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
	 *
	 * Note that a new state is created for each resize transaction.
	 */ get state() {
        return this._state;
    }
    /**
	 * Makes resizer visible in the UI.
	 */ show() {
        const editingView = this._options.editor.editing.view;
        editingView.change((writer)=>{
            writer.removeClass('ck-hidden', this._viewResizerWrapper);
        });
    }
    /**
	 * Hides resizer in the UI.
	 */ hide() {
        const editingView = this._options.editor.editing.view;
        editingView.change((writer)=>{
            writer.addClass('ck-hidden', this._viewResizerWrapper);
        });
    }
    /**
	 * Attaches the resizer to the DOM.
	 */ attach() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const widgetElement = this._options.viewElement;
        const editingView = this._options.editor.editing.view;
        editingView.change((writer)=>{
            const viewResizerWrapper = writer.createUIElement('div', {
                class: 'ck ck-reset_all ck-widget__resizer'
            }, function(domDocument) {
                const domElement = this.toDomElement(domDocument);
                that._appendHandles(domElement);
                that._appendSizeUI(domElement);
                return domElement;
            });
            // Append the resizer wrapper to the widget's wrapper.
            writer.insert(writer.createPositionAt(widgetElement, 'end'), viewResizerWrapper);
            writer.addClass('ck-widget_with-resizer', widgetElement);
            this._viewResizerWrapper = viewResizerWrapper;
            if (!this.isVisible) {
                this.hide();
            }
        });
        this.on('change:isVisible', ()=>{
            if (this.isVisible) {
                this.show();
                this.redraw();
            } else {
                this.hide();
            }
        });
    }
    /**
	 * Starts the resizing process.
	 *
	 * Creates a new {@link #state} for the current process.
	 *
	 * @fires begin
	 * @param domResizeHandle Clicked handle.
	 */ begin(domResizeHandle) {
        this._state = new WidgetResizeState(this._options);
        this._sizeView._bindToState(this._options, this.state);
        this._initialViewWidth = this._options.viewElement.getStyle('width');
        this.state.begin(domResizeHandle, this._getHandleHost(), this._getResizeHost());
    }
    /**
	 * Updates the proposed size based on `domEventData`.
	 *
	 * @fires updateSize
	 */ updateSize(domEventData) {
        const newSize = this._proposeNewSize(domEventData);
        const editingView = this._options.editor.editing.view;
        editingView.change((writer)=>{
            const unit = this._options.unit || '%';
            const newWidth = (unit === '%' ? newSize.widthPercents : newSize.width) + unit;
            writer.setStyle('width', newWidth, this._options.viewElement);
        });
        // Get an actual image width, and:
        // * reflect this size to the resize wrapper
        // * apply this **real** size to the state
        const domHandleHost = this._getHandleHost();
        const domHandleHostRect = new Rect(domHandleHost);
        const handleHostWidth = Math.round(domHandleHostRect.width);
        const handleHostHeight = Math.round(domHandleHostRect.height);
        // Handle max-width limitation.
        const domResizeHostRect = new Rect(domHandleHost);
        newSize.width = Math.round(domResizeHostRect.width);
        newSize.height = Math.round(domResizeHostRect.height);
        this.redraw(domHandleHostRect);
        this.state.update({
            ...newSize,
            handleHostWidth,
            handleHostHeight
        });
    }
    /**
	 * Applies the geometry proposed with the resizer.
	 *
	 * @fires commit
	 */ commit() {
        const unit = this._options.unit || '%';
        const newValue = (unit === '%' ? this.state.proposedWidthPercents : this.state.proposedWidth) + unit;
        // Both cleanup and onCommit callback are very likely to make view changes. Ensure that it is made in a single step.
        this._options.editor.editing.view.change(()=>{
            this._cleanup();
            this._options.onCommit(newValue);
        });
    }
    /**
	 * Cancels and rejects the proposed resize dimensions, hiding the UI.
	 *
	 * @fires cancel
	 */ cancel() {
        this._cleanup();
    }
    /**
	 * Destroys the resizer.
	 */ destroy() {
        this.cancel();
    }
    /**
	 * Redraws the resizer.
	 *
	 * @param handleHostRect Handle host rectangle might be given to improve performance.
	 */ redraw(handleHostRect) {
        const domWrapper = this._domResizerWrapper;
        // Refresh only if resizer exists in the DOM.
        if (!existsInDom(domWrapper)) {
            return;
        }
        const widgetWrapper = domWrapper.parentElement;
        const handleHost = this._getHandleHost();
        const resizerWrapper = this._viewResizerWrapper;
        const currentDimensions = [
            resizerWrapper.getStyle('width'),
            resizerWrapper.getStyle('height'),
            resizerWrapper.getStyle('left'),
            resizerWrapper.getStyle('top')
        ];
        let newDimensions;
        if (widgetWrapper.isSameNode(handleHost)) {
            const clientRect = handleHostRect || new Rect(handleHost);
            newDimensions = [
                clientRect.width + 'px',
                clientRect.height + 'px',
                undefined,
                undefined
            ];
        } else {
            newDimensions = [
                handleHost.offsetWidth + 'px',
                handleHost.offsetHeight + 'px',
                handleHost.offsetLeft + 'px',
                handleHost.offsetTop + 'px'
            ];
        }
        // Make changes to the view only if the resizer should actually get new dimensions.
        // Otherwise, if View#change() was always called, this would cause EditorUI#update
        // loops because the WidgetResize plugin listens to EditorUI#update and updates
        // the resizer.
        // https://github.com/ckeditor/ckeditor5/issues/7633
        if (compareArrays(currentDimensions, newDimensions) !== 'same') {
            this._options.editor.editing.view.change((writer)=>{
                writer.setStyle({
                    width: newDimensions[0],
                    height: newDimensions[1],
                    left: newDimensions[2],
                    top: newDimensions[3]
                }, resizerWrapper);
            });
        }
    }
    containsHandle(domElement) {
        return this._domResizerWrapper.contains(domElement);
    }
    static isResizeHandle(domElement) {
        return domElement.classList.contains('ck-widget__resizer__handle');
    }
    /**
	 * Cleans up the context state.
	 */ _cleanup() {
        this._sizeView._dismiss();
        const editingView = this._options.editor.editing.view;
        editingView.change((writer)=>{
            writer.setStyle('width', this._initialViewWidth, this._options.viewElement);
        });
    }
    /**
	 * Calculates the proposed size as the resize handles are dragged.
	 *
	 * @param domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 */ _proposeNewSize(domEventData) {
        const state = this.state;
        const currentCoordinates = extractCoordinates(domEventData);
        const isCentered = this._options.isCentered ? this._options.isCentered(this) : true;
        // Enlargement defines how much the resize host has changed in a given axis. Naturally it could be a negative number
        // meaning that it has been shrunk.
        //
        // +----------------+--+
        // |                |  |
        // |       img      |  |
        // |  /handle host  |  |
        // +----------------+  | ^
        // |                   | | - enlarge y
        // +-------------------+ v
        // 					<-->
        // 					 enlarge x
        const enlargement = {
            x: state._referenceCoordinates.x - (currentCoordinates.x + state.originalWidth),
            y: currentCoordinates.y - state.originalHeight - state._referenceCoordinates.y
        };
        if (isCentered && state.activeHandlePosition.endsWith('-right')) {
            enlargement.x = currentCoordinates.x - (state._referenceCoordinates.x + state.originalWidth);
        }
        // Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from
        // one resized corner to your cursor. It needs to be duplicated to compensate for the other side too.
        if (isCentered) {
            enlargement.x *= 2;
        }
        // const resizeHost = this._getResizeHost();
        // The size proposed by the user. It does not consider the aspect ratio.
        let width = Math.abs(state.originalWidth + enlargement.x);
        let height = Math.abs(state.originalHeight + enlargement.y);
        // Dominant determination must take the ratio into account.
        const dominant = width / state.aspectRatio > height ? 'width' : 'height';
        if (dominant == 'width') {
            height = width / state.aspectRatio;
        } else {
            width = height * state.aspectRatio;
        }
        return {
            width: Math.round(width),
            height: Math.round(height),
            widthPercents: Math.min(Math.round(state.originalWidthPercents / state.originalWidth * width * 100) / 100, 100)
        };
    }
    /**
	 * Obtains the resize host.
	 *
	 * Resize host is an object that receives dimensions which are the result of resizing.
	 */ _getResizeHost() {
        const widgetWrapper = this._domResizerWrapper.parentElement;
        return this._options.getResizeHost(widgetWrapper);
    }
    /**
	 * Obtains the handle host.
	 *
	 * Handle host is an object that the handles are aligned to.
	 *
	 * Handle host will not always be an entire widget itself. Take an image as an example. The image widget
	 * contains an image and a caption. Only the image should be surrounded with handles.
	 */ _getHandleHost() {
        const widgetWrapper = this._domResizerWrapper.parentElement;
        return this._options.getHandleHost(widgetWrapper);
    }
    /**
	 * DOM container of the entire resize UI.
	 *
	 * Note that this property will have a value only after the element bound with the resizer is rendered
	 * (otherwise `null`).
	 */ get _domResizerWrapper() {
        return this._options.editor.editing.view.domConverter.mapViewToDom(this._viewResizerWrapper);
    }
    /**
	 * Renders the resize handles in the DOM.
	 *
	 * @param domElement The resizer wrapper.
	 */ _appendHandles(domElement) {
        const resizerPositions = [
            'top-left',
            'top-right',
            'bottom-right',
            'bottom-left'
        ];
        for (const currentPosition of resizerPositions){
            domElement.appendChild(new Template({
                tag: 'div',
                attributes: {
                    class: `ck-widget__resizer__handle ${getResizerClass(currentPosition)}`
                }
            }).render());
        }
    }
    /**
	 * Sets up the {@link #_sizeView} property and adds it to the passed `domElement`.
	 */ _appendSizeUI(domElement) {
        this._sizeView = new SizeView();
        // Make sure icon#element is rendered before passing to appendChild().
        this._sizeView.render();
        domElement.appendChild(this._sizeView.element);
    }
}
/**
 * @param resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
 * @returns A prefixed HTML class name for the resizer element
 */ function getResizerClass(resizerPosition) {
    return `ck-widget__resizer__handle-${resizerPosition}`;
}
function extractCoordinates(event) {
    return {
        x: event.pageX,
        y: event.pageY
    };
}
function existsInDom(element) {
    return element && element.ownerDocument && element.ownerDocument.contains(element);
}

/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 */ class WidgetResize extends Plugin {
    /**
	 * A map of resizers created using this plugin instance.
	 */ _resizers = new Map();
    _observer;
    _redrawSelectedResizerThrottled;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'WidgetResize';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editing = this.editor.editing;
        const domDocument = global.window.document;
        this.set('selectedResizer', null);
        this.set('_activeResizer', null);
        editing.view.addObserver(MouseObserver);
        this._observer = new (DomEmitterMixin())();
        this.listenTo(editing.view.document, 'mousedown', this._mouseDownListener.bind(this), {
            priority: 'high'
        });
        this._observer.listenTo(domDocument, 'mousemove', this._mouseMoveListener.bind(this));
        this._observer.listenTo(domDocument, 'mouseup', this._mouseUpListener.bind(this));
        this._redrawSelectedResizerThrottled = throttle(()=>this.redrawSelectedResizer(), 200);
        // Redrawing on any change of the UI of the editor (including content changes).
        this.editor.ui.on('update', this._redrawSelectedResizerThrottled);
        // Remove view widget-resizer mappings for widgets that have been removed from the document.
        // https://github.com/ckeditor/ckeditor5/issues/10156
        // https://github.com/ckeditor/ckeditor5/issues/10266
        this.editor.model.document.on('change', ()=>{
            for (const [viewElement, resizer] of this._resizers){
                if (!viewElement.isAttached()) {
                    this._resizers.delete(viewElement);
                    resizer.destroy();
                }
            }
        }, {
            priority: 'lowest'
        });
        // Resizers need to be redrawn upon window resize, because new window might shrink resize host.
        this._observer.listenTo(global.window, 'resize', this._redrawSelectedResizerThrottled);
        const viewSelection = this.editor.editing.view.document.selection;
        viewSelection.on('change', ()=>{
            const selectedElement = viewSelection.getSelectedElement();
            const resizer = this.getResizerByViewElement(selectedElement) || null;
            if (resizer) {
                this.select(resizer);
            } else {
                this.deselect();
            }
        });
    }
    /**
	 * Redraws the selected resizer if there is any selected resizer and if it is visible.
	 */ redrawSelectedResizer() {
        if (this.selectedResizer && this.selectedResizer.isVisible) {
            this.selectedResizer.redraw();
        }
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._observer.stopListening();
        for (const resizer of this._resizers.values()){
            resizer.destroy();
        }
        this._redrawSelectedResizerThrottled.cancel();
    }
    /**
	 * Marks resizer as selected.
	 */ select(resizer) {
        this.deselect();
        this.selectedResizer = resizer;
        this.selectedResizer.isSelected = true;
    }
    /**
	 * Deselects currently set resizer.
	 */ deselect() {
        if (this.selectedResizer) {
            this.selectedResizer.isSelected = false;
        }
        this.selectedResizer = null;
    }
    /**
	 * @param options Resizer options.
	 */ attachTo(options) {
        const resizer = new WidgetResizer(options);
        const plugins = this.editor.plugins;
        resizer.attach();
        if (plugins.has('WidgetToolbarRepository')) {
            // Hiding widget toolbar to improve the performance
            // (https://github.com/ckeditor/ckeditor5-widget/pull/112#issuecomment-564528765).
            const widgetToolbarRepository = plugins.get('WidgetToolbarRepository');
            resizer.on('begin', ()=>{
                widgetToolbarRepository.forceDisabled('resize');
            }, {
                priority: 'lowest'
            });
            resizer.on('cancel', ()=>{
                widgetToolbarRepository.clearForceDisabled('resize');
            }, {
                priority: 'highest'
            });
            resizer.on('commit', ()=>{
                widgetToolbarRepository.clearForceDisabled('resize');
            }, {
                priority: 'highest'
            });
        }
        this._resizers.set(options.viewElement, resizer);
        const viewSelection = this.editor.editing.view.document.selection;
        const selectedElement = viewSelection.getSelectedElement();
        // If the element the resizer is created for is currently focused, it should become visible.
        if (this.getResizerByViewElement(selectedElement) == resizer) {
            this.select(resizer);
        }
        return resizer;
    }
    /**
	 * Returns a resizer created for a given view element (widget element).
	 *
	 * @param viewElement View element associated with the resizer.
	 */ getResizerByViewElement(viewElement) {
        return this._resizers.get(viewElement);
    }
    /**
	 * Returns a resizer that contains a given resize handle.
	 */ _getResizerByHandle(domResizeHandle) {
        for (const resizer of this._resizers.values()){
            if (resizer.containsHandle(domResizeHandle)) {
                return resizer;
            }
        }
    }
    /**
	 * @param domEventData Native DOM event.
	 */ _mouseDownListener(event, domEventData) {
        const resizeHandle = domEventData.domTarget;
        if (!WidgetResizer.isResizeHandle(resizeHandle)) {
            return;
        }
        this._activeResizer = this._getResizerByHandle(resizeHandle) || null;
        if (this._activeResizer) {
            this._activeResizer.begin(resizeHandle);
            // Do not call other events when resizing. See: #6755.
            event.stop();
            domEventData.preventDefault();
        }
    }
    /**
	 * @param domEventData Native DOM event.
	 */ _mouseMoveListener(event, domEventData) {
        if (this._activeResizer) {
            this._activeResizer.updateSize(domEventData);
        }
    }
    _mouseUpListener() {
        if (this._activeResizer) {
            this._activeResizer.commit();
            this._activeResizer = null;
        }
    }
}

export { WIDGET_CLASS_NAME, WIDGET_SELECTED_CLASS_NAME, Widget, WidgetHighlightStack, WidgetResize, WidgetResizeState, WidgetResizer, WidgetToolbarRepository, WidgetTypeAround, TYPE_AROUND_SELECTION_ATTRIBUTE as _WIDGET_TYPE_AROUND_SELECTION_ATTRIBUTE, SizeView as _WidgetSizeView, getClosestTypeAroundDomButton as _getClosestWidgetTypeAroundDomButton, getClosestWidgetViewElement as _getClosestWidgetViewElement, getTypeAroundButtonPosition as _getWidgetTypeAroundButtonPosition, getTypeAroundFakeCaretPosition as _getWidgetTypeAroundFakeCaretPosition, calculateResizeHostAncestorWidth, calculateResizeHostPercentageWidth, findOptimalInsertionRange, getLabel, isTypeAroundWidget, isWidget, setHighlightHandling, setLabel, toWidget, toWidgetEditable, verticalWidgetNavigationHandler, viewToModelPositionOutsideModelElement };
//# sourceMappingURL=index.js.map

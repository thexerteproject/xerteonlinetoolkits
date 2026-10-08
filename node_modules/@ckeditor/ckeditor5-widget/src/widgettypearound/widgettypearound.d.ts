/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgettypearound/widgettypearound
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Delete } from '@ckeditor/ckeditor5-typing';
import '../../theme/widgettypearound.css';
/**
 * A plugin that allows users to type around widgets where normally it is impossible to place the caret due
 * to limitations of web browsers. These "tight spots" occur, for instance, before (or after) a widget being
 * the first (or last) child of its parent or between two block widgets.
 *
 * This plugin extends the {@link module:widget/widget~Widget `Widget`} plugin and injects the user interface
 * with two buttons into each widget instance in the editor. Each of the buttons can be clicked by the
 * user if the widget is next to the "tight spot". Once clicked, a paragraph is created with the selection anchored
 * in it so that users can type (or insert content, paste, etc.) straight away.
 */
export declare class WidgetTypeAround extends Plugin {
    /**
     * A reference to the model widget element that has the fake caret active
     * on either side of it. It is later used to remove CSS classes associated with the fake caret
     * when the widget no longer needs it.
     */
    private _currentFakeCaretModelElement;
    /**
     * @inheritDoc
     */
    static get pluginName(): "WidgetTypeAround";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Enter, typeof Delete];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Inserts a new paragraph next to a widget element with the selection anchored in it.
     *
     * **Note**: This method is heavily user-oriented and will both focus the editing view and scroll
     * the viewport to the selection in the inserted paragraph.
     *
     * @param widgetModelElement The model widget element next to which a paragraph is inserted.
     * @param position The position where the paragraph is inserted. Either `'before'` or `'after'` the widget.
     */
    private _insertParagraph;
    /**
     * A wrapper for the {@link module:utils/emittermixin~Emitter#listenTo} method that executes the callbacks only
     * when the plugin {@link #isEnabled is enabled}.
     *
     * @param emitter The object that fires the event.
     * @param event The name of the event.
     * @param callback The function to be called on event.
     * @param options Additional options.
     */
    private _listenToIfEnabled;
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
     */
    private _insertParagraphAccordingToFakeCaretPosition;
    /**
     * Creates a listener in the editing conversion pipeline that injects the widget type around
     * UI into every single widget instance created in the editor.
     *
     * The UI is delivered as a {@link module:engine/view/uielement~ViewUIElement}
     * wrapper which renders DOM buttons that users can use to insert paragraphs.
     */
    private _enableTypeAroundUIInjection;
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
     */
    private _enableTypeAroundFakeCaretActivationUsingKeyboardArrows;
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
     */
    private _handleArrowKeyPress;
    /**
     * Handles the keyboard navigation on "keydown" when a widget is currently selected and activates or deactivates
     * the fake caret for that widget, depending on the current value of the `widget-type-around` model
     * selection attribute and the direction of the pressed arrow key.
     *
     * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
     * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
     * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
     * process the event any further. Returns `false` otherwise.
     */
    private _handleArrowKeyPressOnSelectedWidget;
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
     */
    private _handleArrowKeyPressWhenSelectionNextToAWidget;
    /**
     * Handles the keyboard navigation on "keydown" when a widget is currently selected (together with some other content)
     * and the widget is the first or last element in the selection. It activates or deactivates the fake caret for that widget.
     *
     * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
     * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
     * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
     * process the event any further. Returns `false` otherwise.
     */
    private _handleArrowKeyPressWhenNonCollapsedSelection;
    /**
     * Registers a `mousedown` listener for the view document which intercepts events
     * coming from the widget type around UI, which happens when a user clicks one of the buttons
     * that insert a paragraph next to a widget.
     */
    private _enableInsertingParagraphsOnButtonClick;
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
     */
    private _enableInsertingParagraphsOnEnterKeypress;
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
     */
    private _enableInsertingParagraphsOnTypingKeystroke;
    /**
     * It creates a "delete" event listener on the view document to handle cases when the <kbd>Delete</kbd> or <kbd>Backspace</kbd>
     * is pressed and the fake caret is currently active.
     *
     * The fake caret should create an illusion of a real browser caret so that when it appears before or after
     * a widget, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> should remove a widget or delete the content
     * before or after a widget (depending on the content surrounding the widget).
     */
    private _enableDeleteIntegration;
    /**
     * Attaches the {@link module:engine/model/model~Model#event:insertContent} event listener that, for instance, allows the user to paste
     * content near a widget when the fake caret is first activated using the arrow keys.
     *
     * The content is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
     */
    private _enableInsertContentIntegration;
    /**
     * Attaches the {@link module:engine/model/model~Model#event:insertObject} event listener that modifies the
     * `options.findOptimalPosition`parameter to position of fake caret in relation to selected element
     * to reflect user's intent of desired insertion position.
     *
     * The object is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
     */
    private _enableInsertObjectIntegration;
    /**
     * Attaches the {@link module:engine/model/model~Model#event:deleteContent} event listener to block the event when the fake
     * caret is active.
     *
     * This is required for cases that trigger {@link module:engine/model/model~Model#deleteContent `model.deleteContent()`}
     * before calling {@link module:engine/model/model~Model#insertContent `model.insertContent()`} like, for instance,
     * plain text pasting.
     */
    private _enableDeleteContentIntegration;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core/dist/index.js';
import { IconPreviousArrow, IconFindReplace } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { View, ViewCollection, FocusCycler, submitHandler, CollapsibleView, SwitchButtonView, ButtonView, LabeledFieldView, createLabeledInputText, Dialog, DropdownView, createDropdown, FormHeaderView, MenuBarMenuListItemButtonView, DialogViewPosition, CssTransitionDisablerMixin } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { FocusTracker, KeystrokeHandler, isVisible, Rect, ObservableMixin, Collection, uid, scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { escapeRegExp, debounce } from 'es-toolkit/compat';

/**
 * The find and replace form view class.
 *
 * See {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.
 */ class FindAndReplaceFormView extends View {
    /**
	 * A collection of child views.
	 */ children;
    /**
	 * The find in text input view that stores the searched string.
	 *
	 * @internal
	 */ _findInputView;
    /**
	 * The replace input view.
	 */ _replaceInputView;
    /**
	 * The find button view that initializes the search process.
	 */ _findButtonView;
    /**
	 * The find previous button view.
	 */ _findPrevButtonView;
    /**
	 * The find next button view.
	 */ _findNextButtonView;
    /**
	 * A collapsible view aggregating the advanced search options.
	 */ _advancedOptionsCollapsibleView;
    /**
	 * A switch button view controlling the "Match case" option.
	 */ _matchCaseSwitchView;
    /**
	 * A switch button view controlling the "Whole words only" option.
	 */ _wholeWordsOnlySwitchView;
    /**
	 * The replace button view.
	 */ _replaceButtonView;
    /**
	 * The replace all button view.
	 */ _replaceAllButtonView;
    /**
	 * The `div` aggregating the inputs.
	 */ _inputsDivView;
    /**
	 * The `div` aggregating the action buttons.
	 */ _actionButtonsDivView;
    /**
	 * Tracks information about the DOM focus in the form.
	 */ _focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ _keystrokes;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ focusCycler;
    /**
	 * Creates a view of find and replace form.
	 *
	 * @param locale The localization services instance.
	 */ constructor(locale){
        super(locale);
        const t = locale.t;
        this.children = this.createCollection();
        this.set('matchCount', 0);
        this.set('highlightOffset', 0);
        this.set('isDirty', false);
        this.set('_areCommandsEnabled', {});
        this.set('_resultsCounterText', '');
        this.set('_matchCase', false);
        this.set('_wholeWordsOnly', false);
        this.bind('_searchResultsFound').to(this, 'matchCount', this, 'isDirty', (matchCount, isDirty)=>{
            return matchCount > 0 && !isDirty;
        });
        this._findInputView = this._createInputField(t('Find in text…'));
        this._findPrevButtonView = this._createButton({
            label: t('Previous result'),
            class: 'ck-button-prev',
            icon: IconPreviousArrow,
            keystroke: 'Shift+F3',
            tooltip: true
        });
        this._findNextButtonView = this._createButton({
            label: t('Next result'),
            class: 'ck-button-next',
            icon: IconPreviousArrow,
            keystroke: 'F3',
            tooltip: true
        });
        this._replaceInputView = this._createInputField(t('Replace with…'), 'ck-labeled-field-replace');
        this._inputsDivView = this._createInputsDiv();
        this._matchCaseSwitchView = this._createMatchCaseSwitch();
        this._wholeWordsOnlySwitchView = this._createWholeWordsOnlySwitch();
        this._advancedOptionsCollapsibleView = this._createAdvancedOptionsCollapsible();
        this._replaceAllButtonView = this._createButton({
            label: t('Replace all'),
            class: 'ck-button-replaceall',
            withText: true
        });
        this._replaceButtonView = this._createButton({
            label: t('Replace'),
            class: 'ck-button-replace',
            withText: true
        });
        this._findButtonView = this._createButton({
            label: t('Find'),
            class: 'ck-button-find ck-button-action',
            withText: true
        });
        this._actionButtonsDivView = this._createActionButtonsDiv();
        this._focusTracker = new FocusTracker();
        this._keystrokes = new KeystrokeHandler();
        this._focusables = new ViewCollection();
        this.focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this._focusTracker,
            keystrokeHandler: this._keystrokes,
            actions: {
                // Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the <kbd>Tab</kbd> key.
                focusNext: 'tab'
            }
        });
        this.children.addMany([
            this._inputsDivView,
            this._advancedOptionsCollapsibleView,
            this._actionButtonsDivView
        ]);
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-find-and-replace-form'
                ],
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        submitHandler({
            view: this
        });
        this._initFocusCycling();
        this._initKeystrokeHandling();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._focusTracker.destroy();
        this._keystrokes.destroy();
    }
    /**
	 * @inheritDoc
	 */ focus(direction) {
        if (direction === -1) {
            this.focusCycler.focusLast();
        } else {
            this.focusCycler.focusFirst();
        }
    }
    /**
	 * Resets the form before re-appearing.
	 *
	 * It clears error messages, hides the match counter and disables the replace feature
	 * until the next hit of the "Find" button.
	 *
	 * **Note**: It does not reset inputs and options, though. This way the form works better in editors with
	 * disappearing toolbar (e.g. BalloonEditor): hiding the toolbar by accident (together with the find and replace UI)
	 * does not require filling the entire form again.
	 */ reset() {
        this._findInputView.errorText = null;
        this.isDirty = true;
    }
    /**
	 * Returns the value of the find input.
	 */ get _textToFind() {
        return this._findInputView.fieldView.element.value;
    }
    /**
	 * Returns the value of the replace input.
	 */ get _textToReplace() {
        return this._replaceInputView.fieldView.element.value;
    }
    /**
	 * Configures and returns the `<div>` aggregating all form inputs.
	 */ _createInputsDiv() {
        const locale = this.locale;
        const t = locale.t;
        const inputsDivView = new View(locale);
        // Typing in the find field invalidates all previous results (the form is "dirty").
        this._findInputView.fieldView.on('input', ()=>{
            this.isDirty = true;
        });
        // Pressing prev/next buttons fires related event on the form.
        this._findPrevButtonView.delegate('execute').to(this, 'findPrevious');
        this._findNextButtonView.delegate('execute').to(this, 'findNext');
        // Prev/next buttons will be disabled when related editor command gets disabled.
        this._findPrevButtonView.bind('isEnabled').to(this, '_areCommandsEnabled', ({ findPrevious })=>findPrevious);
        this._findNextButtonView.bind('isEnabled').to(this, '_areCommandsEnabled', ({ findNext })=>findNext);
        this._injectFindResultsCounter();
        this._replaceInputView.bind('isEnabled').to(this, '_areCommandsEnabled', this, '_searchResultsFound', ({ replace }, resultsFound)=>replace && resultsFound);
        this._replaceInputView.bind('infoText').to(this._replaceInputView, 'isEnabled', this._replaceInputView, 'isFocused', (isEnabled, isFocused)=>{
            if (isEnabled || !isFocused) {
                return '';
            }
            return t('Tip: Find some text first in order to replace it.');
        });
        inputsDivView.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-find-and-replace-form__inputs'
                ]
            },
            children: [
                this._findInputView,
                this._findPrevButtonView,
                this._findNextButtonView,
                this._replaceInputView
            ]
        });
        return inputsDivView;
    }
    /**
	 * The action performed when the {@link #_findButtonView} is pressed.
	 */ _onFindButtonExecute() {
        // When hitting "Find" in an empty input, an error should be displayed.
        // Also, if the form was "dirty", it should remain so.
        if (!this._textToFind) {
            const t = this.t;
            this._findInputView.errorText = t('Text to find must not be empty.');
            return;
        }
        // Hitting "Find" automatically clears the dirty state.
        this.isDirty = false;
        this.fire('findNext', {
            searchText: this._textToFind,
            matchCase: this._matchCase,
            wholeWords: this._wholeWordsOnly
        });
    }
    /**
	 * Configures an injects the find results counter displaying a "N of M" label of the {@link #_findInputView}.
	 */ _injectFindResultsCounter() {
        const locale = this.locale;
        const t = locale.t;
        const bind = this.bindTemplate;
        const resultsCounterView = new View(this.locale);
        this.bind('_resultsCounterText').to(this, 'highlightOffset', this, 'matchCount', (highlightOffset, matchCount)=>t('%0 of %1', [
                highlightOffset,
                matchCount
            ]));
        resultsCounterView.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck',
                    'ck-results-counter',
                    // The counter only makes sense when the field text corresponds to search results in the editing.
                    bind.if('isDirty', 'ck-hidden')
                ]
            },
            children: [
                {
                    text: bind.to('_resultsCounterText')
                }
            ]
        });
        // The whole idea is that when the text of the counter changes, its width also increases/decreases and
        // it consumes more or less space over the input. The input, on the other hand, should adjust it's right
        // padding so its *entire* text always remains visible and available to the user.
        const updateFindInputPadding = ()=>{
            const inputElement = this._findInputView.fieldView.element;
            // Don't adjust the padding if the input (also: counter) were not rendered or not inserted into DOM yet.
            if (!inputElement || !isVisible(inputElement)) {
                return;
            }
            const counterWidth = new Rect(resultsCounterView.element).width;
            const paddingPropertyName = locale.uiLanguageDirection === 'ltr' ? 'paddingRight' : 'paddingLeft';
            if (!counterWidth) {
                inputElement.style[paddingPropertyName] = '';
            } else {
                inputElement.style[paddingPropertyName] = `calc( 2 * var(--ck-spacing-standard) + ${counterWidth}px )`;
            }
        };
        // Adjust the input padding when the text of the counter changes, for instance "1 of 200" is narrower than "123 of 200".
        // Using "low" priority to let the text be set by the template binding first.
        this.on('change:_resultsCounterText', updateFindInputPadding, {
            priority: 'low'
        });
        // Adjust the input padding when the counter shows or hides. When hidden, there should be no padding. When it shows, the
        // padding should be set according to the text of the counter.
        // Using "low" priority to let the text be set by the template binding first.
        this.on('change:isDirty', updateFindInputPadding, {
            priority: 'low'
        });
        // Put the counter element next to the <input> in the find field.
        this._findInputView.template.children[0].children.push(resultsCounterView);
    }
    /**
	 * Creates the collapsible view aggregating the advanced search options.
	 */ _createAdvancedOptionsCollapsible() {
        const t = this.locale.t;
        const collapsible = new CollapsibleView(this.locale, [
            this._matchCaseSwitchView,
            this._wholeWordsOnlySwitchView
        ]);
        collapsible.set({
            label: t('Advanced options'),
            isCollapsed: true
        });
        return collapsible;
    }
    /**
	 * Configures and returns the `<div>` element aggregating all form action buttons.
	 */ _createActionButtonsDiv() {
        const actionsDivView = new View(this.locale);
        this._replaceButtonView.bind('isEnabled').to(this, '_areCommandsEnabled', this, '_searchResultsFound', ({ replace }, resultsFound)=>replace && resultsFound);
        this._replaceAllButtonView.bind('isEnabled').to(this, '_areCommandsEnabled', this, '_searchResultsFound', ({ replaceAll }, resultsFound)=>replaceAll && resultsFound);
        this._replaceButtonView.on('execute', ()=>{
            this.fire('replace', {
                searchText: this._textToFind,
                replaceText: this._textToReplace
            });
        });
        this._replaceAllButtonView.on('execute', ()=>{
            this.fire('replaceAll', {
                searchText: this._textToFind,
                replaceText: this._textToReplace
            });
            this.focus();
        });
        this._findButtonView.on('execute', this._onFindButtonExecute.bind(this));
        actionsDivView.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-find-and-replace-form__actions'
                ]
            },
            children: [
                this._replaceAllButtonView,
                this._replaceButtonView,
                this._findButtonView
            ]
        });
        return actionsDivView;
    }
    /**
	 * Creates, configures and returns and instance of a dropdown allowing users to narrow
	 * the search criteria down. The dropdown has a list with switch buttons for each option.
	 */ _createMatchCaseSwitch() {
        const t = this.locale.t;
        const matchCaseSwitchButton = new SwitchButtonView(this.locale);
        matchCaseSwitchButton.set({
            label: t('Match case'),
            withText: true
        });
        // Let the switch be controlled by form's observable property.
        matchCaseSwitchButton.bind('isOn').to(this, '_matchCase');
        // // Update the state of the form when a switch is toggled.
        matchCaseSwitchButton.on('execute', ()=>{
            this._matchCase = !this._matchCase;
            // Toggling a switch makes the form dirty because this changes search criteria
            // just like typing text of the find input.
            this.isDirty = true;
        });
        return matchCaseSwitchButton;
    }
    /**
	 * Creates, configures and returns and instance of a dropdown allowing users to narrow
	 * the search criteria down. The dropdown has a list with switch buttons for each option.
	 */ _createWholeWordsOnlySwitch() {
        const t = this.locale.t;
        const wholeWordsOnlySwitchButton = new SwitchButtonView(this.locale);
        wholeWordsOnlySwitchButton.set({
            label: t('Whole words only'),
            withText: true
        });
        // Let the switch be controlled by form's observable property.
        wholeWordsOnlySwitchButton.bind('isOn').to(this, '_wholeWordsOnly');
        // // Update the state of the form when a switch is toggled.
        wholeWordsOnlySwitchButton.on('execute', ()=>{
            this._wholeWordsOnly = !this._wholeWordsOnly;
            // Toggling a switch makes the form dirty because this changes search criteria
            // just like typing text of the find input.
            this.isDirty = true;
        });
        return wholeWordsOnlySwitchButton;
    }
    /**
	 * Initializes the {@link #_focusables} and {@link #_focusTracker} to allow navigation
	 * using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keystrokes in the right order.
	 */ _initFocusCycling() {
        const childViews = [
            this._findInputView,
            this._findPrevButtonView,
            this._findNextButtonView,
            this._replaceInputView,
            this._advancedOptionsCollapsibleView.buttonView,
            this._matchCaseSwitchView,
            this._wholeWordsOnlySwitchView,
            this._replaceAllButtonView,
            this._replaceButtonView,
            this._findButtonView
        ];
        childViews.forEach((v)=>{
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this._focusTracker.add(v.element);
        });
    }
    /**
	 * Initializes the keystroke handling in the form.
	 */ _initKeystrokeHandling() {
        const stopPropagation = (data)=>data.stopPropagation();
        const stopPropagationAndPreventDefault = (data)=>{
            data.stopPropagation();
            data.preventDefault();
        };
        // Start listening for the keystrokes coming from #element.
        this._keystrokes.listenTo(this.element);
        // Find the next result upon F3.
        this._keystrokes.set('f3', (event)=>{
            stopPropagationAndPreventDefault(event);
            this._findNextButtonView.fire('execute');
        });
        // Find the previous result upon F3.
        this._keystrokes.set('shift+f3', (event)=>{
            stopPropagationAndPreventDefault(event);
            this._findPrevButtonView.fire('execute');
        });
        // Find or replace upon pressing Enter in the find and replace fields.
        this._keystrokes.set('enter', (event)=>{
            const target = event.target;
            if (target === this._findInputView.fieldView.element) {
                if (this._areCommandsEnabled.findNext) {
                    this._findNextButtonView.fire('execute');
                } else {
                    this._findButtonView.fire('execute');
                }
                stopPropagationAndPreventDefault(event);
            } else if (target === this._replaceInputView.fieldView.element && !this.isDirty) {
                this._replaceButtonView.fire('execute');
                stopPropagationAndPreventDefault(event);
            }
        });
        // Find previous upon pressing Shift+Enter in the find field.
        this._keystrokes.set('shift+enter', (event)=>{
            const target = event.target;
            if (target !== this._findInputView.fieldView.element) {
                return;
            }
            if (this._areCommandsEnabled.findPrevious) {
                this._findPrevButtonView.fire('execute');
            } else {
                this._findButtonView.fire('execute');
            }
            stopPropagationAndPreventDefault(event);
        });
        // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
        // keystroke handler would take over the key management in the URL input.
        // We need to prevent this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
        this._keystrokes.set('arrowright', stopPropagation);
        this._keystrokes.set('arrowleft', stopPropagation);
        this._keystrokes.set('arrowup', stopPropagation);
        this._keystrokes.set('arrowdown', stopPropagation);
    }
    /**
	 * Creates a button view.
	 *
	 * @param options The properties of the `ButtonView`.
	 * @returns The button view instance.
	 */ _createButton(options) {
        const button = new ButtonView(this.locale);
        button.set(options);
        return button;
    }
    /**
	 * Creates a labeled input view.
	 *
	 * @param label The input label.
	 * @returns The labeled input view instance.
	 */ _createInputField(label, className) {
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        labeledInput.label = label;
        labeledInput.class = className;
        return labeledInput;
    }
}

/**
 * The default find and replace UI.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses the {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
 */ class FindAndReplaceUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Dialog
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FindAndReplaceUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * A reference to the find and replace form view.
	 */ formView;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('findAndReplace.uiType', 'dialog');
        this.formView = null;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const isUiUsingDropdown = editor.config.get('findAndReplace.uiType') === 'dropdown';
        const findCommand = editor.commands.get('find');
        const t = this.editor.t;
        // Register the toolbar component: dropdown or button (that opens a dialog).
        editor.ui.componentFactory.add('findAndReplace', ()=>{
            let view;
            if (isUiUsingDropdown) {
                view = this._createDropdown();
                // Button should be disabled when in source editing mode. See #10001.
                view.bind('isEnabled').to(findCommand);
            } else {
                view = this._createDialogButtonForToolbar();
            }
            editor.keystrokes.set('Ctrl+F', (data, cancelEvent)=>{
                if (!findCommand.isEnabled) {
                    return;
                }
                if (view instanceof DropdownView) {
                    const dropdownButtonView = view.buttonView;
                    if (!dropdownButtonView.isOn) {
                        dropdownButtonView.fire('execute');
                    }
                } else {
                    if (view.isOn) {
                        // If the dialog is open, do not close it. Instead focus it.
                        // Unfortunately we can't simply use:
                        // 	this.formView!.focus();
                        // because it would always move focus to the first input field, which we don't want.
                        editor.plugins.get('Dialog').view.focus();
                    } else {
                        view.fire('execute');
                    }
                }
                cancelEvent();
            });
            return view;
        });
        if (!isUiUsingDropdown) {
            editor.ui.componentFactory.add('menuBar:findAndReplace', ()=>{
                return this._createDialogButtonForMenuBar();
            });
        }
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Find in the document'),
                    keystroke: 'CTRL+F'
                }
            ]
        });
    }
    /**
	 * Creates a dropdown containing the find and replace form.
	 */ _createDropdown() {
        const editor = this.editor;
        const t = editor.locale.t;
        const dropdownView = createDropdown(editor.locale);
        dropdownView.once('change:isOpen', ()=>{
            this.formView = this._createFormView();
            this.formView.children.add(new FormHeaderView(editor.locale, {
                label: t('Find and replace')
            }), 0);
            dropdownView.panelView.children.add(this.formView);
        });
        // Every time a dropdown is opened, the search text field should get focused and selected for better UX.
        // Note: Using the low priority here to make sure the following listener starts working after
        // the default action of the drop-down is executed (i.e. the panel showed up). Otherwise,
        // the invisible form/input cannot be focused/selected.
        //
        // Each time a dropdown is closed, move the focus back to the find and replace toolbar button
        // and let the find and replace editing feature know that all search results can be invalidated
        // and no longer should be marked in the content.
        dropdownView.on('change:isOpen', (event, name, isOpen)=>{
            if (isOpen) {
                this._setupFormView();
            } else {
                this.fire('searchReseted');
            }
        }, {
            priority: 'low'
        });
        dropdownView.buttonView.set({
            icon: IconFindReplace,
            label: t('Find and replace'),
            keystroke: 'CTRL+F',
            tooltip: true
        });
        return dropdownView;
    }
    /**
	 * Creates a button that opens a dialog with the find and replace form.
	 */ _createDialogButtonForToolbar() {
        const editor = this.editor;
        const buttonView = this._createButton(ButtonView);
        const dialog = editor.plugins.get('Dialog');
        buttonView.set({
            tooltip: true
        });
        // Button should be on when the find and replace dialog is opened.
        buttonView.bind('isOn').to(dialog, 'id', (id)=>id === 'findAndReplace');
        // Every time a dialog is opened, the search text field should get focused and selected for better UX.
        // Each time a dialog is closed, move the focus back to the find and replace toolbar button
        // and let the find and replace editing feature know that all search results can be invalidated
        // and no longer should be marked in the content.
        buttonView.on('execute', ()=>{
            if (buttonView.isOn) {
                dialog.hide();
            } else {
                this._showDialog();
            }
        });
        return buttonView;
    }
    /**
	 * Creates a button for for menu bar that will show find and replace dialog.
	 */ _createDialogButtonForMenuBar() {
        const buttonView = this._createButton(MenuBarMenuListItemButtonView);
        const dialogPlugin = this.editor.plugins.get('Dialog');
        const dialog = this.editor.plugins.get('Dialog');
        buttonView.set({
            role: 'menuitemcheckbox',
            isToggleable: true
        });
        // Button should be on when the find and replace dialog is opened.
        buttonView.bind('isOn').to(dialog, 'id', (id)=>id === 'findAndReplace');
        buttonView.on('execute', ()=>{
            if (dialogPlugin.id === 'findAndReplace') {
                dialogPlugin.hide();
                return;
            }
            this._showDialog();
        });
        return buttonView;
    }
    /**
	 * Creates a button for find and replace command to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const findCommand = editor.commands.get('find');
        const buttonView = new ButtonClass(editor.locale);
        const t = editor.locale.t;
        // Button should be disabled when in source editing mode. See #10001.
        buttonView.bind('isEnabled').to(findCommand);
        buttonView.set({
            icon: IconFindReplace,
            label: t('Find and replace'),
            keystroke: 'CTRL+F'
        });
        return buttonView;
    }
    /**
	 * Shows the find and replace dialog.
	 */ _showDialog() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const t = editor.locale.t;
        if (!this.formView) {
            this.formView = this._createFormView();
        }
        dialog.show({
            id: 'findAndReplace',
            title: t('Find and replace'),
            content: this.formView,
            position: DialogViewPosition.EDITOR_TOP_SIDE,
            onShow: ()=>{
                this._setupFormView();
            },
            onHide: ()=>{
                this.fire('searchReseted');
            }
        });
    }
    /**
	 * Sets up the form view for the findN and replace.
	 */ _createFormView() {
        const editor = this.editor;
        const formView = new (CssTransitionDisablerMixin(FindAndReplaceFormView))(editor.locale);
        const commands = editor.commands;
        const findAndReplaceEditing = this.editor.plugins.get('FindAndReplaceEditing');
        const editingState = findAndReplaceEditing.state;
        formView.bind('highlightOffset').to(editingState, 'highlightedOffset');
        // Let the form know how many results were found in total.
        formView.listenTo(editingState.results, 'change', ()=>{
            formView.matchCount = editingState.results.length;
        });
        // Command states are used to enable/disable individual form controls.
        // To keep things simple, instead of binding 4 individual observables, there's only one that combines every
        // commands' isEnabled state. Yes, it will change more often but this simplifies the structure of the form.
        const findNextCommand = commands.get('findNext');
        const findPreviousCommand = commands.get('findPrevious');
        const replaceCommand = commands.get('replace');
        const replaceAllCommand = commands.get('replaceAll');
        formView.bind('_areCommandsEnabled').to(findNextCommand, 'isEnabled', findPreviousCommand, 'isEnabled', replaceCommand, 'isEnabled', replaceAllCommand, 'isEnabled', (findNext, findPrevious, replace, replaceAll)=>({
                findNext,
                findPrevious,
                replace,
                replaceAll
            }));
        // The UI plugin works as an interface between the form and the editing part of the feature.
        formView.delegate('findNext', 'findPrevious', 'replace', 'replaceAll').to(this);
        // Let the feature know that search results are no longer relevant because the user changed the searched phrase
        // (or options) but didn't hit the "Find" button yet (e.g. still typing).
        formView.on('change:isDirty', (evt, data, isDirty)=>{
            if (isDirty) {
                this.fire('searchReseted');
            }
        });
        return formView;
    }
    /**
	 * Clears the find and replace form and focuses the search text field.
	 */ _setupFormView() {
        this.formView.disableCssTransitions();
        this.formView.reset();
        this.formView._findInputView.fieldView.select();
        this.formView.enableCssTransitions();
    }
}

/**
 * The find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */ class FindCommand extends Command {
    /**
	 * The find and replace state object used for command operations.
	 */ _state;
    /**
	 * Creates a new `FindCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */ constructor(editor, state){
        super(editor);
        // The find command is always enabled.
        this.isEnabled = true;
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
        this._state = state;
    }
    /**
	 * Executes the command.
	 *
	 * @param callbackOrText
	 * @param options Options object.
	 * @param options.matchCase If set to `true`, the letter case will be matched.
	 * @param options.wholeWords If set to `true`, only whole words that match `callbackOrText` will be matched.
	 *
	 * @fires execute
	 */ execute(callbackOrText, { matchCase, wholeWords } = {}) {
        const { editor } = this;
        const { model } = editor;
        const findAndReplaceUtils = editor.plugins.get('FindAndReplaceUtils');
        let findCallback;
        let callbackSearchText = '';
        // Allow to execute `find()` on a plugin with a keyword only.
        if (typeof callbackOrText === 'string') {
            findCallback = (...args)=>({
                    results: findAndReplaceUtils.findByTextCallback(callbackOrText, {
                        matchCase,
                        wholeWords
                    })(...args),
                    searchText: callbackOrText
                });
        } else {
            findCallback = callbackOrText;
        }
        // Wrap the callback to get the search text that will be assigned to the state.
        const oldCallback = findCallback;
        findCallback = (...args)=>{
            const result = oldCallback(...args);
            if (result && 'searchText' in result) {
                callbackSearchText = result.searchText;
            }
            return result;
        };
        // Initial search is done on all nodes in all roots inside the content.
        const results = model.document.getRootNames().reduce((currentResults, rootName)=>findAndReplaceUtils.updateFindResultFromRange(model.createRangeIn(model.document.getRoot(rootName)), model, findCallback, currentResults), null);
        this._state.clear(model);
        this._state.results.addMany(results);
        this._state.highlightedResult = results.get(0);
        this._state.searchText = callbackSearchText;
        if (findCallback) {
            this._state.lastSearchCallback = findCallback;
        }
        this._state.matchCase = !!matchCase;
        this._state.matchWholeWords = !!wholeWords;
        return {
            results,
            findCallback
        };
    }
}

/**
 * The object storing find and replace plugin state for a given editor instance.
 */ class FindAndReplaceState extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * Creates an instance of the state.
	 */ constructor(model){
        super();
        this.set('results', new Collection());
        this.set('highlightedResult', null);
        this.set('highlightedOffset', 0);
        this.set('searchText', '');
        this.set('replaceText', '');
        this.set('lastSearchCallback', null);
        this.set('matchCase', false);
        this.set('matchWholeWords', false);
        this.results.on('change', (eventInfo, { removed, index })=>{
            if (Array.from(removed).length) {
                let highlightedResultRemoved = false;
                model.change((writer)=>{
                    for (const removedResult of removed){
                        if (this.highlightedResult === removedResult) {
                            highlightedResultRemoved = true;
                        }
                        if (model.markers.has(removedResult.marker.name)) {
                            writer.removeMarker(removedResult.marker);
                        }
                    }
                });
                if (highlightedResultRemoved) {
                    const nextHighlightedIndex = index >= this.results.length ? 0 : index;
                    this.highlightedResult = this.results.get(nextHighlightedIndex);
                }
            }
        });
        this.on('change:highlightedResult', ()=>{
            this.refreshHighlightOffset(model);
        });
    }
    /**
	 * Cleans the state up and removes markers from the model.
	 */ clear(model) {
        this.searchText = '';
        model.change((writer)=>{
            if (this.highlightedResult) {
                const oldMatchId = this.highlightedResult.marker.name.split(':')[1];
                const oldMarker = model.markers.get(`findResultHighlighted:${oldMatchId}`);
                if (oldMarker) {
                    writer.removeMarker(oldMarker);
                }
            }
            [
                ...this.results
            ].forEach(({ marker })=>{
                writer.removeMarker(marker);
            });
        });
        this.results.clear();
    }
    /**
	 * Refreshes the highlight result offset based on it's index within the result list.
	 */ refreshHighlightOffset(model) {
        const { highlightedResult, results } = this;
        if (highlightedResult) {
            this.highlightedOffset = sortSearchResultsByMarkerPositions(model, [
                ...results
            ]).indexOf(highlightedResult) + 1;
        } else {
            this.highlightedOffset = 0;
        }
    }
}
/**
 * Sorts search results by marker positions. Make sure that the results are sorted in the same order as they appear in the document
 * to avoid issues with the `find next` command. Apparently, the order of the results in the state might be different than the order
 * of the markers in the model.
 *
 * @internal
 */ function sortSearchResultsByMarkerPositions(model, results) {
    const sortMapping = {
        before: -1,
        same: 0,
        after: 1,
        different: 1
    };
    // `compareWith` doesn't play well with multi-root documents, so we need to sort results by root name first
    // and then sort them within each root. It prevents "random" order of results when the document has multiple roots.
    // See more: https://github.com/ckeditor/ckeditor5/pull/17292#issuecomment-2442084549
    return model.document.getRootNames().flatMap((rootName)=>results.filter((result)=>result.marker.getStart().root.rootName === rootName).sort((a, b)=>sortMapping[a.marker.getStart().compareWith(b.marker.getStart())]));
}

class FindReplaceCommandBase extends Command {
    /**
	 * The find and replace state object used for command operations.
	 */ _state;
    /**
	 * Creates a new `ReplaceCommand` instance.
	 *
	 * @param editor Editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */ constructor(editor, state){
        super(editor);
        // The replace command is always enabled.
        this.isEnabled = true;
        this._state = state;
        // Since this command executes on particular result independent of selection, it should be checked directly in execute block.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * Common logic for both `replace` commands.
	 * Replace a given find result by a string or a callback.
	 *
	 * @param result A single result from the find command.
	 */ _replace(replacementText, result) {
        const { model } = this.editor;
        const range = result.marker.getRange();
        // Don't replace a result that is in non-editable place.
        if (!model.canEditAt(range)) {
            return;
        }
        model.change((writer)=>{
            // Don't replace a result (marker) that found its way into the $graveyard (e.g. removed by collaborators).
            if (range.root.rootName === '$graveyard') {
                this._state.results.remove(result);
                return;
            }
            let textAttributes = {};
            for (const item of range.getItems()){
                if (item.is('$text') || item.is('$textProxy')) {
                    textAttributes = item.getAttributes();
                    break;
                }
            }
            model.insertContent(writer.createText(replacementText, textAttributes), range);
            if (this._state.results.has(result)) {
                this._state.results.remove(result);
            }
        });
    }
}

/**
 * The replace command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */ class ReplaceCommand extends FindReplaceCommandBase {
    /**
	 * Replace a given find result by a string or a callback.
	 *
	 * @param result A single result from the find command.
	 *
	 * @fires execute
	 */ execute(replacementText, result) {
        // We save highlight offset here, as the information about the highlighted result will be lost after the changes.
        //
        // It happens because result list is partially regenerated if the result is removed from the paragraph.
        // Partially means that all sibling result items that are placed in the same paragraph are removed and added again,
        // which causes the highlighted result to be malformed (usually it's set to first but it's not guaranteed).
        //
        // While this saving can be done in editing state, it's better to keep it here, as it's a part of the command logic
        // and might be super tricky to implement in multi-root documents.
        //
        // Keep in mind that the highlighted offset is indexed from 1, as it's displayed to the user. It's why we subtract 1 here.
        //
        // More info: https://github.com/ckeditor/ckeditor5/issues/16648
        const oldHighlightOffset = Math.max(this._state.highlightedOffset - 1, 0);
        this._replace(replacementText, result);
        // Let's revert the highlight offset to the previous value.
        if (this._state.results.length) {
            // Highlight offset operates on sorted array, so we need to sort the results first.
            // It's not guaranteed that items in state results are sorted, usually they are, but it's not guaranteed when
            // the result is removed from the paragraph with other highlighted results.
            const sortedResults = sortSearchResultsByMarkerPositions(this.editor.model, [
                ...this._state.results
            ]);
            // Just make sure that we don't overflow the results array, so use modulo.
            this._state.highlightedResult = sortedResults[oldHighlightOffset % sortedResults.length];
        }
    }
}

/**
 * The replace all command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */ class ReplaceAllCommand extends FindReplaceCommandBase {
    /**
	 * Replaces all the occurrences of `textToReplace` with a given `newText` string.
	 *
	 * ```ts
	 *	replaceAllCommand.execute( 'replaceAll', 'new text replacement', 'text to replace' );
	 * ```
	 *
	 * Alternatively you can call it from editor instance:
	 *
	 * ```ts
	 *	editor.execute( 'replaceAll', 'new text', 'old text' );
	 * ```
	 *
	 * @param newText Text that will be inserted to the editor for each match.
	 * @param textToReplace Text to be replaced or a collection of matches
	 * as returned by the find command.
	 *
	 * @fires module:core/command~Command#event:execute
	 */ execute(newText, textToReplace) {
        const { editor } = this;
        const { model } = editor;
        const findAndReplaceUtils = editor.plugins.get('FindAndReplaceUtils');
        const results = textToReplace instanceof Collection ? textToReplace : model.document.getRootNames().reduce((currentResults, rootName)=>findAndReplaceUtils.updateFindResultFromRange(model.createRangeIn(model.document.getRoot(rootName)), model, findAndReplaceUtils.findByTextCallback(textToReplace, this._state), currentResults), null);
        if (results.length) {
            // Wrapped in single change will batch it into one transaction.
            model.change(()=>{
                [
                    ...results
                ].forEach((searchResult)=>{
                    // Just reuse logic from the replace command to replace a single match.
                    this._replace(newText, searchResult);
                });
            });
        }
    }
}

/**
 * The find next command. Moves the highlight to the next search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */ class FindNextCommand extends Command {
    /**
	 * The find and replace state object used for command operations.
	 */ _state;
    /**
	 * Creates a new `FindNextCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */ constructor(editor, state){
        super(editor);
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
        this._state = state;
        this.isEnabled = false;
        this.listenTo(this._state.results, 'change', ()=>{
            this.isEnabled = this._state.results.length > 1;
        });
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._state.results.length > 1;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const results = this._state.results;
        const currentIndex = results.getIndex(this._state.highlightedResult);
        const nextIndex = currentIndex + 1 >= results.length ? 0 : currentIndex + 1;
        this._state.highlightedResult = this._state.results.get(nextIndex);
    }
}

/**
 * The find previous command. Moves the highlight to the previous search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */ class FindPreviousCommand extends FindNextCommand {
    /**
	 * @inheritDoc
	 */ execute() {
        const results = this._state.results;
        const currentIndex = results.getIndex(this._state.highlightedResult);
        const previousIndex = currentIndex - 1 < 0 ? this._state.results.length - 1 : currentIndex - 1;
        this._state.highlightedResult = this._state.results.get(previousIndex);
    }
}

/**
 * A set of helpers related to find and replace.
 */ class FindAndReplaceUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FindAndReplaceUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Executes findCallback and updates search results list.
	 *
	 * @param range The model range to scan for matches.
	 * @param model The model.
	 * @param findCallback The callback that should return `true` if provided text matches the search term.
	 * @param startResults An optional collection of find matches that the function should
	 * start with. This would be a collection returned by a previous `updateFindResultFromRange()` call.
	 * @returns A collection of objects describing find match.
	 *
	 * An example structure:
	 *
	 * ```js
	 * {
	 *	id: resultId,
	 *	label: foundItem.label,
	 *	marker
	 *	}
	 * ```
	 */ updateFindResultFromRange(range, model, findCallback, startResults) {
        const results = startResults || new Collection();
        const checkIfResultAlreadyOnList = (marker)=>results.find((markerItem)=>{
                const { marker: resultsMarker } = markerItem;
                const resultRange = resultsMarker.getRange();
                const markerRange = marker.getRange();
                return resultRange.isEqual(markerRange);
            });
        model.change((writer)=>{
            [
                ...range
            ].forEach(({ type, item })=>{
                if (type === 'elementStart') {
                    if (model.schema.checkChild(item, '$text')) {
                        let foundItems = findCallback({
                            item,
                            text: this.rangeToText(model.createRangeIn(item))
                        });
                        if (!foundItems) {
                            return;
                        }
                        if ('results' in foundItems) {
                            foundItems = foundItems.results;
                        }
                        foundItems.forEach((foundItem)=>{
                            const resultId = `findResult:${uid()}`;
                            const marker = writer.addMarker(resultId, {
                                usingOperation: false,
                                affectsData: false,
                                range: writer.createRange(writer.createPositionAt(item, foundItem.start), writer.createPositionAt(item, foundItem.end))
                            });
                            const index = findInsertIndex(results, marker);
                            if (!checkIfResultAlreadyOnList(marker)) {
                                results.add({
                                    id: resultId,
                                    label: foundItem.label,
                                    marker
                                }, index);
                            }
                        });
                    }
                }
            });
        });
        return results;
    }
    /**
	 * Returns text representation of a range. The returned text length should be the same as range length.
	 * In order to achieve this, this function will replace inline elements (text-line) as new line character ("\n").
	 *
	 * @param range The model range.
	 * @returns The text content of the provided range.
	 */ rangeToText(range) {
        return Array.from(range.getItems({
            shallow: true
        })).reduce((rangeText, node)=>{
            // Trim text to a last occurrence of an inline element and update range start.
            if (!(node.is('$text') || node.is('$textProxy'))) {
                // Editor has only one inline element defined in schema: `<softBreak>` which is treated as new line character in blocks.
                // Special handling might be needed for other inline elements (inline widgets).
                return `${rangeText}\n`;
            }
            return rangeText + node.data;
        }, '');
    }
    /**
	 * Creates a text matching callback for a specified search term and matching options.
	 *
	 * @param searchTerm The search term.
	 * @param options Matching options.
	 * 	- options.matchCase=false If set to `true` letter casing will be ignored.
	 * 	- options.wholeWords=false If set to `true` only whole words that match `callbackOrText` will be matched.
	 */ findByTextCallback(searchTerm, options) {
        let flags = 'gu';
        if (!options.matchCase) {
            flags += 'i';
        }
        let regExpQuery = `(${escapeRegExp(searchTerm)})`;
        if (options.wholeWords) {
            const nonLetterGroup = '[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]';
            if (!new RegExp('^' + nonLetterGroup).test(searchTerm)) {
                regExpQuery = `(^|${nonLetterGroup}|_)${regExpQuery}`;
            }
            if (!new RegExp(nonLetterGroup + '$').test(searchTerm)) {
                regExpQuery = `${regExpQuery}(?=_|${nonLetterGroup}|$)`;
            }
        }
        const regExp = new RegExp(regExpQuery, flags);
        function findCallback({ text }) {
            const matches = [
                ...text.matchAll(regExp)
            ];
            return matches.map(regexpMatchToFindResult);
        }
        return findCallback;
    }
}
// Finds the appropriate index in the resultsList Collection.
function findInsertIndex(resultsList, markerToInsert) {
    const result = resultsList.find(({ marker })=>{
        return markerToInsert.getStart().isBefore(marker.getStart());
    });
    return result ? resultsList.getIndex(result) : resultsList.length;
}
/**
 *  Maps RegExp match result to find result.
 */ function regexpMatchToFindResult(matchResult) {
    const lastGroupIndex = matchResult.length - 1;
    let startOffset = matchResult.index;
    // Searches with match all flag have an extra matching group with empty string or white space matched before the word.
    // If the search term starts with the space already, there is no extra group even with match all flag on.
    if (matchResult.length === 3) {
        startOffset += matchResult[1].length;
    }
    return {
        label: matchResult[lastGroupIndex],
        start: startOffset,
        end: startOffset + matchResult[lastGroupIndex].length
    };
}

const HIGHLIGHT_CLASS = 'ck-find-result_selected';
/**
 * Implements the editing part for find and replace plugin. For example conversion, commands etc.
 */ class FindAndReplaceEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FindAndReplaceUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FindAndReplaceEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'FAR';
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * An object storing the find and replace state within a given editor instance.
	 */ state;
    /**
	 * @inheritDoc
	 */ init() {
        this.state = new FindAndReplaceState(this.editor.model);
        this.set('_isSearchActive', false);
        this._defineConverters();
        this._defineCommands();
        this.listenTo(this.state, 'change:highlightedResult', (eventInfo, name, newValue, oldValue)=>{
            const { model } = this.editor;
            model.change((writer)=>{
                if (oldValue) {
                    const oldMatchId = oldValue.marker.name.split(':')[1];
                    const oldMarker = model.markers.get(`findResultHighlighted:${oldMatchId}`);
                    if (oldMarker) {
                        writer.removeMarker(oldMarker);
                    }
                }
                if (newValue) {
                    const newMatchId = newValue.marker.name.split(':')[1];
                    writer.addMarker(`findResultHighlighted:${newMatchId}`, {
                        usingOperation: false,
                        affectsData: false,
                        range: newValue.marker.getRange()
                    });
                }
            });
        });
        /* istanbul ignore next -- @preserve */ const scrollToHighlightedResult = (eventInfo, name, newValue)=>{
            if (newValue) {
                const domConverter = this.editor.editing.view.domConverter;
                const viewRange = this.editor.editing.mapper.toViewRange(newValue.marker.getRange());
                scrollViewportToShowTarget({
                    target: domConverter.viewRangeToDom(viewRange),
                    viewportOffset: 40
                });
            }
        };
        const debouncedScrollListener = debounce(scrollToHighlightedResult.bind(this), 32);
        // Debounce scroll as highlight might be changed very frequently, e.g. when there's a replace all command.
        this.listenTo(this.state, 'change:highlightedResult', debouncedScrollListener, {
            priority: 'low'
        });
        // It's possible that the editor will get destroyed before debounced call kicks in.
        // This would result with accessing a view three that is no longer in DOM.
        this.listenTo(this.editor, 'destroy', debouncedScrollListener.cancel);
        this.on('change:_isSearchActive', (evt, name, isSearchActive)=>{
            if (isSearchActive) {
                this.listenTo(this.editor.model.document, 'change:data', this._onDocumentChange);
            } else {
                this.stopListening(this.editor.model.document, 'change:data', this._onDocumentChange);
            }
        });
    }
    /**
	 * Initiate a search.
	 */ find(callbackOrText, findAttributes) {
        this._isSearchActive = true;
        this.editor.execute('find', callbackOrText, findAttributes);
        return this.state.results;
    }
    /**
	 * Stops active results from updating, and clears out the results.
	 */ stop() {
        this.state.clear(this.editor.model);
        this._isSearchActive = false;
    }
    /**
	 * Sets up the commands.
	 */ _defineCommands() {
        this.editor.commands.add('find', new FindCommand(this.editor, this.state));
        this.editor.commands.add('findNext', new FindNextCommand(this.editor, this.state));
        this.editor.commands.add('findPrevious', new FindPreviousCommand(this.editor, this.state));
        this.editor.commands.add('replace', new ReplaceCommand(this.editor, this.state));
        this.editor.commands.add('replaceAll', new ReplaceAllCommand(this.editor, this.state));
    }
    /**
	 * Sets up the marker downcast converters for search results highlighting.
	 */ _defineConverters() {
        const { editor } = this;
        // Setup the marker highlighting conversion.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: 'findResult',
            view: ({ markerName })=>{
                const [, id] = markerName.split(':');
                // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
                // A minimal option is to return a new object for each converted marker...
                return {
                    name: 'span',
                    classes: [
                        'ck-find-result'
                    ],
                    attributes: {
                        // ...however, adding a unique attribute should be future-proof..
                        'data-find-result': id
                    }
                };
            }
        });
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: 'findResultHighlighted',
            view: ({ markerName })=>{
                const [, id] = markerName.split(':');
                // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
                // A minimal option is to return a new object for each converted marker...
                return {
                    name: 'span',
                    classes: [
                        HIGHLIGHT_CLASS
                    ],
                    attributes: {
                        // ...however, adding a unique attribute should be future-proof..
                        'data-find-result': id
                    }
                };
            }
        });
    }
    /**
	 * Reacts to document changes in order to update search list.
	 */ _onDocumentChange = ()=>{
        const changedNodes = new Set();
        const removedMarkers = new Set();
        const model = this.editor.model;
        const { results } = this.state;
        const changes = model.document.differ.getChanges();
        const changedMarkers = model.document.differ.getChangedMarkers();
        // Get nodes in which changes happened to re-run a search callback on them.
        changes.forEach((change)=>{
            if (!change.position) {
                return;
            }
            if (change.name === '$text' || change.position.nodeAfter && model.schema.isInline(change.position.nodeAfter)) {
                changedNodes.add(change.position.parent);
                [
                    ...model.markers.getMarkersAtPosition(change.position)
                ].forEach((markerAtChange)=>{
                    removedMarkers.add(markerAtChange.name);
                });
            } else if (change.type === 'insert' && change.position.nodeAfter) {
                changedNodes.add(change.position.nodeAfter);
            }
        });
        // Get markers from removed nodes also.
        changedMarkers.forEach(({ name, data: { newRange } })=>{
            if (newRange && newRange.start.root.rootName === '$graveyard') {
                removedMarkers.add(name);
            }
        });
        // Get markers from the updated nodes and remove all (search will be re-run on these nodes).
        changedNodes.forEach((node)=>{
            const markersInNode = [
                ...model.markers.getMarkersIntersectingRange(model.createRangeIn(node))
            ];
            markersInNode.forEach((marker)=>removedMarkers.add(marker.name));
        });
        // Remove results from the changed part of content.
        removedMarkers.forEach((markerName)=>{
            if (!results.has(markerName)) {
                return;
            }
            if (results.get(markerName) === this.state.highlightedResult) {
                this.state.highlightedResult = null;
            }
            results.remove(markerName);
        });
        // Run search callback again on updated nodes.
        const changedSearchResults = [];
        const findAndReplaceUtils = this.editor.plugins.get('FindAndReplaceUtils');
        changedNodes.forEach((nodeToCheck)=>{
            const changedNodeSearchResults = findAndReplaceUtils.updateFindResultFromRange(model.createRangeOn(nodeToCheck), model, this.state.lastSearchCallback, results);
            changedSearchResults.push(...changedNodeSearchResults);
        });
        changedMarkers.forEach((markerToCheck)=>{
            // Handle search result highlight update when T&C plugin is active.
            // Lookup is performed only on newly inserted markers.
            if (markerToCheck.data.newRange) {
                const changedNodeSearchResults = findAndReplaceUtils.updateFindResultFromRange(markerToCheck.data.newRange, model, this.state.lastSearchCallback, results);
                changedSearchResults.push(...changedNodeSearchResults);
            }
        });
        if (!this.state.highlightedResult && changedSearchResults.length) {
            // If there are found phrases but none is selected, select the first one.
            this.state.highlightedResult = changedSearchResults[0];
        } else {
            // If there is already highlight item then refresh highlight offset after appending new items.
            this.state.refreshHighlightOffset(model);
        }
    };
}

/**
 * The find and replace plugin.
 *
 * For a detailed overview, check the {@glink features/find-and-replace Find and replace feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:find-and-replace/findandreplaceediting~FindAndReplaceEditing find and replace editing feature},
 * * The {@link module:find-and-replace/findandreplaceui~FindAndReplaceUI find and replace UI feature}
 */ class FindAndReplace extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FindAndReplaceEditing,
            FindAndReplaceUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FindAndReplace';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const ui = this.editor.plugins.get('FindAndReplaceUI');
        const findAndReplaceEditing = this.editor.plugins.get('FindAndReplaceEditing');
        const state = findAndReplaceEditing.state;
        ui.on('findNext', (event, data)=>{
            // Data is contained only for the "find" button.
            if (data) {
                state.searchText = data.searchText;
                findAndReplaceEditing.find(data.searchText, data);
            } else {
                // Find next arrow button press.
                this.editor.execute('findNext');
            }
        });
        ui.on('findPrevious', (event, data)=>{
            if (data && state.searchText !== data.searchText) {
                findAndReplaceEditing.find(data.searchText);
            } else {
                // Subsequent calls.
                this.editor.execute('findPrevious');
            }
        });
        ui.on('replace', (event, data)=>{
            if (state.searchText !== data.searchText) {
                findAndReplaceEditing.find(data.searchText);
            }
            const highlightedResult = state.highlightedResult;
            if (highlightedResult) {
                this.editor.execute('replace', data.replaceText, highlightedResult);
            }
        });
        ui.on('replaceAll', (event, data)=>{
            // The state hadn't been yet built for this search text.
            if (state.searchText !== data.searchText) {
                findAndReplaceEditing.find(data.searchText);
            }
            this.editor.execute('replaceAll', data.replaceText, state.results);
        });
        // Reset the state when the user invalidated last search results, for instance,
        // by starting typing another search query or changing options.
        ui.on('searchReseted', ()=>{
            state.clear(this.editor.model);
            findAndReplaceEditing.stop();
        });
    }
}

export { FindAndReplace, FindAndReplaceEditing, FindAndReplaceFormView, FindAndReplaceState, FindAndReplaceUI, FindAndReplaceUtils, FindCommand, FindNextCommand, FindPreviousCommand, FindReplaceCommandBase, ReplaceAllCommand, ReplaceCommand, sortSearchResultsByMarkerPositions as _sortFindResultsByMarkerPositions };
//# sourceMappingURL=index.js.map

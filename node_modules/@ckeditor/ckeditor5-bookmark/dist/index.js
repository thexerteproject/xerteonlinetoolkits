/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { toWidget, WidgetToolbarRepository, isWidget, Widget } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { View, ViewCollection, FormRowView, FocusCycler, submitHandler, ButtonView, FormHeaderView, LabeledFieldView, createLabeledInputText, IconView, ContextualBalloon, BalloonPanelView, CssTransitionDisablerMixin, MenuBarMenuListItemButtonView, LabelView, clickOutsideHandler } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconBookmarkInline, IconPencil, IconRemove, IconBookmark, IconBookmarkMedium, IconBookmarkSmall } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { FocusTracker, KeystrokeHandler, logWarning } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * The bookmark form view controller class.
 *
 * See {@link module:bookmark/ui/bookmarkformview~BookmarkFormView}.
 */ class BookmarkFormView extends View {
    /**
	 * Tracks information about DOM focus in the form.
	 */ focusTracker = new FocusTracker();
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes = new KeystrokeHandler();
    /**
	 * The ID input view.
	 */ idInputView;
    /**
	 * The Back button view displayed in the header.
	 */ backButtonView;
    /**
	 * A button used to submit the form.
	 */ saveButtonView;
    /**
	 * A collection of form child views in the form.
	 */ children;
    /**
	 * An array of form validators used by {@link #isValid}.
	 */ _validators;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables = new ViewCollection();
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * Creates an instance of the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param validators  Form validators used by {@link #isValid}.
	 */ constructor(locale, validators){
        super(locale);
        this._validators = validators;
        // Create buttons.
        this.backButtonView = this._createBackButton();
        this.saveButtonView = this._createSaveButton();
        // Create input fields.
        this.idInputView = this._createIdInput();
        this.children = this.createCollection([
            this._createHeaderView()
        ]);
        this.children.add(new FormRowView(locale, {
            children: [
                this.idInputView,
                this.saveButtonView
            ],
            class: [
                'ck-form__row_with-submit',
                'ck-form__row_large-top-padding'
            ]
        }));
        // Close the panel on esc key press when the **form has focus**.
        this.keystrokes.set('Esc', (data, cancel)=>{
            this.fire('cancel');
            cancel();
        });
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-bookmark-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
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
        const childViews = [
            this.backButtonView,
            this.idInputView,
            this.saveButtonView
        ];
        childViews.forEach((v)=>{
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist {@link #_focusables} in the form.
	 */ focus() {
        this.idInputView.focus();
    }
    /**
	 * Validates the form and returns `false` when some fields are invalid.
	 */ isValid() {
        this.resetFormStatus();
        for (const validator of this._validators){
            const errorText = validator(this);
            // One error per field is enough.
            if (errorText) {
                // Apply updated error.
                this.idInputView.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
	 * Cleans up the supplementary error and information text of the {@link #idInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */ resetFormStatus() {
        this.idInputView.errorText = null;
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Creates a save button view that saves the bookmark.
	 */ _createSaveButton() {
        const t = this.locale.t;
        const saveButton = new ButtonView(this.locale);
        saveButton.set({
            label: t('Save'),
            withText: true,
            type: 'submit',
            class: 'ck-button-action ck-button-bold'
        });
        return saveButton;
    }
    /**
	 * Creates a header view for the form.
	 */ _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Bookmark')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
    /**
	 * Creates a labeled input view.
	 *
	 * @returns Labeled field view instance.
	 */ _createIdInput() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        labeledInput.label = t('Bookmark name');
        labeledInput.infoText = t('Enter the bookmark name without spaces.');
        labeledInput.class = 'ck-labeled-field-view_full-width';
        return labeledInput;
    }
    /**
	 * The native DOM `value` of the {@link #idInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 */ get id() {
        const { element } = this.idInputView.fieldView;
        if (!element) {
            return null;
        }
        return element.value.trim();
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module bookmark/utils
 */ /**
 * Returns `true` if the bookmark id is valid; otherwise, returns `false`.
 *
 * @internal
 */ function isBookmarkIdValid(id) {
    if (!id || typeof id !== 'string') {
        return false;
    }
    if (/\s/.test(id)) {
        return false;
    }
    return true;
}

/**
 * The insert bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'insertBookmark'`.
 *
 * To insert a bookmark element at place where is the current collapsed selection or where is the beginning of document selection,
 * execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'insertBookmark', { bookmarkId: 'foo_bar' } );
 * ```
 */ class InsertBookmarkCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = this._getPositionToInsertBookmark(selection);
        this.isEnabled = !!position;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.bookmarkId The value of the `bookmarkId` attribute.
	 */ execute(options) {
        if (!options) {
            return;
        }
        const { bookmarkId } = options;
        if (!isBookmarkIdValid(bookmarkId)) {
            /**
			 * Insert bookmark command can be executed only with a valid name.
			 *
			 * A valid bookmark name must be a non-empty string and must not contain any spaces.
			 *
			 * @error insert-bookmark-command-executed-with-invalid-name
			 */ logWarning('insert-bookmark-command-executed-with-invalid-name');
            return;
        }
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        model.change((writer)=>{
            let position = this._getPositionToInsertBookmark(selection);
            const isBookmarkAllowed = model.schema.checkChild(position, 'bookmark');
            // If the position does not allow for `bookmark` but allows for a `paragraph`
            // then insert a `paragraph` then we will insert a `bookmark` inside.
            if (!isBookmarkAllowed) {
                const newPosition = editor.execute('insertParagraph', {
                    position
                });
                if (!newPosition) {
                    return;
                }
                position = newPosition;
            }
            const bookmarkElement = writer.createElement('bookmark', {
                ...Object.fromEntries(selection.getAttributes()),
                bookmarkId
            });
            model.insertObject(bookmarkElement, position, null, {
                setSelection: 'on'
            });
        });
    }
    /**
	 * Returns the position where the bookmark can be inserted. And if it is not possible to insert a bookmark,
	 * check if it is possible to insert a paragraph.
	 */ _getPositionToInsertBookmark(selection) {
        const model = this.editor.model;
        const schema = model.schema;
        const firstRange = selection.getFirstRange();
        const startPosition = firstRange.start;
        // Return position if it is allowed to insert bookmark or if it is allowed to insert paragraph.
        if (isBookmarkAllowed(startPosition, schema)) {
            return startPosition;
        }
        for (const { previousPosition, item } of firstRange){
            // When the table cell is selected (from the outside) we look for the first paragraph-like element inside.
            if (item.is('element') && schema.checkChild(item, '$text') && isBookmarkAllowed(item, schema)) {
                return model.createPositionAt(item, 0);
            }
            if (isBookmarkAllowed(previousPosition, schema)) {
                return previousPosition;
            }
        }
        return null;
    }
}
/**
 * Verify if the given position allows for bookmark insertion. Verify if auto-paragraphing could help.
 */ function isBookmarkAllowed(position, schema) {
    if (schema.checkChild(position, 'bookmark')) {
        return true;
    }
    if (!schema.checkChild(position, 'paragraph')) {
        return false;
    }
    return schema.checkChild('paragraph', 'bookmark');
}

/**
 * The update bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'updateBookmark'`.
 *
 * To update the `bookmarkId` of current selected bookmark element, execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'updateBookmark', { bookmarkId: 'newId' } );
 * ```
 */ class UpdateBookmarkCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedBookmark = getSelectedBookmark(selection);
        this.isEnabled = !!selectedBookmark;
        this.value = selectedBookmark ? selectedBookmark.getAttribute('bookmarkId') : undefined;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.bookmarkId The new value of the `bookmarkId` attribute to set.
	 */ execute(options) {
        if (!options) {
            return;
        }
        const { bookmarkId } = options;
        if (!isBookmarkIdValid(bookmarkId)) {
            /**
			 * Update bookmark command can be executed only with a valid name.
			 *
			 * A valid bookmark name must be a non-empty string and must not contain any spaces.
			 *
			 * @error update-bookmark-command-executed-with-invalid-name
			 */ logWarning('update-bookmark-command-executed-with-invalid-name');
            return;
        }
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedBookmark = getSelectedBookmark(selection);
        if (selectedBookmark) {
            model.change((writer)=>{
                writer.setAttribute('bookmarkId', bookmarkId, selectedBookmark);
            });
        }
    }
}
/**
 * Returns the selected `bookmark` element in the model, if any.
 */ function getSelectedBookmark(selection) {
    const element = selection.getSelectedElement();
    if (!!element && element.is('element', 'bookmark')) {
        return element;
    }
    return null;
}

/**
 * The bookmark editing plugin.
 */ class BookmarkEditing extends Plugin {
    /**
	 * A collection of bookmarks elements in the document.
	 */ _bookmarkElements = new Map();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BookmarkEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'BKM';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('bookmark', {
            toolbar: [
                'bookmarkPreview',
                '|',
                'editBookmark',
                'removeBookmark'
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const { editor } = this;
        this._defineSchema();
        this._defineConverters();
        editor.commands.add('insertBookmark', new InsertBookmarkCommand(editor));
        editor.commands.add('updateBookmark', new UpdateBookmarkCommand(editor));
        this.listenTo(editor.model.document, 'change:data', ()=>{
            this._trackBookmarkElements();
        });
    }
    /**
	 * Returns the model element for the given bookmark ID if it exists.
	 */ getElementForBookmarkId(bookmarkId) {
        for (const [element, id] of this._bookmarkElements){
            if (id == bookmarkId) {
                return element;
            }
        }
        return null;
    }
    /**
	 * Returns all unique bookmark names existing in the content.
	 */ getAllBookmarkNames() {
        return new Set(this._bookmarkElements.values());
    }
    /**
	 * Defines the schema for the bookmark feature.
	 */ _defineSchema() {
        const schema = this.editor.model.schema;
        schema.register('bookmark', {
            inheritAllFrom: '$inlineObject',
            allowAttributes: 'bookmarkId',
            disallowAttributes: [
                'linkHref',
                'htmlA'
            ]
        });
    }
    /**
	 * Defines the converters for the bookmark feature.
	 */ _defineConverters() {
        const { editor } = this;
        const { conversion, t } = editor;
        editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher((element)=>upcastMatcher(element));
        // Register an inline object matcher so that bookmarks <a>s are correctly recognized as inline elements in editing pipeline.
        // This prevents converting spaces around bookmarks to `&nbsp;`s.
        editor.editing.view.domConverter.registerInlineObjectMatcher((element)=>upcastMatcher(element, false));
        conversion.for('dataDowncast').elementToElement({
            model: {
                name: 'bookmark',
                attributes: [
                    'bookmarkId'
                ]
            },
            view: (modelElement, { writer })=>{
                const emptyElement = writer.createEmptyElement('a', {
                    'id': modelElement.getAttribute('bookmarkId')
                });
                // `getFillerOffset` is not needed to set here, because `emptyElement` has already covered it.
                return emptyElement;
            }
        });
        conversion.for('editingDowncast').elementToElement({
            model: {
                name: 'bookmark',
                attributes: [
                    'bookmarkId'
                ]
            },
            view: (modelElement, { writer })=>{
                const id = modelElement.getAttribute('bookmarkId');
                const containerElement = writer.createContainerElement('a', {
                    id,
                    class: 'ck-bookmark'
                }, [
                    this._createBookmarkUIElement(writer)
                ]);
                writer.setCustomProperty('bookmark', true, containerElement);
                this._bookmarkElements.set(modelElement, id);
                // `getFillerOffset` is not needed to set here, because `toWidget` has already covered it.
                const labelCreator = ()=>`${id} ${t('bookmark widget')}`;
                return toWidget(containerElement, writer, {
                    label: labelCreator
                });
            }
        });
        conversion.for('upcast').add((dispatcher)=>dispatcher.on('element:a', dataViewModelAnchorInsertion(editor)));
    }
    /**
	 * Creates a UI element for the `bookmark` representation in editing view.
	 */ _createBookmarkUIElement(writer) {
        return writer.createUIElement('span', {
            class: 'ck-bookmark__icon'
        }, function(domDocument) {
            const domElement = this.toDomElement(domDocument);
            const icon = new IconView();
            icon.set({
                content: IconBookmarkInline,
                isColorInherited: false
            });
            icon.render();
            domElement.appendChild(icon.element);
            return domElement;
        });
    }
    /**
	 * Tracking the added or removed bookmark elements.
	 */ _trackBookmarkElements() {
        this._bookmarkElements.forEach((id, element)=>{
            if (element.root.rootName === '$graveyard') {
                this._bookmarkElements.delete(element);
            }
        });
    }
}
/**
 * A helper function to match an `anchor` element which must contain `id` or `name` attribute but without `href` attribute,
 * also when `expectEmpty` is set to `true` but the element is not empty matcher should not match any element.
 *
 * @param element The element to be checked.
 * @param expectEmpty Default set to `true`, when set to `false` matcher expects that `anchor` is not empty;
 * in editing pipeline it's not empty because it contains the `UIElement`.
 */ function upcastMatcher(element, expectEmpty = true) {
    const isAnchorElement = element.name === 'a';
    if (!isAnchorElement) {
        return null;
    }
    if (expectEmpty && !element.isEmpty) {
        return null;
    }
    const hasIdAttribute = element.hasAttribute('id');
    const hasNameAttribute = element.hasAttribute('name');
    const hasHrefAttribute = element.hasAttribute('href');
    if (hasIdAttribute && !hasHrefAttribute) {
        return {
            name: true,
            attributes: [
                'id'
            ]
        };
    }
    if (hasNameAttribute && !hasHrefAttribute) {
        return {
            name: true,
            attributes: [
                'name'
            ]
        };
    }
    return null;
}
/**
 * A view-to-model converter that handles converting pointed or wrapped anchors with `id` and/or `name` attributes.
 *
 * @returns Returns a conversion callback.
 */ function dataViewModelAnchorInsertion(editor) {
    return (evt, data, conversionApi)=>{
        const viewItem = data.viewItem;
        const match = upcastMatcher(viewItem, false);
        if (!match || !conversionApi.consumable.test(viewItem, match)) {
            return;
        }
        const enableNonEmptyAnchorConversion = isEnabledNonEmptyAnchorConversion(editor);
        if (!enableNonEmptyAnchorConversion && !viewItem.isEmpty) {
            return;
        }
        const modelWriter = conversionApi.writer;
        const anchorId = viewItem.getAttribute('id');
        const anchorName = viewItem.getAttribute('name');
        const bookmarkId = anchorId || anchorName;
        const bookmark = modelWriter.createElement('bookmark', {
            bookmarkId
        });
        if (!conversionApi.safeInsert(bookmark, data.modelCursor)) {
            return;
        }
        conversionApi.consumable.consume(viewItem, match);
        if (anchorId === anchorName) {
            conversionApi.consumable.consume(viewItem, {
                attributes: [
                    'name'
                ]
            });
        }
        conversionApi.updateConversionResult(bookmark, data);
        // Convert children uses the result of `bookmark` insertion to convert the `anchor` content
        // after the bookmark element (not inside it).
        const { modelCursor, modelRange } = conversionApi.convertChildren(viewItem, data.modelCursor);
        data.modelCursor = modelCursor;
        data.modelRange = modelWriter.createRange(data.modelRange.start, modelRange.end);
    };
}
/**
 * Normalize the bookmark configuration option `enableNonEmptyAnchorConversion`.
 */ function isEnabledNonEmptyAnchorConversion(editor) {
    const enableNonEmptyAnchorConversion = editor.config.get('bookmark.enableNonEmptyAnchorConversion');
    // When not defined, option `enableNonEmptyAnchorConversion` by default is set to `true`.
    return enableNonEmptyAnchorConversion !== undefined ? enableNonEmptyAnchorConversion : true;
}

const VISUAL_SELECTION_MARKER_NAME = 'bookmark-ui';
/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */ class BookmarkUI extends Plugin {
    /**
	 * The form view displayed inside the balloon.
	 */ formView = null;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            BookmarkEditing,
            ContextualBalloon,
            WidgetToolbarRepository
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BookmarkUI';
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
        this._balloon = editor.plugins.get(ContextualBalloon);
        // Register the link provider in link plugin to display the link form.
        if (editor.plugins.has('LinkUI')) {
            this._registerLinkProvider();
        }
        // Create toolbar buttons.
        this._registerComponents();
        // Renders a fake visual selection marker on an expanded selection.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: {
                classes: [
                    'ck-fake-bookmark-selection'
                ]
            }
        });
        // Renders a fake visual selection marker on a collapsed selection.
        editor.conversion.for('editingDowncast').markerToElement({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: (data, { writer })=>{
                if (!data.markerRange.isCollapsed) {
                    return null;
                }
                const markerElement = writer.createUIElement('span');
                writer.addClass([
                    'ck-fake-bookmark-selection',
                    'ck-fake-bookmark-selection_collapsed'
                ], markerElement);
                return markerElement;
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const t = editor.locale.t;
        const widgetToolbarRepository = this.editor.plugins.get(WidgetToolbarRepository);
        const defaultPositions = BalloonPanelView.defaultPositions;
        widgetToolbarRepository.register('bookmark', {
            ariaLabel: t('Bookmark toolbar'),
            items: editor.config.get('bookmark.toolbar'),
            getRelatedElement: getSelectedBookmarkWidget,
            balloonClassName: 'ck-bookmark-balloon ck-toolbar-container',
            // Override positions to the same list as for balloon panel default
            // so widget toolbar will try to use same position as form view.
            positions: [
                defaultPositions.southArrowNorth,
                defaultPositions.southArrowNorthMiddleWest,
                defaultPositions.southArrowNorthMiddleEast,
                defaultPositions.southArrowNorthWest,
                defaultPositions.southArrowNorthEast,
                defaultPositions.northArrowSouth,
                defaultPositions.northArrowSouthMiddleWest,
                defaultPositions.northArrowSouthMiddleEast,
                defaultPositions.northArrowSouthWest,
                defaultPositions.northArrowSouthEast,
                defaultPositions.viewportStickyNorth
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
        if (this.formView) {
            this.formView.destroy();
        }
    }
    /**
	 * Creates views.
	 */ _createViews() {
        this.formView = this._createFormView();
        // Attach lifecycle actions to the the balloon.
        this._enableUserBalloonInteractions();
    }
    /**
	 * Creates the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} instance.
	 */ _createFormView() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = locale.t;
        const insertBookmarkCommand = editor.commands.get('insertBookmark');
        const updateBookmarkCommand = editor.commands.get('updateBookmark');
        const commands = [
            insertBookmarkCommand,
            updateBookmarkCommand
        ];
        const formView = new (CssTransitionDisablerMixin(BookmarkFormView))(locale, getFormValidators(editor));
        formView.idInputView.fieldView.bind('value').to(updateBookmarkCommand, 'value');
        formView.saveButtonView.bind('label').to(updateBookmarkCommand, 'value', (value)=>value ? t('Save') : t('Insert'));
        // Form elements should be read-only when corresponding commands are disabled.
        formView.idInputView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isEnabled)=>isEnabled));
        // Disable the "save" button if the command is disabled.
        formView.saveButtonView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isEnabled)=>isEnabled));
        // Close the panel on form after clicking back button.
        this.listenTo(formView, 'cancel', ()=>{
            this._hideFormView();
        });
        // Execute link command after clicking the "Save" button.
        this.listenTo(formView, 'submit', ()=>{
            if (formView.isValid()) {
                const value = formView.id;
                if (this._getSelectedBookmarkElement()) {
                    editor.execute('updateBookmark', {
                        bookmarkId: value
                    });
                } else {
                    editor.execute('insertBookmark', {
                        bookmarkId: value
                    });
                }
                this._hideFormView();
            }
        });
        // Update balloon position when form error changes.
        this.listenTo(formView.idInputView, 'change:errorText', ()=>{
            editor.ui.update();
        });
        return formView;
    }
    /**
	 * Creates link form menu list entry, so it'll be possible to access
	 * the list of the bookmarks from the link form.
	 */ _registerLinkProvider() {
        const t = this.editor.locale.t;
        const linksUI = this.editor.plugins.get('LinkUI');
        const bookmarkEditing = this.editor.plugins.get(BookmarkEditing);
        const getListItems = ()=>Array.from(bookmarkEditing.getAllBookmarkNames()).sort((a, b)=>a.localeCompare(b)).map((bookmarkId)=>({
                    id: bookmarkId,
                    href: `#${bookmarkId}`,
                    label: bookmarkId,
                    icon: IconBookmarkMedium
                }));
        const getItem = (href)=>{
            const bookmark = [
                ...bookmarkEditing.getAllBookmarkNames()
            ].find((item)=>`#${item}` === href);
            if (!bookmark) {
                return null;
            }
            return {
                href,
                label: bookmark,
                icon: IconBookmarkSmall,
                tooltip: t('Scroll to bookmark')
            };
        };
        linksUI.registerLinksListProvider({
            label: t('Bookmarks'),
            emptyListPlaceholder: t('No bookmarks available.'),
            navigate: ({ href })=>this._scrollToBookmark(href),
            getListItems,
            getItem
        });
    }
    /**
	 * Scrolls the editor to the bookmark with the given id.
	 */ _scrollToBookmark(href) {
        const bookmarkEditing = this.editor.plugins.get(BookmarkEditing);
        const bookmarkElement = bookmarkEditing.getElementForBookmarkId(href.slice(1));
        if (!bookmarkElement) {
            return false;
        }
        this.editor.model.change((writer)=>{
            writer.setSelection(bookmarkElement, 'on');
        });
        this.editor.editing.view.scrollToTheSelection({
            alignToTop: true,
            forceScroll: true
        });
        return true;
    }
    /**
	 * Creates a toolbar Bookmark button. Clicking this button will show
	 * a {@link #_balloon} attached to the selection.
	 */ _registerComponents() {
        const editor = this.editor;
        editor.ui.componentFactory.add('bookmark', ()=>{
            const buttonView = this._createBookmarkButton(ButtonView);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:bookmark', ()=>{
            return this._createBookmarkButton(MenuBarMenuListItemButtonView);
        });
        // Bookmark toolbar buttons.
        editor.ui.componentFactory.add('bookmarkPreview', (locale)=>{
            const updateBookmarkCommand = editor.commands.get('updateBookmark');
            const label = new LabelView(locale);
            label.extendTemplate({
                attributes: {
                    class: [
                        'ck-bookmark-toolbar__preview'
                    ]
                }
            });
            label.bind('text').to(updateBookmarkCommand, 'value');
            return label;
        });
        editor.ui.componentFactory.add('editBookmark', (locale)=>{
            const updateBookmarkCommand = editor.commands.get('updateBookmark');
            const button = new ButtonView(locale);
            const t = locale.t;
            button.set({
                label: t('Edit bookmark'),
                icon: IconPencil,
                tooltip: true
            });
            button.bind('isEnabled').to(updateBookmarkCommand);
            this.listenTo(button, 'execute', ()=>{
                this._showFormView();
            });
            return button;
        });
        editor.ui.componentFactory.add('removeBookmark', (locale)=>{
            const deleteCommand = editor.commands.get('delete');
            const button = new ButtonView(locale);
            const t = locale.t;
            button.set({
                label: t('Remove bookmark'),
                icon: IconRemove,
                tooltip: true
            });
            button.bind('isEnabled').to(deleteCommand);
            this.listenTo(button, 'execute', ()=>{
                editor.execute('delete');
                editor.editing.view.focus();
            });
            return button;
        });
    }
    /**
	 * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
	 */ _createBookmarkButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const view = new ButtonClass(locale);
        const insertCommand = editor.commands.get('insertBookmark');
        const updateCommand = editor.commands.get('updateBookmark');
        const t = locale.t;
        view.set({
            label: t('Bookmark'),
            icon: IconBookmark
        });
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.editing.view.scrollToTheSelection();
            this._showFormView();
        });
        view.bind('isEnabled').toMany([
            insertCommand,
            updateCommand
        ], 'isEnabled', (...areEnabled)=>areEnabled.some((isEnabled)=>isEnabled));
        view.bind('isOn').to(updateCommand, 'value', (value)=>!!value);
        return view;
    }
    /**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 */ _enableUserBalloonInteractions() {
        // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
        this.editor.keystrokes.set('Esc', (data, cancel)=>{
            if (this._isFormVisible) {
                this._hideFormView();
                cancel();
            }
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: this.formView,
            activator: ()=>this._isFormInPanel,
            contextElements: ()=>[
                    this._balloon.view.element
                ],
            callback: ()=>{
                // Focusing on the editable during a click outside the balloon panel might
                // cause the selection to move to the beginning of the editable, so we avoid
                // focusing on it during this action.
                // See: https://github.com/ckeditor/ckeditor5/issues/18253
                this._hideFormView(false);
            }
        });
    }
    /**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */ _addFormView() {
        if (!this.formView) {
            this._createViews();
        }
        if (this._isFormInPanel) {
            return;
        }
        const updateBookmarkCommand = this.editor.commands.get('updateBookmark');
        this.formView.disableCssTransitions();
        this.formView.resetFormStatus();
        this._balloon.add({
            view: this.formView,
            position: this._getBalloonPositionData()
        });
        this.formView.backButtonView.isVisible = updateBookmarkCommand.isEnabled;
        this.formView.idInputView.fieldView.value = updateBookmarkCommand.value || '';
        // Select input when form view is currently visible.
        if (this._balloon.visibleView === this.formView) {
            this.formView.idInputView.fieldView.select();
        }
        this.formView.enableCssTransitions();
    }
    /**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */ _removeFormView(updateFocus = true) {
        // Blur the input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.formView.saveButtonView.focus();
        // Reset the ID field to update the state of the submit button.
        this.formView.idInputView.fieldView.reset();
        this._balloon.remove(this.formView);
        // Because the form has an input which has focus, the focus must be brought back
        // to the editor. Otherwise, it would be lost.
        if (updateFocus) {
            this.editor.editing.view.focus();
        }
        this._hideFakeVisualSelection();
    }
    /**
	 * Shows the {@link #formView}.
	 */ _showFormView() {
        if (!this.formView) {
            this._createViews();
        }
        if (!this._getSelectedBookmarkElement()) {
            this._showFakeVisualSelection();
        }
        this._addFormView();
        // Be sure panel with bookmark is visible.
        this._balloon.showStack('main');
        // Begin responding to ui#update once the UI is added.
        this._startUpdatingUI();
    }
    /**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */ _hideFormView(updateFocus = true) {
        if (!this._isFormInPanel) {
            return;
        }
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this.stopListening(this._balloon, 'change:visibleView');
        // Make sure the focus always gets back to the editable _before_ removing the focused form view.
        // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
        if (updateFocus) {
            editor.editing.view.focus();
        }
        // Remove form first because it's on top of the stack.
        this._removeFormView(updateFocus);
        this._hideFakeVisualSelection();
    }
    /**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideFormView} to learn when the UI stops reacting to the `update` event.
	 */ _startUpdatingUI() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        let prevSelectedBookmark = this._getSelectedBookmarkElement();
        let prevSelectionParent = getSelectionParent();
        const update = ()=>{
            const selectedBookmark = this._getSelectedBookmarkElement();
            const selectionParent = getSelectionParent();
            // Hide the panel if:
            //
            // * the selection went out of the EXISTING bookmark element. E.g. user moved the caret out
            //   of the bookmark,
            // * the selection went to a different parent when creating a NEW bookmark. E.g. someone
            //   else modified the document.
            // * the selection has expanded (e.g. displaying bookmark actions then pressing SHIFT+Right arrow).
            //
            if (prevSelectedBookmark && !selectedBookmark || !prevSelectedBookmark && selectionParent !== prevSelectionParent) {
                this._hideFormView();
            } else if (this._isFormVisible) {
                // If still in a bookmark element, simply update the position of the balloon.
                // If there was no bookmark (e.g. inserting one), the balloon must be moved
                // to the new position in the editing view (a new native DOM range).
                this._balloon.updatePosition(this._getBalloonPositionData());
            }
            prevSelectedBookmark = selectedBookmark;
            prevSelectionParent = selectionParent;
        };
        function getSelectionParent() {
            return viewDocument.selection.focus.getAncestors().reverse().find((node)=>node.is('element'));
        }
        this.listenTo(editor.ui, 'update', update);
        this.listenTo(this._balloon, 'change:visibleView', update);
    }
    /**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon}.
	 */ get _isFormInPanel() {
        return !!this.formView && this._balloon.hasView(this.formView);
    }
    /**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon} and it is currently visible.
	 */ get _isFormVisible() {
        return !!this.formView && this._balloon.visibleView == this.formView;
    }
    /**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 */ _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const model = this.editor.model;
        let target;
        const bookmarkElement = this._getSelectedBookmarkElement();
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            // There are cases when we highlight selection using a marker (#7705, #4721).
            const markerViewElements = Array.from(this.editor.editing.mapper.markerNameToElements(VISUAL_SELECTION_MARKER_NAME));
            const newRange = view.createRange(view.createPositionBefore(markerViewElements[0]), view.createPositionAfter(markerViewElements[markerViewElements.length - 1]));
            target = view.domConverter.viewRangeToDom(newRange);
        } else if (bookmarkElement) {
            target = ()=>{
                const mapper = this.editor.editing.mapper;
                const domConverter = view.domConverter;
                const viewElement = mapper.toViewElement(bookmarkElement);
                return domConverter.mapViewToDom(viewElement);
            };
        }
        if (!target) {
            return;
        }
        return {
            target
        };
    }
    /**
	 * Returns the bookmark {@link module:engine/view/attributeelement~ViewAttributeElement} under
	 * the {@link module:engine/view/document~ViewDocument editing view's} selection or `null`
	 * if there is none.
	 */ _getSelectedBookmarkElement() {
        const selection = this.editor.model.document.selection;
        const element = selection.getSelectedElement();
        if (element && element.is('element', 'bookmark')) {
            return element;
        }
        return null;
    }
    /**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds a 'bookmark-ui' marker into the document that is rendered as a highlight on selected text fragment.
	 */ _showFakeVisualSelection() {
        const model = this.editor.model;
        model.change((writer)=>{
            const range = model.document.selection.getFirstRange();
            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, {
                    range
                });
            } else {
                if (range.start.isAtEnd) {
                    const startPosition = range.start.getLastMatchingPosition(({ item })=>!model.schema.isContent(item), {
                        boundaries: range
                    });
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range: writer.createRange(startPosition, range.end)
                    });
                } else {
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range
                    });
                }
            }
        });
    }
    /**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */ _hideFakeVisualSelection() {
        const model = this.editor.model;
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            model.change((writer)=>{
                writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
            });
        }
    }
}
/**
 * Returns bookmark form validation callbacks.
 */ function getFormValidators(editor) {
    const { t } = editor;
    const bookmarkEditing = editor.plugins.get(BookmarkEditing);
    return [
        (form)=>{
            if (!form.id) {
                return t('Bookmark must not be empty.');
            }
        },
        (form)=>{
            if (form.id && /\s/.test(form.id)) {
                return t('Bookmark name cannot contain space characters.');
            }
        },
        (form)=>{
            const selectedElement = editor.model.document.selection.getSelectedElement();
            const existingBookmarkForId = bookmarkEditing.getElementForBookmarkId(form.id);
            // Accept change of bookmark ID if no real change is happening (edit -> submit, without changes).
            if (selectedElement === existingBookmarkForId) {
                return;
            }
            if (existingBookmarkForId) {
                return t('Bookmark name already exists.');
            }
        }
    ];
}
/**
 * Returns the currently selected bookmark view element.
 */ function getSelectedBookmarkWidget(selection) {
    const element = selection.getSelectedElement();
    if (!element || !isWidget(element) || !element.getCustomProperty('bookmark')) {
        return null;
    }
    return element;
}

/**
 * The bookmark feature.
 *
 * For a detailed overview, check the {@glink features/bookmarks Bookmarks} feature guide.
 */ class Bookmark extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Bookmark';
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            BookmarkEditing,
            BookmarkUI,
            Widget
        ];
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Bookmark, BookmarkEditing, BookmarkFormView, BookmarkUI, InsertBookmarkCommand, UpdateBookmarkCommand, isBookmarkIdValid as _isBookmarkIdValid };
//# sourceMappingURL=index.js.map

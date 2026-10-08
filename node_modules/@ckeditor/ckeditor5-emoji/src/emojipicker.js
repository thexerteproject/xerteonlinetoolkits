/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/emojipicker
 */
import { ButtonView, clickOutsideHandler, ContextualBalloon, Dialog, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { IconEmoji } from 'ckeditor5/src/icons.js';
import { EmojiCommand } from './emojicommand.js';
import { EmojiRepository } from './emojirepository.js';
import { EmojiPickerView } from './ui/emojipickerview.js';
import { EmojiPickerFormView } from './ui/emojipickerformview.js';
import '../theme/emojipicker.css';
const VISUAL_SELECTION_MARKER_NAME = 'emoji-picker';
/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export class EmojiPicker extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [EmojiRepository, ContextualBalloon, Dialog, Typing];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'EmojiPicker';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    async init() {
        const editor = this.editor;
        this.balloonPlugin = editor.plugins.get('ContextualBalloon');
        this.emojiRepositoryPlugin = editor.plugins.get('EmojiRepository');
        // Skip registering a button in the toolbar and list item in the menu bar if the emoji repository is not ready.
        if (!await this.emojiRepositoryPlugin.isReady()) {
            return;
        }
        const command = new EmojiCommand(editor);
        editor.commands.add('emoji', command);
        editor.ui.componentFactory.add('emoji', () => {
            const button = this._createButton(ButtonView, command);
            button.set({
                tooltip: true
            });
            return button;
        });
        editor.ui.componentFactory.add('menuBar:emoji', () => {
            return this._createButton(MenuBarMenuListItemButtonView, command);
        });
        this._setupConversion();
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        if (this.emojiPickerView) {
            this.emojiPickerView.destroy();
        }
    }
    /**
     * Represents an active skin tone. Its value depends on the emoji UI plugin.
     *
     * Before opening the UI for the first time, the returned value is read from the editor configuration.
     * Otherwise, it reflects the user's intention.
     */
    get skinTone() {
        if (!this.emojiPickerView) {
            return this.editor.config.get('emoji.skinTone');
        }
        return this.emojiPickerView.gridView.skinTone;
    }
    /**
     * Displays the balloon with the emoji picker.
     *
     * @param [searchValue=''] A default query used to filer the grid when opening the UI.
     */
    showUI(searchValue = '') {
        // Show visual selection on a text when the contextual balloon is displayed.
        // See #17654.
        this._showFakeVisualSelection();
        if (!this.emojiPickerView) {
            this.emojiPickerView = this._createEmojiPickerView();
        }
        if (searchValue) {
            this.emojiPickerView.searchView.setInputValue(searchValue);
        }
        this.emojiPickerView.searchView.search(searchValue);
        if (!this.emojiPickerFormView) {
            this.emojiPickerFormView = this._createEmojiPickerFormView();
        }
        if (!this.balloonPlugin.hasView(this.emojiPickerFormView)) {
            // Show back button if there is another balloon view visible.
            this.emojiPickerFormView.backButtonView.isVisible = !!this.balloonPlugin.visibleView;
            this.balloonPlugin.add({
                view: this.emojiPickerFormView,
                position: this._getBalloonPositionData(),
                balloonClassName: 'ck-emoji-picker-balloon'
            });
        }
        this.emojiPickerView.focus();
    }
    /**
     * Creates a button for toolbar and menu bar that will show the emoji dialog.
     */
    _createButton(ViewClass, command) {
        const buttonView = new ViewClass(this.editor.locale);
        const t = this.editor.locale.t;
        buttonView.bind('isEnabled').to(command, 'isEnabled');
        buttonView.set({
            label: t('Emoji'),
            icon: IconEmoji,
            isToggleable: true
        });
        buttonView.on('execute', () => {
            this.editor.editing.view.scrollToTheSelection();
            this.showUI();
        });
        return buttonView;
    }
    /**
     * Creates an instance of the `EmojiPickerView` class that represents an emoji balloon.
     */
    _createEmojiPickerView() {
        const emojiPickerView = new EmojiPickerView(this.editor.locale, {
            emojiCategories: this.emojiRepositoryPlugin.getEmojiCategories(),
            skinTone: this.editor.config.get('emoji.skinTone'),
            skinTones: this.emojiRepositoryPlugin.getSkinTones(),
            getEmojiByQuery: (query) => {
                return this.emojiRepositoryPlugin.getEmojiByQuery(query);
            }
        });
        // Insert an emoji on a tile click.
        this.listenTo(emojiPickerView.gridView, 'execute', (evt, data) => {
            const editor = this.editor;
            const textToInsert = data.emoji;
            this._hideUI();
            editor.execute('insertText', { text: textToInsert });
        });
        return emojiPickerView;
    }
    /**
     * Creates an instance of the `EmojiPickerFormView` class that represents a balloon with the emoji picker.
     */
    _createEmojiPickerFormView() {
        const emojiPickerFormView = new EmojiPickerFormView(this.editor.locale);
        emojiPickerFormView.children.add(this.emojiPickerView);
        // Update the balloon position when layout is changed.
        this.listenTo(this.emojiPickerView, 'update', () => {
            if (this.balloonPlugin.visibleView === emojiPickerFormView) {
                this.balloonPlugin.updatePosition();
            }
        });
        // Close the dialog when the back button is clicked.
        this.listenTo(emojiPickerFormView, 'cancel', () => {
            this._hideUI();
        });
        // Close the panel on `Esc` key press when the **actions have focus**.
        emojiPickerFormView.keystrokes.set('Esc', (data, cancel) => {
            this._hideUI();
            cancel();
        });
        // Close the dialog when clicking outside of it.
        clickOutsideHandler({
            emitter: emojiPickerFormView,
            contextElements: [this.balloonPlugin.view.element],
            callback: () => {
                // Focusing on the editable during a click outside the balloon panel might
                // cause the selection to move to the beginning of the editable, so we avoid
                // focusing on it during this action.
                // See: https://github.com/ckeditor/ckeditor5/issues/18253
                this._hideUI(false);
            },
            activator: () => this.balloonPlugin.visibleView === emojiPickerFormView
        });
        return emojiPickerFormView;
    }
    /**
     * Hides the balloon with the emoji picker.
     *
     * @param updateFocus Whether to focus the editor after closing the emoji picker.
     */
    _hideUI(updateFocus = true) {
        this.balloonPlugin.remove(this.emojiPickerFormView);
        this.emojiPickerView.searchView.setInputValue('');
        if (updateFocus) {
            this.editor.editing.view.focus();
        }
        this._hideFakeVisualSelection();
    }
    /**
     * Registers converters.
     */
    _setupConversion() {
        const editor = this.editor;
        // Renders a fake visual selection marker on an expanded selection.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: {
                classes: ['ck-fake-emoji-selection']
            }
        });
        // Renders a fake visual selection marker on a collapsed selection.
        editor.conversion.for('editingDowncast').markerToElement({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: (data, { writer }) => {
                if (!data.markerRange.isCollapsed) {
                    return null;
                }
                const markerElement = writer.createUIElement('span');
                writer.addClass(['ck-fake-emoji-selection', 'ck-fake-emoji-selection_collapsed'], markerElement);
                return markerElement;
            }
        });
    }
    /**
     * Returns positioning options for the {@link #balloonPlugin}. They control the way the balloon is attached
     * to the target element or selection.
     */
    _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;
        // Set a target position by converting view selection range to DOM.
        const target = () => view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());
        return {
            target
        };
    }
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds an 'emoji-picker' marker into the document that is rendered as a highlight on selected text fragment.
     */
    _showFakeVisualSelection() {
        const model = this.editor.model;
        model.change(writer => {
            const range = model.document.selection.getFirstRange();
            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, { range });
            }
            else {
                if (range.start.isAtEnd) {
                    const startPosition = range.start.getLastMatchingPosition(({ item }) => !model.schema.isContent(item), { boundaries: range });
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range: writer.createRange(startPosition, range.end)
                    });
                }
                else {
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
     * Hides the fake visual selection.
     */
    _hideFakeVisualSelection() {
        const model = this.editor.model;
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            model.change(writer => {
                writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
            });
        }
    }
}

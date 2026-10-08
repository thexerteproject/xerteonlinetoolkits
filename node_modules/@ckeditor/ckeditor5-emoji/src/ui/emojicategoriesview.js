/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojicategoriesview
 */
import { ButtonView, View, FocusCycler } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import '../../theme/emojicategories.css';
/**
 * A class representing the navigation part of the emoji UI.
 * It is responsible allowing the user to select a particular emoji category.
 */
export class EmojiCategoriesView extends View {
    /**
     * Tracks information about the DOM focus in the grid.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Helps cycling over focusable children in the input view.
     */
    focusCycler;
    /**
     * A collection of the categories buttons.
     */
    buttonViews;
    /**
     * @inheritDoc
     */
    constructor(locale, { emojiCategories, categoryName }) {
        super(locale);
        this.buttonViews = this.createCollection(emojiCategories.map(emojiCategory => this._createCategoryButton(emojiCategory)));
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.focusCycler = new FocusCycler({
            focusables: this.buttonViews,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'arrowleft',
                focusNext: 'arrowright'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-emoji__categories-list'],
                role: 'tablist'
            },
            children: this.buttonViews
        });
        this.on('change:categoryName', (event, name, newValue, oldValue) => {
            const oldCategoryButton = this.buttonViews.find(button => button.tooltip === oldValue);
            if (oldCategoryButton) {
                oldCategoryButton.isOn = false;
            }
            const newCategoryButton = this.buttonViews.find(button => button.tooltip === newValue);
            newCategoryButton.isOn = true;
        });
        this.set('categoryName', categoryName);
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.buttonViews.forEach(buttonView => {
            this.focusTracker.add(buttonView);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
        this.buttonViews.destroy();
    }
    /**
     * @inheritDoc
     */
    focus() {
        this.buttonViews.first.focus();
    }
    /**
     * Marks all categories buttons as enabled (clickable).
     */
    enableCategories() {
        this.buttonViews.forEach(buttonView => {
            buttonView.isEnabled = true;
        });
    }
    /**
     * Marks all categories buttons as disabled (non-clickable).
     */
    disableCategories() {
        this.buttonViews.forEach(buttonView => {
            buttonView.set({
                class: '',
                isEnabled: false,
                isOn: false
            });
        });
    }
    /**
     * Creates a button representing a category item.
     */
    _createCategoryButton(emojiCategory) {
        const buttonView = new ButtonView();
        const bind = buttonView.bindTemplate;
        // A `[role="tab"]` element requires also the `[aria-selected]` attribute with its state.
        buttonView.extendTemplate({
            attributes: {
                'aria-selected': bind.to('isOn', value => value.toString()),
                class: [
                    'ck-emoji__category-item'
                ]
            }
        });
        buttonView.set({
            ariaLabel: emojiCategory.title,
            label: emojiCategory.icon,
            role: 'tab',
            tooltip: emojiCategory.title,
            withText: true,
            // To improve accessibility, disconnect a button and its label connection so that screen
            // readers can read the `[aria-label]` attribute directly from the more descriptive button.
            ariaLabelledBy: undefined
        });
        buttonView.on('execute', () => {
            this.categoryName = emojiCategory.title;
        });
        buttonView.on('change:isEnabled', () => {
            if (buttonView.isEnabled && buttonView.tooltip === this.categoryName) {
                buttonView.isOn = true;
            }
        });
        return buttonView;
    }
}

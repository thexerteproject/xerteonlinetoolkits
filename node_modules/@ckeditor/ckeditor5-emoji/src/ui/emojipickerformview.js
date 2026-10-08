/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojipickerformview
 */
import { ButtonView, FocusCycler, FormHeaderView, View, ViewCollection, isFocusable, isViewWithFocusCycler } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';
// See: https://github.com/ckeditor/ckeditor5/issues/8833
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../theme/emojipickerform.css';
/**
 * The emoji picker form view.
 */
export class EmojiPickerFormView extends View {
    /**
     * The Back button view displayed in the header.
     */
    backButtonView;
    /**
     * Tracks information about DOM focus in the form.
     */
    focusTracker = new FocusTracker();
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes = new KeystrokeHandler();
    /**
     * A collection of child views.
     */
    children;
    /**
     * A collection of views that can be focused in the form.
     */
    _focusables = new ViewCollection();
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    _focusCycler;
    /**
     * Creates an instance of the {@link module:emoji/ui/emojipickerformview~EmojiPickerFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        this.backButtonView = this._createBackButton();
        this.children = this.createCollection([
            this._createHeaderView()
        ]);
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backward using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-emoji-picker-form',
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
     */
    render() {
        super.render();
        const childViews = [
            ...this.children.filter(isFocusable),
            this.backButtonView
        ];
        childViews.forEach(v => {
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
            // Register the view in the focus cycler to avoid nested focus cycles traps.
            if (isViewWithFocusCycler(v)) {
                this._focusCycler.chain(v.focusCycler);
            }
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
    /**
     * Creates a back button view that cancels the form.
     */
    _createBackButton() {
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
     * Creates a header view for the form.
     */
    _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Emoji picker')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
}

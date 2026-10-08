/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/ui/listpropertiesview
 */
import { ButtonView, View, ViewCollection, FocusCycler, SwitchButtonView, LabeledFieldView, createLabeledInputNumber, addKeyboardHandlingForGrid, CollapsibleView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, global } from 'ckeditor5/src/utils.js';
import '../../../theme/listproperties.css';
/**
 * The list properties view to be displayed in the list dropdown.
 *
 * Contains a grid of available list styles and, for numbered list, also the list start index and reversed fields.
 *
 * @internal
 */
export class ListPropertiesView extends View {
    /**
     * A collection of the child views.
     */
    children;
    /**
     * A view that renders the grid of list styles.
     */
    stylesView = null;
    /**
     * A collapsible view that hosts additional list property fields ({@link #startIndexFieldView} and
     * {@link #reversedSwitchButtonView}) to visually separate them from the {@link #stylesView grid of styles}.
     *
     * **Note**: Only present when:
     * * the view represents **numbered** list properties,
     * * and the {@link #stylesView} is rendered,
     * * and either {@link #startIndexFieldView} or {@link #reversedSwitchButtonView} is rendered.
     *
     * @readonly
     */
    additionalPropertiesCollapsibleView = null;
    /**
     * A labeled number field allowing the user to set the start index of the list.
     *
     * **Note**: Only present when the view represents **numbered** list properties.
     *
     * @readonly
     */
    startIndexFieldView = null;
    /**
     * A switch button allowing the user to make the edited list reversed.
     *
     * **Note**: Only present when the view represents **numbered** list properties.
     *
     * @readonly
     */
    reversedSwitchButtonView = null;
    /**
     * Tracks information about the DOM focus in the view.
     */
    focusTracker = new FocusTracker();
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes = new KeystrokeHandler();
    /**
     * A collection of views that can be focused in the properties view.
     */
    focusables = new ViewCollection();
    /**
     * Helps cycling over {@link #focusables} in the view.
     */
    focusCycler;
    /**
     * Creates an instance of the list properties view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param options Options of the view.
     * @param options.enabledProperties An object containing the configuration of enabled list property names.
     * Allows conditional rendering the sub-components of the properties view.
     * @param options.styleButtonViews A list of style buttons to be rendered
     * inside the styles grid. The grid will not be rendered when `enabledProperties` does not include the `'styles'` key.
     * @param options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
     */
    constructor(locale, { enabledProperties, styleButtonViews, styleGridAriaLabel }) {
        super(locale);
        const elementCssClasses = [
            'ck',
            'ck-list-properties'
        ];
        this.children = this.createCollection();
        this.focusCycler = new FocusCycler({
            focusables: this.focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate #children backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: 'shift + tab',
                // Navigate #children forwards using the <kbd>Tab</kbd> key.
                focusNext: 'tab'
            }
        });
        // The rendering of the styles grid is conditional. When there is no styles grid, the view will render without collapsible
        // for numbered list properties, hence simplifying the layout.
        if (styleButtonViews && styleButtonViews.length) {
            this.stylesView = this._createStylesView(styleButtonViews, styleGridAriaLabel);
            this.children.add(this.stylesView);
        }
        else {
            elementCssClasses.push('ck-list-properties_without-styles');
        }
        // The rendering of the numbered list property views is also conditional. It only makes sense for the numbered list
        // dropdown. The unordered list does not have such properties.
        if (enabledProperties.startIndex || enabledProperties.reversed) {
            this._addNumberedListPropertyViews(enabledProperties);
            elementCssClasses.push('ck-list-properties_with-numbered-properties');
        }
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: elementCssClasses
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        if (this.stylesView) {
            this.focusables.add(this.stylesView);
            this.focusTracker.add(this.stylesView.element);
            // Register the collapsible toggle button to the focus system.
            if (this.startIndexFieldView || this.reversedSwitchButtonView) {
                this.focusables.add(this.children.last.buttonView);
                this.focusTracker.add(this.children.last.buttonView.element);
            }
            for (const item of this.stylesView.children) {
                this.stylesView.focusTracker.add(item.element);
            }
            addKeyboardHandlingForGrid({
                keystrokeHandler: this.stylesView.keystrokes,
                focusTracker: this.stylesView.focusTracker,
                gridItems: this.stylesView.children,
                // Note: The styles view has a different number of columns depending on whether the other properties
                // are enabled in the dropdown or not (https://github.com/ckeditor/ckeditor5/issues/12340)
                numberOfColumns: () => global.window
                    .getComputedStyle(this.stylesView.element)
                    .getPropertyValue('grid-template-columns')
                    .split(' ')
                    .length,
                uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
            });
        }
        if (this.startIndexFieldView) {
            this.focusables.add(this.startIndexFieldView);
            this.focusTracker.add(this.startIndexFieldView.element);
            const stopPropagation = (data) => data.stopPropagation();
            // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
            // keystroke handler would take over the key management in the input. We need to prevent
            // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
            this.keystrokes.set('arrowright', stopPropagation);
            this.keystrokes.set('arrowleft', stopPropagation);
            this.keystrokes.set('arrowup', stopPropagation);
            this.keystrokes.set('arrowdown', stopPropagation);
        }
        if (this.reversedSwitchButtonView) {
            this.focusables.add(this.reversedSwitchButtonView);
            this.focusTracker.add(this.reversedSwitchButtonView.element);
        }
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    focus() {
        this.focusCycler.focusFirst();
    }
    /**
     * @inheritDoc
     */
    focusLast() {
        this.focusCycler.focusLast();
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
     * Creates the list styles grid.
     *
     * @param styleButtons Buttons to be placed in the grid.
     * @param styleGridAriaLabel The assistive technology label of the grid.
     */
    _createStylesView(styleButtons, styleGridAriaLabel) {
        const stylesView = new View(this.locale);
        stylesView.children = stylesView.createCollection();
        stylesView.children.addMany(styleButtons);
        stylesView.setTemplate({
            tag: 'div',
            attributes: {
                'aria-label': styleGridAriaLabel,
                class: [
                    'ck',
                    'ck-list-styles-list'
                ]
            },
            children: stylesView.children
        });
        stylesView.children.delegate('execute').to(this);
        stylesView.focus = function () {
            // If there is a button that is already on, focus it.
            // It's counterintuitive to focus the first button when there is already a button on.
            for (const child of this.children) {
                if (child instanceof ButtonView && child.isOn) {
                    child.focus();
                    return;
                }
            }
            // ... otherwise focus the first button.
            this.children.first.focus();
        };
        stylesView.focusTracker = new FocusTracker();
        stylesView.keystrokes = new KeystrokeHandler();
        stylesView.render();
        stylesView.keystrokes.listenTo(stylesView.element);
        return stylesView;
    }
    /**
     * Renders {@link #startIndexFieldView} and/or {@link #reversedSwitchButtonView} depending on the configuration of the properties view.
     *
     * @param enabledProperties An object containing the configuration of enabled list property names
     * (see {@link #constructor}).
     */
    _addNumberedListPropertyViews(enabledProperties) {
        const t = this.locale.t;
        const numberedPropertyViews = [];
        if (enabledProperties.startIndex) {
            this.startIndexFieldView = this._createStartIndexField();
            numberedPropertyViews.push(this.startIndexFieldView);
        }
        if (enabledProperties.reversed) {
            this.reversedSwitchButtonView = this._createReversedSwitchButton();
            numberedPropertyViews.push(this.reversedSwitchButtonView);
        }
        // When there are some style buttons, pack the numbered list properties into a collapsible to separate them.
        if (this.stylesView) {
            this.additionalPropertiesCollapsibleView = new CollapsibleView(this.locale, numberedPropertyViews);
            this.additionalPropertiesCollapsibleView.set({
                label: t('List properties'),
                isCollapsed: true
            });
            // Don't enable the collapsible view unless either start index or reversed field is enabled (e.g. when no list is selected).
            this.additionalPropertiesCollapsibleView.buttonView.bind('isEnabled').toMany(numberedPropertyViews, 'isEnabled', (...areEnabled) => areEnabled.some(isEnabled => isEnabled));
            // Automatically collapse the additional properties collapsible when either start index or reversed field gets disabled.
            this.additionalPropertiesCollapsibleView.buttonView.on('change:isEnabled', (evt, data, isEnabled) => {
                if (!isEnabled) {
                    this.additionalPropertiesCollapsibleView.isCollapsed = true;
                }
            });
            this.children.add(this.additionalPropertiesCollapsibleView);
        }
        else {
            this.children.addMany(numberedPropertyViews);
        }
    }
    /**
     * Creates the list start index labeled field.
     */
    _createStartIndexField() {
        const t = this.locale.t;
        const startIndexFieldView = new LabeledFieldView(this.locale, createLabeledInputNumber);
        startIndexFieldView.set({
            label: t('Start at'),
            class: 'ck-numbered-list-properties__start-index'
        });
        startIndexFieldView.fieldView.set({
            min: 0,
            step: 1,
            value: 1,
            inputMode: 'numeric'
        });
        startIndexFieldView.fieldView.on('input', () => {
            const inputElement = startIndexFieldView.fieldView.element;
            const startIndex = inputElement.valueAsNumber;
            if (Number.isNaN(startIndex)) {
                // Number inputs allow for the entry of characters that may result in NaN,
                // such as 'e', '+', '123e', '2-'.
                startIndexFieldView.errorText = t('Invalid start index value.');
                return;
            }
            if (!inputElement.checkValidity()) {
                startIndexFieldView.errorText = t('Start index must be greater than 0.');
            }
            else {
                this.fire('listStart', { startIndex });
            }
        });
        return startIndexFieldView;
    }
    /**
     * Creates the reversed list switch button.
     */
    _createReversedSwitchButton() {
        const t = this.locale.t;
        const reversedButtonView = new SwitchButtonView(this.locale);
        reversedButtonView.set({
            withText: true,
            label: t('Reversed order'),
            class: 'ck-numbered-list-properties__reversed-order'
        });
        reversedButtonView.delegate('execute').to(this, 'listReversed');
        return reversedButtonView;
    }
}

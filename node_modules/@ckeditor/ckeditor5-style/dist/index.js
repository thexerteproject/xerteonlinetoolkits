/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ButtonView, View, addKeyboardHandlingForGrid, LabelView, ViewCollection, FocusCycler, createDropdown } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { FocusTracker, KeystrokeHandler, first, logWarning } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { isObject } from 'es-toolkit/compat';
import { findAttributeRange, findAttributeRangeBound } from '@ckeditor/ckeditor5-typing/dist/index.js';

/**
 * A class representing an individual button (style) in the grid. Renders a rich preview of the style.
 *
 * @internal
 */ class StyleGridButtonView extends ButtonView {
    /**
	 * Definition of the style the button will apply when executed.
	 */ styleDefinition;
    /**
	 * The view rendering the preview of the style.
	 */ previewView;
    /**
	 * Creates an instance of the {@link module:style/ui/stylegridbuttonview~StyleGridButtonView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinition Definition of the style.
	 */ constructor(locale, styleDefinition){
        super(locale);
        this.styleDefinition = styleDefinition;
        this.previewView = this._createPreview();
        this.set({
            label: styleDefinition.name,
            class: 'ck-style-grid__button',
            withText: true
        });
        this.extendTemplate({
            attributes: {
                role: 'option'
            }
        });
        this.children.add(this.previewView, 0);
    }
    /**
	 * Creates the view representing the preview of the style.
	 */ _createPreview() {
        const previewView = new View(this.locale);
        previewView.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-reset_all-excluded',
                    'ck-style-grid__button__preview',
                    'ck-content'
                ],
                // The preview "AaBbCcDdEeFfGgHhIiJj" should not be read by screen readers because it is purely presentational.
                'aria-hidden': 'true'
            },
            children: [
                this.styleDefinition.previewTemplate
            ]
        });
        return previewView;
    }
}

/**
 * A class representing a grid of styles ({@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}).
 * Allows users to select a style.
 *
 * @internal
 */ class StyleGridView extends View {
    /**
	 * Tracks information about the DOM focus in the view.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of style {@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}.
	 */ children;
    /**
	 * Creates an instance of the {@link module:style/ui/stylegridview~StyleGridView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinitions Definitions of the styles.
	 */ constructor(locale, styleDefinitions){
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.set('activeStyles', []);
        this.set('enabledStyles', []);
        this.children = this.createCollection();
        this.children.delegate('execute').to(this);
        for (const definition of styleDefinitions){
            const gridTileView = new StyleGridButtonView(locale, definition);
            this.children.add(gridTileView);
        }
        this.on('change:activeStyles', ()=>{
            for (const child of this.children){
                child.isOn = this.activeStyles.includes(child.styleDefinition.name);
            }
        });
        this.on('change:enabledStyles', ()=>{
            for (const child of this.children){
                child.isEnabled = this.enabledStyles.includes(child.styleDefinition.name);
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-style-grid'
                ],
                role: 'listbox'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        for (const child of this.children){
            this.focusTracker.add(child.element);
        }
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.children,
            numberOfColumns: 3,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
        // Start listening for the keystrokes coming from the grid view.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * Focuses the first style button in the grid.
	 */ focus() {
        this.children.first.focus();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
}

/**
 * A class representing a group of styles (e.g. "block" or "inline").
 *
 * Renders a {@link module:style/ui/stylegridview~StyleGridView style grid} and a label.
 *
 * @internal
 */ class StyleGroupView extends View {
    /**
	 * The styles grid of the group.
	 */ gridView;
    /**
	 * The label of the group.
	 */ labelView;
    /**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param locale The localization services instance.
	 * @param label The localized label of the group.
	 * @param styleDefinitions Definitions of the styles in the group.
	 */ constructor(locale, label, styleDefinitions){
        super(locale);
        this.labelView = new LabelView(locale);
        this.labelView.text = label;
        this.gridView = new StyleGridView(locale, styleDefinitions);
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-style-panel__style-group'
                ],
                role: 'group',
                'aria-labelledby': this.labelView.id
            },
            children: [
                this.labelView,
                this.gridView
            ]
        });
    }
}

/**
 * A class representing a panel with available content styles. It renders styles in button grids, grouped
 * in categories.
 *
 * @internal
 */ class StylePanelView extends View {
    /**
	 * Tracks information about DOM focus in the panel.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of panel children.
	 */ children;
    /**
	 * A view representing block styles group.
	 */ blockStylesGroupView;
    /**
	 * A view representing inline styles group
	 */ inlineStylesGroupView;
    /**
	 * A collection of views that can be focused in the panel.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the panel.
	 */ _focusCycler;
    /**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinitions Normalized definitions of the styles.
	 */ constructor(locale, styleDefinitions){
        super(locale);
        const t = locale.t;
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.blockStylesGroupView = new StyleGroupView(locale, t('Block styles'), styleDefinitions.block);
        this.inlineStylesGroupView = new StyleGroupView(locale, t('Text styles'), styleDefinitions.inline);
        this.set('activeStyles', []);
        this.set('enabledStyles', []);
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate style groups backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: [
                    'shift + tab'
                ],
                // Navigate style groups forward using the <kbd>Tab</kbd> key.
                focusNext: [
                    'tab'
                ]
            }
        });
        if (styleDefinitions.block.length) {
            this.children.add(this.blockStylesGroupView);
        }
        if (styleDefinitions.inline.length) {
            this.children.add(this.inlineStylesGroupView);
        }
        this.blockStylesGroupView.gridView.delegate('execute').to(this);
        this.inlineStylesGroupView.gridView.delegate('execute').to(this);
        this.blockStylesGroupView.gridView.bind('activeStyles', 'enabledStyles').to(this, 'activeStyles', 'enabledStyles');
        this.inlineStylesGroupView.gridView.bind('activeStyles', 'enabledStyles').to(this, 'activeStyles', 'enabledStyles');
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-style-panel'
                ]
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        // Register the views as focusable.
        this._focusables.add(this.blockStylesGroupView.gridView);
        this._focusables.add(this.inlineStylesGroupView.gridView);
        // Register the views in the focus tracker.
        this.focusTracker.add(this.blockStylesGroupView.gridView.element);
        this.focusTracker.add(this.inlineStylesGroupView.gridView.element);
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * Focuses the first focusable element in the panel.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Focuses the last focusable element in the panel.
	 */ focusLast() {
        this._focusCycler.focusLast();
    }
}

// These are intermediate element names that can't be rendered as style preview because they don't make sense standalone.
const NON_PREVIEWABLE_ELEMENT_NAMES = [
    'caption',
    'colgroup',
    'dd',
    'dt',
    'figcaption',
    'legend',
    'li',
    'optgroup',
    'option',
    'rp',
    'rt',
    'summary',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr'
];
class StyleUtils extends Plugin {
    _htmlSupport;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StyleUtils';
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
        this.decorate('isStyleEnabledForBlock');
        this.decorate('isStyleActiveForBlock');
        this.decorate('getAffectedBlocks');
        this.decorate('isStyleEnabledForInlineSelection');
        this.decorate('isStyleActiveForInlineSelection');
        this.decorate('getAffectedInlineSelectable');
        this.decorate('getStylePreview');
        this.decorate('configureGHSDataFilter');
    }
    /**
	 * @inheritDoc
	 */ init() {
        this._htmlSupport = this.editor.plugins.get('GeneralHtmlSupport');
    }
    /**
	 * Normalizes {@link module:style/styleconfig~StyleConfig#definitions} in the configuration of the styles feature.
	 * The structure of normalized styles looks as follows:
	 *
	 * ```ts
	 * {
	 * 	block: [
	 * 		<module:style/style~StyleDefinition>,
	 * 		<module:style/style~StyleDefinition>,
	 * 		...
	 * 	],
	 * 	inline: [
	 * 		<module:style/style~StyleDefinition>,
	 * 		<module:style/style~StyleDefinition>,
	 * 		...
	 * 	]
	 * }
	 * ```
	 *
	 * @returns An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
	 */ normalizeConfig(dataSchema, styleDefinitions = []) {
        const normalizedDefinitions = {
            block: [],
            inline: []
        };
        for (const definition of styleDefinitions){
            const modelElements = [];
            const ghsAttributes = [];
            for (const ghsDefinition of dataSchema.getDefinitionsForView(definition.element)){
                const appliesToBlock = 'appliesToBlock' in ghsDefinition ? ghsDefinition.appliesToBlock : false;
                if (ghsDefinition.isBlock || appliesToBlock) {
                    if (typeof appliesToBlock == 'string') {
                        modelElements.push(appliesToBlock);
                    } else if (ghsDefinition.isBlock) {
                        const ghsBlockDefinition = ghsDefinition;
                        modelElements.push(ghsDefinition.model);
                        if (ghsBlockDefinition.paragraphLikeModel) {
                            modelElements.push(ghsBlockDefinition.paragraphLikeModel);
                        }
                    }
                } else {
                    ghsAttributes.push(ghsDefinition.model);
                }
            }
            const previewTemplate = this.getStylePreview(definition, [
                {
                    text: 'AaBbCcDdEeFfGgHhIiJj'
                }
            ]);
            if (modelElements.length) {
                normalizedDefinitions.block.push({
                    ...definition,
                    previewTemplate,
                    modelElements,
                    isBlock: true
                });
            } else {
                normalizedDefinitions.inline.push({
                    ...definition,
                    previewTemplate,
                    ghsAttributes
                });
            }
        }
        return normalizedDefinitions;
    }
    /**
	 * Verifies if the given style is applicable to the provided block element.
	 *
	 * @internal
	 */ isStyleEnabledForBlock(definition, block) {
        const model = this.editor.model;
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        if (!model.schema.checkAttribute(block, attributeName)) {
            return false;
        }
        return definition.modelElements.includes(block.name);
    }
    /**
	 * Returns true if the given style is applied to the specified block element.
	 *
	 * @internal
	 */ isStyleActiveForBlock(definition, block) {
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        const ghsAttributeValue = block.getAttribute(attributeName);
        return this.hasAllClasses(ghsAttributeValue, definition.classes);
    }
    /**
	 * Returns an array of block elements that style should be applied to.
	 *
	 * @internal
	 */ getAffectedBlocks(definition, block) {
        if (definition.modelElements.includes(block.name)) {
            return [
                block
            ];
        }
        return null;
    }
    /**
	 * Verifies if the given style is applicable to the provided document selection.
	 *
	 * @internal
	 */ isStyleEnabledForInlineSelection(definition, selection) {
        const model = this.editor.model;
        for (const ghsAttributeName of definition.ghsAttributes){
            if (model.schema.checkAttributeInSelection(selection, ghsAttributeName)) {
                return true;
            }
        }
        return false;
    }
    /**
	 * Returns true if the given style is applied to the specified document selection.
	 *
	 * @internal
	 */ isStyleActiveForInlineSelection(definition, selection) {
        for (const ghsAttributeName of definition.ghsAttributes){
            const ghsAttributeValue = this._getValueFromFirstAllowedNode(selection, ghsAttributeName);
            if (this.hasAllClasses(ghsAttributeValue, definition.classes)) {
                return true;
            }
        }
        return false;
    }
    /**
	 * Returns a selectable that given style should be applied to.
	 *
	 * @internal
	 */ getAffectedInlineSelectable(definition, selection) {
        return selection;
    }
    /**
	 * Returns the `TemplateDefinition` used by styles dropdown to render style preview.
	 *
	 * @internal
	 */ getStylePreview(definition, children) {
        const { element, classes } = definition;
        return {
            tag: isPreviewable(element) ? element : 'div',
            attributes: {
                class: classes
            },
            children
        };
    }
    /**
	 * Verifies if all classes are present in the given GHS attribute.
	 *
	 * @internal
	 */ hasAllClasses(ghsAttributeValue, classes) {
        return isObject(ghsAttributeValue) && hasClassesProperty(ghsAttributeValue) && classes.every((className)=>ghsAttributeValue.classes.includes(className));
    }
    /**
	 * This is where the styles feature configures the GHS feature. This method translates normalized
	 * {@link module:style/styleconfig~StyleDefinition style definitions} to
	 * {@link module:engine/view/matcher~MatcherObjectPattern matcher patterns} and feeds them to the GHS
	 * {@link module:html-support/datafilter~DataFilter} plugin.
	 *
	 * @internal
	 */ configureGHSDataFilter({ block, inline }) {
        const ghsDataFilter = this.editor.plugins.get('DataFilter');
        ghsDataFilter.loadAllowedConfig(block.map(normalizedStyleDefinitionToMatcherPattern));
        ghsDataFilter.loadAllowedConfig(inline.map(normalizedStyleDefinitionToMatcherPattern));
    }
    /**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection, returns the selection attribute.
	 *
	 * @param selection The document selection.
	 * @param attributeName Name of the GHS attribute.
	 * @returns The attribute value.
	 */ _getValueFromFirstAllowedNode(selection, attributeName) {
        const model = this.editor.model;
        const schema = model.schema;
        if (selection.isCollapsed) {
            return selection.getAttribute(attributeName);
        }
        for (const range of selection.getRanges()){
            for (const item of range.getItems()){
                if (schema.checkAttribute(item, attributeName)) {
                    return item.getAttribute(attributeName);
                }
            }
        }
        return null;
    }
}
/**
 * Checks if given object has `classes` property which is an array.
 *
 * @param obj Object to check.
 */ function hasClassesProperty(obj) {
    return Boolean(obj.classes) && Array.isArray(obj.classes);
}
/**
 * Decides whether an element should be created in the preview or a substitute `<div>` should
 * be used instead. This avoids previewing a standalone `<td>`, `<li>`, etc. without a parent.
 *
 * @param elementName Name of the element
 * @returns Boolean indicating whether the element can be rendered.
 */ function isPreviewable(elementName) {
    return !NON_PREVIEWABLE_ELEMENT_NAMES.includes(elementName);
}
/**
 * Translates a normalized style definition to a view matcher pattern.
 */ function normalizedStyleDefinitionToMatcherPattern({ element, classes }) {
    return {
        name: element,
        classes
    };
}

/**
 * The UI plugin of the style feature .
 *
 * It registers the `'style'` UI dropdown in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that displays a grid of styles and allows changing styles of the content.
 */ class StyleUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StyleUI';
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
            StyleUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const dataSchema = editor.plugins.get('DataSchema');
        const styleUtils = editor.plugins.get('StyleUtils');
        const styleDefinitions = editor.config.get('style.definitions');
        const normalizedStyleDefinitions = styleUtils.normalizeConfig(dataSchema, styleDefinitions);
        // Add the dropdown to the component factory.
        editor.ui.componentFactory.add('style', (locale)=>{
            const t = locale.t;
            const dropdown = createDropdown(locale);
            const styleCommand = editor.commands.get('style');
            dropdown.once('change:isOpen', ()=>{
                const panelView = new StylePanelView(locale, normalizedStyleDefinitions);
                // Put the styles panel is the dropdown.
                dropdown.panelView.children.add(panelView);
                // Close the dropdown when a style is selected in the styles panel.
                panelView.delegate('execute').to(dropdown);
                // Bind the state of the styles panel to the command.
                panelView.bind('activeStyles').to(styleCommand, 'value');
                panelView.bind('enabledStyles').to(styleCommand, 'enabledStyles');
            });
            // The entire dropdown will be disabled together with the command (e.g. when the editor goes read-only).
            dropdown.bind('isEnabled').to(styleCommand);
            // This dropdown has no icon. It displays text label depending on the selection.
            dropdown.buttonView.withText = true;
            // The label of the dropdown is dynamic and depends on how many styles are active at a time.
            dropdown.buttonView.bind('label').to(styleCommand, 'value', (value)=>{
                if (value.length > 1) {
                    return t('Multiple styles');
                } else if (value.length === 1) {
                    return value[0];
                } else {
                    return t('Styles');
                }
            });
            // The dropdown has a static CSS class for easy customization. There's another CSS class
            // that gets displayed when multiple styles are active at a time allowing visual customization of
            // the label.
            dropdown.bind('class').to(styleCommand, 'value', (value)=>{
                const classes = [
                    'ck-style-dropdown'
                ];
                if (value.length > 1) {
                    classes.push('ck-style-dropdown_multiple-active');
                }
                return classes.join(' ');
            });
            // Execute the command when a style is selected in the styles panel.
            // Also focus the editable after executing the command.
            // It overrides a default behaviour where the focus is moved to the dropdown button (#12125).
            dropdown.on('execute', (evt)=>{
                editor.execute('style', {
                    styleName: evt.source.styleDefinition.name
                });
                editor.editing.view.focus();
            });
            return dropdown;
        });
    }
}

/**
 * Style command.
 *
 * Applies and removes styles from selection and elements.
 */ class StyleCommand extends Command {
    /**
	 * Normalized definitions of the styles.
	 */ _styleDefinitions;
    /**
	 * The StyleUtils plugin.
	 */ _styleUtils;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor on which this command will be used.
	 * @param styleDefinitions Normalized definitions of the styles.
	 */ constructor(editor, styleDefinitions){
        super(editor);
        this.set('value', []);
        this.set('enabledStyles', []);
        this._styleDefinitions = styleDefinitions;
        this._styleUtils = this.editor.plugins.get(StyleUtils);
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const value = new Set();
        const enabledStyles = new Set();
        // Inline styles.
        for (const definition of this._styleDefinitions.inline){
            // Check if this inline style is enabled.
            if (this._styleUtils.isStyleEnabledForInlineSelection(definition, selection)) {
                enabledStyles.add(definition.name);
            }
            // Check if this inline style is active.
            if (this._styleUtils.isStyleActiveForInlineSelection(definition, selection)) {
                value.add(definition.name);
            }
        }
        // Block styles.
        const firstBlock = first(selection.getSelectedBlocks()) || selection.getFirstPosition().parent;
        if (firstBlock) {
            const ancestorBlocks = firstBlock.getAncestors({
                includeSelf: true,
                parentFirst: true
            });
            for (const block of ancestorBlocks){
                if (block.is('rootElement')) {
                    break;
                }
                for (const definition of this._styleDefinitions.block){
                    // Check if this block style is enabled.
                    if (!this._styleUtils.isStyleEnabledForBlock(definition, block)) {
                        continue;
                    }
                    enabledStyles.add(definition.name);
                    // Check if this block style is active.
                    if (this._styleUtils.isStyleActiveForBlock(definition, block)) {
                        value.add(definition.name);
                    }
                }
                // E.g. reached a model table when the selection is in a cell. The command should not modify
                // ancestors of a table.
                if (model.schema.isObject(block)) {
                    break;
                }
            }
        }
        this.enabledStyles = Array.from(enabledStyles).sort();
        this.isEnabled = this.enabledStyles.length > 0;
        this.value = this.isEnabled ? Array.from(value).sort() : [];
    }
    /**
	 * Executes the command &ndash; applies the style classes to the selection or removes it from the selection.
	 *
	 * If the command value already contains the requested style, it will remove the style classes. Otherwise, it will set it.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~ModelDocument#selection} and the
	 * style type (inline or block):
	 *
	 * * When applying inline styles:
	 *   * If the selection is on a range, the command applies the style classes to all nodes in that range.
	 *   * If the selection is collapsed in a non-empty node, the command applies the style classes to the
	 * {@link module:engine/model/document~ModelDocument#selection}.
	 *
	 * * When applying block styles:
	 *   * If the selection is on a range, the command applies the style classes to the nearest block parent element.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.styleName Style name matching the one defined in the
	 * {@link module:style/styleconfig~StyleConfig#definitions configuration}.
	 * @param options.forceValue Whether the command should add given style (`true`) or remove it (`false`) from the selection.
	 * If not set (default), the command will toggle the style basing on the first selected node. Note, that this will not force
	 * setting a style on an element that cannot receive given style.
	 */ execute({ styleName, forceValue }) {
        if (!this.enabledStyles.includes(styleName)) {
            /**
			 * Style command can be executed only with a correct style name.
			 *
			 * This warning may be caused by:
			 *
			 * * passing a name that is not specified in the {@link module:style/styleconfig~StyleConfig#definitions configuration}
			 * (e.g. a CSS class name),
			 * * when trying to apply a style that is not allowed on a given element.
			 *
			 * @error style-command-executed-with-incorrect-style-name
			 */ logWarning('style-command-executed-with-incorrect-style-name');
            return;
        }
        const model = this.editor.model;
        const selection = model.document.selection;
        const htmlSupport = this.editor.plugins.get('GeneralHtmlSupport');
        const allDefinitions = [
            ...this._styleDefinitions.inline,
            ...this._styleDefinitions.block
        ];
        const activeDefinitions = allDefinitions.filter(({ name })=>this.value.includes(name));
        const definition = allDefinitions.find(({ name })=>name == styleName);
        const shouldAddStyle = forceValue === undefined ? !this.value.includes(definition.name) : forceValue;
        model.change(()=>{
            let selectables;
            if (isBlockStyleDefinition(definition)) {
                selectables = this._findAffectedBlocks(getBlocksFromSelection(selection), definition);
            } else {
                selectables = [
                    this._styleUtils.getAffectedInlineSelectable(definition, selection)
                ];
            }
            for (const selectable of selectables){
                if (shouldAddStyle) {
                    htmlSupport.addModelHtmlClass(definition.element, definition.classes, selectable);
                } else {
                    htmlSupport.removeModelHtmlClass(definition.element, getDefinitionExclusiveClasses(activeDefinitions, definition), selectable);
                }
            }
        });
    }
    /**
	 * Returns a set of elements that should be affected by the block-style change.
	 */ _findAffectedBlocks(selectedBlocks, definition) {
        const blocks = new Set();
        for (const selectedBlock of selectedBlocks){
            const ancestorBlocks = selectedBlock.getAncestors({
                includeSelf: true,
                parentFirst: true
            });
            for (const block of ancestorBlocks){
                if (block.is('rootElement')) {
                    break;
                }
                const affectedBlocks = this._styleUtils.getAffectedBlocks(definition, block);
                if (affectedBlocks) {
                    for (const affectedBlock of affectedBlocks){
                        blocks.add(affectedBlock);
                    }
                    break;
                }
            }
        }
        return blocks;
    }
}
/**
 * Returns classes that are defined only in the supplied definition and not in any other active definition. It's used
 * to ensure that classes used by other definitions are preserved when a style is removed. See #11748.
 *
 * @param activeDefinitions All currently active definitions affecting selected element(s).
 * @param definition Definition whose classes will be compared with all other active definition classes.
 * @returns Array of classes exclusive to the supplied definition.
 */ function getDefinitionExclusiveClasses(activeDefinitions, definition) {
    return activeDefinitions.reduce((classes, currentDefinition)=>{
        if (currentDefinition.name === definition.name) {
            return classes;
        }
        return classes.filter((className)=>!currentDefinition.classes.includes(className));
    }, definition.classes);
}
/**
 * Checks if provided style definition is of type block.
 */ function isBlockStyleDefinition(definition) {
    return 'isBlock' in definition;
}
/**
 * Gets block elements from selection. If there are none, returns first selected element.
 * @param selection Current document's selection.
 * @returns Selected blocks if there are any, first selected element otherwise.
 */ function getBlocksFromSelection(selection) {
    const blocks = Array.from(selection.getSelectedBlocks());
    if (blocks.length) {
        return blocks;
    }
    return [
        selection.getFirstPosition().parent
    ];
}

class ListStyleSupport extends Plugin {
    _listUtils;
    _styleUtils;
    _htmlSupport;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListStyleSupport';
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
            StyleUtils,
            'GeneralHtmlSupport'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('ListEditing')) {
            return;
        }
        this._styleUtils = editor.plugins.get(StyleUtils);
        this._listUtils = this.editor.plugins.get('ListUtils');
        this._htmlSupport = this.editor.plugins.get('GeneralHtmlSupport');
        this.listenTo(this._styleUtils, 'isStyleEnabledForBlock', (evt, [definition, block])=>{
            if (this._isStyleEnabledForBlock(definition, block)) {
                evt.return = true;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'isStyleActiveForBlock', (evt, [definition, block])=>{
            if (this._isStyleActiveForBlock(definition, block)) {
                evt.return = true;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'getAffectedBlocks', (evt, [definition, block])=>{
            const blocks = this._getAffectedBlocks(definition, block);
            if (blocks) {
                evt.return = blocks;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'getStylePreview', (evt, [definition, children])=>{
            const templateDefinition = this._getStylePreview(definition, children);
            if (templateDefinition) {
                evt.return = templateDefinition;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Verifies if the given style is applicable to the provided block element.
	 */ _isStyleEnabledForBlock(definition, block) {
        const model = this.editor.model;
        if (![
            'ol',
            'ul',
            'li'
        ].includes(definition.element)) {
            return false;
        }
        if (!this._listUtils.isListItemBlock(block)) {
            return false;
        }
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        if (definition.element == 'ol' || definition.element == 'ul') {
            if (!model.schema.checkAttribute(block, attributeName)) {
                return false;
            }
            const isNumbered = this._listUtils.isNumberedListType(block.getAttribute('listType'));
            const viewElementName = isNumbered ? 'ol' : 'ul';
            return definition.element == viewElementName;
        } else {
            return model.schema.checkAttribute(block, attributeName);
        }
    }
    /**
	 * Returns true if the given style is applied to the specified block element.
	 */ _isStyleActiveForBlock(definition, block) {
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        const ghsAttributeValue = block.getAttribute(attributeName);
        return this._styleUtils.hasAllClasses(ghsAttributeValue, definition.classes);
    }
    /**
	 * Returns an array of block elements that style should be applied to.
	 */ _getAffectedBlocks(definition, block) {
        if (!this._isStyleEnabledForBlock(definition, block)) {
            return null;
        }
        if (definition.element == 'li') {
            return this._listUtils.expandListBlocksToCompleteItems(block, {
                withNested: false
            });
        } else {
            return this._listUtils.expandListBlocksToCompleteList(block);
        }
    }
    /**
	 * Returns a view template definition for the style preview.
	 */ _getStylePreview(definition, children) {
        const { element, classes } = definition;
        if (element == 'ol' || element == 'ul') {
            return {
                tag: element,
                attributes: {
                    class: classes
                },
                children: [
                    {
                        tag: 'li',
                        children
                    }
                ]
            };
        } else if (element == 'li') {
            return {
                tag: 'ol',
                children: [
                    {
                        tag: element,
                        attributes: {
                            class: classes
                        },
                        children
                    }
                ]
            };
        }
        return null;
    }
}

class TableStyleSupport extends Plugin {
    _tableUtils;
    _styleUtils;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableStyleSupport';
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
            StyleUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('TableEditing')) {
            return;
        }
        this._styleUtils = editor.plugins.get(StyleUtils);
        this._tableUtils = this.editor.plugins.get('TableUtils');
        this.listenTo(this._styleUtils, 'isStyleEnabledForBlock', (evt, [definition, block])=>{
            if (this._isApplicable(definition, block)) {
                evt.return = this._isStyleEnabledForBlock(definition, block);
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'getAffectedBlocks', (evt, [definition, block])=>{
            if (this._isApplicable(definition, block)) {
                evt.return = this._getAffectedBlocks(definition, block);
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'configureGHSDataFilter', (evt, [{ block }])=>{
            const ghsDataFilter = this.editor.plugins.get('DataFilter');
            ghsDataFilter.loadAllowedConfig(block.filter((definition)=>definition.element == 'figcaption').map((definition)=>({
                    name: 'caption',
                    classes: definition.classes
                })));
        });
    }
    /**
	 * Checks if this plugin's custom logic should be applied for defintion-block pair.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block Block element to check if should be styled.
	 * @returns True if the defintion-block pair meet the plugin criteria, false otherwise.
	 */ _isApplicable(definition, block) {
        if ([
            'td',
            'th'
        ].includes(definition.element)) {
            return block.name == 'tableCell';
        }
        if ([
            'thead',
            'tbody'
        ].includes(definition.element)) {
            return block.name == 'table';
        }
        return false;
    }
    /**
	 * Checks if the style definition should be applied to selected block.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block Block element to check if should be styled.
	 * @returns True if the block should be style with the style description, false otherwise.
	 */ _isStyleEnabledForBlock(definition, block) {
        if ([
            'td',
            'th'
        ].includes(definition.element)) {
            const location = this._tableUtils.getCellLocation(block);
            const tableRow = block.parent;
            const table = tableRow.parent;
            const headingRows = table.getAttribute('headingRows') || 0;
            const headingColumns = table.getAttribute('headingColumns') || 0;
            const isHeadingCell = location.row < headingRows || location.column < headingColumns;
            if (definition.element == 'th') {
                return isHeadingCell;
            } else {
                return !isHeadingCell;
            }
        }
        if ([
            'thead',
            'tbody'
        ].includes(definition.element)) {
            const headingRows = block.getAttribute('headingRows') || 0;
            if (definition.element == 'thead') {
                return headingRows > 0;
            } else {
                return headingRows < this._tableUtils.getRows(block);
            }
        }
        /* istanbul ignore next -- @preserve */ return false;
    }
    /**
	 * Gets all blocks that the style should be applied to.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block A block element from selection.
	 * @returns An array with the block that was passed as an argument if meets the criteria, null otherwise.
	 */ _getAffectedBlocks(definition, block) {
        if (!this._isStyleEnabledForBlock(definition, block)) {
            return null;
        }
        return [
            block
        ];
    }
}

class LinkStyleSupport extends Plugin {
    _styleUtils;
    _htmlSupport;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LinkStyleSupport';
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
            StyleUtils,
            'GeneralHtmlSupport'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('LinkEditing')) {
            return;
        }
        this._styleUtils = editor.plugins.get(StyleUtils);
        this._htmlSupport = this.editor.plugins.get('GeneralHtmlSupport');
        this.listenTo(this._styleUtils, 'isStyleEnabledForInlineSelection', (evt, [definition, selection])=>{
            if (definition.element == 'a') {
                evt.return = this._isStyleEnabled(definition, selection);
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'isStyleActiveForInlineSelection', (evt, [definition, selection])=>{
            if (definition.element == 'a') {
                evt.return = this._isStyleActive(definition, selection);
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.listenTo(this._styleUtils, 'getAffectedInlineSelectable', (evt, [definition, selection])=>{
            if (definition.element != 'a') {
                return;
            }
            const selectable = this._getAffectedSelectable(definition, selection);
            if (selectable) {
                evt.return = selectable;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Verifies if the given style is applicable to the provided document selection.
	 */ _isStyleEnabled(definition, selection) {
        const model = this.editor.model;
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            return selection.hasAttribute('linkHref');
        }
        // Non-collapsed selection.
        for (const range of selection.getRanges()){
            for (const item of range.getItems()){
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
	 * Returns true if the given style is applied to the specified document selection.
	 */ _isStyleActive(definition, selection) {
        const model = this.editor.model;
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            if (selection.hasAttribute('linkHref')) {
                const ghsAttributeValue = selection.getAttribute(attributeName);
                if (this._styleUtils.hasAllClasses(ghsAttributeValue, definition.classes)) {
                    return true;
                }
            }
            return false;
        }
        // Non-collapsed selection.
        for (const range of selection.getRanges()){
            for (const item of range.getItems()){
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    const ghsAttributeValue = item.getAttribute(attributeName);
                    return this._styleUtils.hasAllClasses(ghsAttributeValue, definition.classes);
                }
            }
        }
        return false;
    }
    /**
	 * Returns a selectable that given style should be applied to.
	 */ _getAffectedSelectable(definition, selection) {
        const model = this.editor.model;
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            const linkHref = selection.getAttribute('linkHref');
            return findAttributeRange(selection.getFirstPosition(), 'linkHref', linkHref, model);
        }
        // Non-collapsed selection.
        const ranges = [];
        for (const range of selection.getRanges()){
            // First expand range to include the whole link.
            const expandedRange = model.createRange(expandAttributePosition(range.start, 'linkHref', true, model), expandAttributePosition(range.end, 'linkHref', false, model));
            // Pick only ranges on links.
            for (const item of expandedRange.getItems()){
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    ranges.push(this.editor.model.createRangeOn(item));
                }
            }
        }
        // Make sure that we have a continuous range on a link
        // (not split between text nodes with mixed attributes like bold etc.)
        return normalizeRanges(ranges);
    }
}
/**
 * Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
 * and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
 */ function expandAttributePosition(position, attributeName, lookBack, model) {
    const referenceNode = position.textNode || (lookBack ? position.nodeAfter : position.nodeBefore);
    if (!referenceNode || !referenceNode.hasAttribute(attributeName)) {
        return position;
    }
    const attributeValue = referenceNode.getAttribute(attributeName);
    return findAttributeRangeBound(position, attributeName, attributeValue, lookBack, model);
}
/**
 * Normalizes list of ranges by joining intersecting or "touching" ranges.
 *
 * Note: It assumes that ranges are sorted.
 */ function normalizeRanges(ranges) {
    for(let i = 1; i < ranges.length; i++){
        const joinedRange = ranges[i - 1].getJoined(ranges[i]);
        if (joinedRange) {
            // Replace the ranges on the list with the new joined range.
            ranges.splice(--i, 2, joinedRange);
        }
    }
    return ranges;
}

/**
 * The style engine feature.
 *
 * It configures the {@glink features/html/general-html-support General HTML Support feature} based on
 * {@link module:style/styleconfig~StyleConfig#definitions configured style definitions} and introduces the
 * {@link module:style/stylecommand~StyleCommand style command} that applies styles to the content of the document.
 */ class StyleEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StyleEditing';
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
            'GeneralHtmlSupport',
            StyleUtils,
            ListStyleSupport,
            TableStyleSupport,
            LinkStyleSupport
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const dataSchema = editor.plugins.get('DataSchema');
        const styleUtils = editor.plugins.get('StyleUtils');
        const styleDefinitions = editor.config.get('style.definitions');
        const normalizedStyleDefinitions = styleUtils.normalizeConfig(dataSchema, styleDefinitions);
        editor.commands.add('style', new StyleCommand(editor, normalizedStyleDefinitions));
        styleUtils.configureGHSDataFilter(normalizedStyleDefinitions);
    }
}

/**
 * The style plugin.
 *
 * This is a "glue" plugin that loads the {@link module:style/styleediting~StyleEditing style editing feature}
 * and {@link module:style/styleui~StyleUI style UI feature}.
 */ class Style extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Style';
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
            StyleEditing,
            StyleUI
        ];
    }
}

export { LinkStyleSupport, ListStyleSupport, Style, StyleCommand, StyleEditing, StyleUI, StyleUtils, TableStyleSupport, StyleGridButtonView as _StyleGridButtonView, StyleGridView as _StyleGridView, StyleGroupView as _StyleGroupView, StylePanelView as _StylePanelView };
//# sourceMappingURL=index.js.map

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/dist/index.js';
import { first, priorities, Collection } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { UIModel, createDropdown, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView, ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconHeading6, IconHeading5, IconHeading4, IconHeading3, IconHeading2, IconHeading1 } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ViewDowncastWriter, enableViewPlaceholder, hideViewPlaceholder, needsViewPlaceholder, showViewPlaceholder } from '@ckeditor/ckeditor5-engine/dist/index.js';

/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 */ class HeadingCommand extends Command {
    /**
	 * Set of defined model's elements names that this command support.
	 * See {@link module:heading/headingconfig~HeadingOption}.
	 */ modelElements;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor instance.
	 * @param modelElements Names of the element which this command can apply in the model.
	 */ constructor(editor, modelElements){
        super(editor);
        this.modelElements = modelElements;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const block = first(this.editor.model.document.selection.getSelectedBlocks());
        this.value = !!block && this.modelElements.includes(block.name) && block.name;
        this.isEnabled = !!block && this.modelElements.some((heading)=>checkCanBecomeHeading(block, heading, this.editor.model.schema));
    }
    /**
	 * Executes the command. Applies the heading to the selected blocks or, if the first selected
	 * block is a heading already, turns selected headings (of this level only) to paragraphs.
	 *
	 * @param options.value Name of the element which this command will apply in the model.
	 * @fires execute
	 */ execute(options) {
        const model = this.editor.model;
        const document = model.document;
        const modelElement = options.value;
        model.change((writer)=>{
            const blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>{
                return checkCanBecomeHeading(block, modelElement, model.schema);
            });
            for (const block of blocks){
                if (!block.is('element', modelElement)) {
                    writer.rename(block, modelElement);
                }
            }
        });
    }
}
/**
 * Checks whether the given block can be replaced by a specific heading.
 *
 * @param block A block to be tested.
 * @param heading Command element name in the model.
 * @param schema The schema of the document.
 */ function checkCanBecomeHeading(block, heading, schema) {
    return schema.checkChild(block.parent, heading) && !schema.isObject(block);
}

const defaultModelElement = 'paragraph';
/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 * It introduces `heading1`-`headingN` commands which allow to convert paragraphs into headings.
 */ class HeadingEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HeadingEditing';
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
        editor.config.define('heading', {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph'
                },
                {
                    model: 'heading1',
                    view: 'h2',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1'
                },
                {
                    model: 'heading2',
                    view: 'h3',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2'
                },
                {
                    model: 'heading3',
                    view: 'h4',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3'
                }
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Paragraph
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const options = editor.config.get('heading.options');
        const modelElements = [];
        for (const option of options){
            // Skip paragraph - it is defined in required Paragraph feature.
            if (option.model === 'paragraph') {
                continue;
            }
            // Schema.
            editor.model.schema.register(option.model, {
                inheritAllFrom: '$block'
            });
            editor.conversion.elementToElement(option);
            modelElements.push(option.model);
        }
        this._addDefaultH1Conversion(editor);
        // Register the heading command for this option.
        editor.commands.add('heading', new HeadingCommand(editor, modelElements));
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        // If the enter command is added to the editor, alter its behavior.
        // Enter at the end of a heading element should create a paragraph.
        const editor = this.editor;
        const enterCommand = editor.commands.get('enter');
        const options = editor.config.get('heading.options');
        if (enterCommand) {
            this.listenTo(enterCommand, 'afterExecute', (evt, data)=>{
                const positionParent = editor.model.document.selection.getFirstPosition().parent;
                const isHeading = options.some((option)=>positionParent.is('element', option.model));
                if (isHeading && !positionParent.is('element', defaultModelElement) && positionParent.childCount === 0) {
                    data.writer.rename(positionParent, defaultModelElement);
                }
            });
        }
    }
    /**
	 * Adds default conversion for `h1` -> `heading1` with a low priority.
	 *
	 * @param editor Editor instance on which to add the `h1` conversion.
	 */ _addDefaultH1Conversion(editor) {
        editor.conversion.for('upcast').elementToElement({
            model: 'heading1',
            view: 'h1',
            // With a `low` priority, `paragraph` plugin autoparagraphing mechanism is executed. Make sure
            // this listener is called before it. If not, `h1` will be transformed into a paragraph.
            converterPriority: priorities.low + 1
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module heading/utils
 */ /**
 * Returns heading options as defined in `config.heading.options` but processed to consider
 * the editor localization, i.e. to display {@link module:heading/headingconfig~HeadingOption}
 * in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 *
 * @internal
 */ function getLocalizedOptions(editor) {
    const t = editor.t;
    const localizedTitles = {
        'Paragraph': t('Paragraph'),
        'Heading 1': t('Heading 1'),
        'Heading 2': t('Heading 2'),
        'Heading 3': t('Heading 3'),
        'Heading 4': t('Heading 4'),
        'Heading 5': t('Heading 5'),
        'Heading 6': t('Heading 6')
    };
    return editor.config.get('heading.options').map((option)=>{
        const title = localizedTitles[option.title];
        if (title && title != option.title) {
            option.title = title;
        }
        return option;
    });
}

/**
 * The headings UI feature. It introduces the `headings` dropdown.
 */ class HeadingUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HeadingUI';
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
        const t = editor.t;
        const options = getLocalizedOptions(editor);
        const defaultTitle = t('Choose heading');
        const accessibleLabel = t('Heading');
        // Register UI component.
        editor.ui.componentFactory.add('heading', (locale)=>{
            const titles = {};
            const itemDefinitions = new Collection();
            const headingCommand = editor.commands.get('heading');
            const paragraphCommand = editor.commands.get('paragraph');
            const commands = [
                headingCommand
            ];
            for (const option of options){
                const def = {
                    type: 'button',
                    model: new UIModel({
                        label: option.title,
                        class: option.class,
                        role: 'menuitemradio',
                        withText: true
                    })
                };
                if (option.model === 'paragraph') {
                    def.model.bind('isOn').to(paragraphCommand, 'value');
                    def.model.set('commandName', 'paragraph');
                    commands.push(paragraphCommand);
                } else {
                    def.model.bind('isOn').to(headingCommand, 'value', (value)=>value === option.model);
                    def.model.set({
                        commandName: 'heading',
                        commandValue: option.model
                    });
                }
                // Add the option to the collection.
                itemDefinitions.add(def);
                titles[option.model] = option.title;
            }
            const dropdownView = createDropdown(locale);
            addListToDropdown(dropdownView, itemDefinitions, {
                ariaLabel: accessibleLabel,
                role: 'menu'
            });
            dropdownView.buttonView.set({
                ariaLabel: accessibleLabel,
                ariaLabelledBy: undefined,
                isOn: false,
                withText: true,
                tooltip: accessibleLabel
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: [
                        'ck-heading-dropdown'
                    ]
                }
            });
            dropdownView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>{
                return areEnabled.some((isEnabled)=>isEnabled);
            });
            dropdownView.buttonView.bind('label').to(headingCommand, 'value', paragraphCommand, 'value', (heading, paragraph)=>{
                const whichModel = paragraph ? 'paragraph' : heading;
                if (typeof whichModel === 'boolean') {
                    return defaultTitle;
                }
                // If none of the commands is active, display default title.
                if (!titles[whichModel]) {
                    return defaultTitle;
                }
                return titles[whichModel];
            });
            dropdownView.buttonView.bind('ariaLabel').to(headingCommand, 'value', paragraphCommand, 'value', (heading, paragraph)=>{
                const whichModel = paragraph ? 'paragraph' : heading;
                if (typeof whichModel === 'boolean') {
                    return accessibleLabel;
                }
                // If none of the commands is active, display default title.
                if (!titles[whichModel]) {
                    return accessibleLabel;
                }
                return `${titles[whichModel]}, ${accessibleLabel}`;
            });
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', (evt)=>{
                const { commandName, commandValue } = evt.source;
                editor.execute(commandName, commandValue ? {
                    value: commandValue
                } : undefined);
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add('menuBar:heading', (locale)=>{
            const menuView = new MenuBarMenuView(locale);
            const headingCommand = editor.commands.get('heading');
            const paragraphCommand = editor.commands.get('paragraph');
            const commands = [
                headingCommand
            ];
            const listView = new MenuBarMenuListView(locale);
            menuView.set({
                class: 'ck-heading-dropdown'
            });
            listView.set({
                ariaLabel: t('Heading'),
                role: 'menu'
            });
            menuView.buttonView.set({
                label: t('Heading')
            });
            menuView.panelView.children.add(listView);
            for (const option of options){
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
                buttonView.set({
                    isToggleable: true,
                    label: option.title,
                    role: 'menuitemradio',
                    class: option.class
                });
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', ()=>{
                    const commandName = option.model === 'paragraph' ? 'paragraph' : 'heading';
                    editor.execute(commandName, {
                        value: option.model
                    });
                    editor.editing.view.focus();
                });
                if (option.model === 'paragraph') {
                    buttonView.bind('isOn').to(paragraphCommand, 'value');
                    commands.push(paragraphCommand);
                } else {
                    buttonView.bind('isOn').to(headingCommand, 'value', (value)=>value === option.model);
                }
            }
            menuView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>{
                return areEnabled.some((isEnabled)=>isEnabled);
            });
            return menuView;
        });
    }
}

/**
 * The headings feature.
 *
 * For a detailed overview, check the {@glink features/headings Headings feature} guide
 * and the {@glink api/heading package page}.
 *
 * This is a "glue" plugin which loads the {@link module:heading/headingediting~HeadingEditing heading editing feature}
 * and {@link module:heading/headingui~HeadingUI heading UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */ class Heading extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            HeadingEditing,
            HeadingUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Heading';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const defaultIcons = /* #__PURE__ */ (()=>({
        heading1: IconHeading1,
        heading2: IconHeading2,
        heading3: IconHeading3,
        heading4: IconHeading4,
        heading5: IconHeading5,
        heading6: IconHeading6
    }))();
/**
 * The `HeadingButtonsUI` plugin defines a set of UI buttons that can be used instead of the
 * standard drop down component.
 *
 * This feature is not enabled by default by the {@link module:heading/heading~Heading} plugin and needs to be
 * installed manually to the editor configuration.
 *
 * Plugin introduces button UI elements, which names are same as `model` property from {@link module:heading/headingconfig~HeadingOption}.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 *     heading: {
 *       options: [
 *         { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *         { model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *         { model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *         { model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *       ]
 *      },
 *      toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * NOTE: The `'paragraph'` button is defined in by the {@link module:paragraph/paragraphbuttonui~ParagraphButtonUI} plugin
 * which needs to be loaded manually as well.
 *
 * It is possible to use custom icons by providing `icon` config option in {@link module:heading/headingconfig~HeadingOption}.
 * For the default configuration standard icons are used.
 */ class HeadingButtonsUI extends Plugin {
    /**
	 * @inheritDoc
	 */ init() {
        const options = getLocalizedOptions(this.editor);
        options.filter((item)=>item.model !== 'paragraph').map((item)=>this._createButton(item));
    }
    /**
	 * Creates single button view from provided configuration option.
	 */ _createButton(option) {
        const editor = this.editor;
        editor.ui.componentFactory.add(option.model, (locale)=>{
            const view = new ButtonView(locale);
            const command = editor.commands.get('heading');
            view.label = option.title;
            view.icon = option.icon || defaultIcons[option.model];
            view.tooltip = true;
            view.isToggleable = true;
            view.bind('isEnabled').to(command);
            view.bind('isOn').to(command, 'value', (value)=>value == option.model);
            view.on('execute', ()=>{
                editor.execute('heading', {
                    value: option.model
                });
                editor.editing.view.focus();
            });
            return view;
        });
    }
}

// A list of element names that should be treated by the Title plugin as title-like.
// This means that an element of a type from this list will be changed to a title element
// when it is the first element in the root.
const titleLikeElements = new Set([
    'paragraph',
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6'
]);
/**
 * The Title plugin.
 *
 * It splits the document into `Title` and `Body` sections.
 */ class Title extends Plugin {
    /**
	 * A reference to an empty paragraph in the body
	 * created when there is no element in the body for the placeholder purposes.
	 */ _bodyPlaceholder = new Map();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Title';
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
            'Paragraph'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        // To use the schema for disabling some features when the selection is inside the title element
        // it is needed to create the following structure:
        //
        // <title>
        //     <title-content>The title text</title-content>
        // </title>
        //
        // See: https://github.com/ckeditor/ckeditor5/issues/2005.
        model.schema.register('title', {
            isBlock: true,
            allowIn: '$root'
        });
        model.schema.register('title-content', {
            isBlock: true,
            allowIn: 'title',
            allowAttributes: [
                'alignment'
            ]
        });
        model.schema.extend('$text', {
            allowIn: 'title-content'
        });
        // Disallow all attributes in `title-content`.
        model.schema.addAttributeCheck((context)=>{
            if (context.endsWith('title-content $text')) {
                return false;
            }
        });
        // Because `title` is represented by two elements in the model
        // but only one in the view, it is needed to adjust Mapper.
        editor.editing.mapper.on('modelToViewPosition', mapModelPositionToView(editor.editing.view));
        editor.data.mapper.on('modelToViewPosition', mapModelPositionToView(editor.editing.view));
        // Conversion.
        editor.conversion.for('downcast').elementToElement({
            model: 'title-content',
            view: 'h1'
        });
        editor.conversion.for('downcast').add((dispatcher)=>dispatcher.on('insert:title', (evt, data, conversionApi)=>{
                conversionApi.consumable.consume(data.item, evt.name);
            }));
        // Custom converter is used for data v -> m conversion to avoid calling post-fixer when setting data.
        // See https://github.com/ckeditor/ckeditor5/issues/2036.
        editor.data.upcastDispatcher.on('element:h1', dataViewModelH1Insertion, {
            priority: 'high'
        });
        editor.data.upcastDispatcher.on('element:h2', dataViewModelH1Insertion, {
            priority: 'high'
        });
        editor.data.upcastDispatcher.on('element:h3', dataViewModelH1Insertion, {
            priority: 'high'
        });
        // Take care about correct `title` element structure.
        model.document.registerPostFixer((writer)=>this._fixTitleContent(writer));
        // Create and take care of correct position of a `title` element.
        model.document.registerPostFixer((writer)=>this._fixTitleElement(writer));
        // Create element for `Body` placeholder if it is missing.
        model.document.registerPostFixer((writer)=>this._fixBodyElement(writer));
        // Prevent from adding extra at the end of the document.
        model.document.registerPostFixer((writer)=>this._fixExtraParagraph(writer));
        // Attach `Title` and `Body` placeholders to the empty title and/or content.
        this._attachPlaceholders();
        // Attach Tab handling.
        this._attachTabPressHandling();
    }
    /**
	 * Returns the title of the document. Note that because this plugin does not allow any formatting inside
	 * the title element, the output of this method will be a plain text, with no HTML tags.
	 *
	 * It is not recommended to use this method together with features that insert markers to the
	 * data output, like comments or track changes features. If such markers start in the title and end in the
	 * body, the result of this method might be incorrect.
	 *
	 * @param options Additional configuration passed to the conversion process.
	 * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
	 * @returns The title of the document.
	 */ getTitle(options = {}) {
        const rootName = options.rootName ? options.rootName : undefined;
        const titleElement = this._getTitleElement(rootName);
        const titleContentElement = titleElement.getChild(0);
        return this.editor.data.stringify(titleContentElement, options);
    }
    /**
	 * Returns the body of the document.
	 *
	 * Note that it is not recommended to use this method together with features that insert markers to the
	 * data output, like comments or track changes features. If such markers start in the title and end in the
	 * body, the result of this method might be incorrect.
	 *
	 * @param options Additional configuration passed to the conversion process.
	 * See {@link module:engine/controller/datacontroller~DataController#get `DataController#get`}.
	 * @returns The body of the document.
	 */ getBody(options = {}) {
        const editor = this.editor;
        const data = editor.data;
        const model = editor.model;
        const rootName = options.rootName ? options.rootName : undefined;
        const root = editor.model.document.getRoot(rootName);
        const view = editor.editing.view;
        const viewWriter = new ViewDowncastWriter(view.document);
        const rootRange = model.createRangeIn(root);
        const viewDocumentFragment = viewWriter.createDocumentFragment();
        // Find all markers that intersects with body.
        const bodyStartPosition = model.createPositionAfter(root.getChild(0));
        const bodyRange = model.createRange(bodyStartPosition, model.createPositionAt(root, 'end'));
        const markers = new Map();
        for (const marker of model.markers){
            const intersection = bodyRange.getIntersection(marker.getRange());
            if (intersection) {
                markers.set(marker.name, intersection);
            }
        }
        // Convert the entire root to view.
        data.mapper.clearBindings();
        data.mapper.bindElements(root, viewDocumentFragment);
        data.downcastDispatcher.convert(rootRange, markers, viewWriter, options);
        // Remove title element from view.
        viewWriter.remove(viewWriter.createRangeOn(viewDocumentFragment.getChild(0)));
        // view -> data
        return editor.data.processor.toData(viewDocumentFragment);
    }
    /**
	 * Returns the `title` element when it is in the document. Returns `undefined` otherwise.
	 */ _getTitleElement(rootName) {
        const root = this.editor.model.document.getRoot(rootName);
        for (const child of root.getChildren()){
            if (isTitle(child)) {
                return child;
            }
        }
    }
    /**
	 * Model post-fixer callback that ensures that `title` has only one `title-content` child.
	 * All additional children should be moved after the `title` element and renamed to a paragraph.
	 */ _fixTitleContent(writer) {
        let changed = false;
        for (const rootName of this.editor.model.document.getRootNames()){
            const title = this._getTitleElement(rootName);
            // If there is no title in the content it will be created by `_fixTitleElement` post-fixer.
            // If the title has just one element, then it is correct. No fixing.
            if (!title || title.maxOffset === 1) {
                continue;
            }
            const titleChildren = Array.from(title.getChildren());
            // Skip first child because it is an allowed element.
            titleChildren.shift();
            for (const titleChild of titleChildren){
                writer.move(writer.createRangeOn(titleChild), title, 'after');
                writer.rename(titleChild, 'paragraph');
            }
            changed = true;
        }
        return changed;
    }
    /**
	 * Model post-fixer callback that creates a title element when it is missing,
	 * takes care of the correct position of it and removes additional title elements.
	 */ _fixTitleElement(writer) {
        let changed = false;
        const model = this.editor.model;
        for (const modelRoot of this.editor.model.document.getRoots()){
            const titleElements = Array.from(modelRoot.getChildren()).filter(isTitle);
            const firstTitleElement = titleElements[0];
            const firstRootChild = modelRoot.getChild(0);
            // When title element is at the beginning of the document then try to fix additional title elements (if there are any).
            if (firstRootChild.is('element', 'title')) {
                if (titleElements.length > 1) {
                    fixAdditionalTitleElements(titleElements, writer, model);
                    changed = true;
                }
                continue;
            }
            // When there is no title in the document and first element in the document cannot be changed
            // to the title then create an empty title element at the beginning of the document.
            if (!firstTitleElement && !titleLikeElements.has(firstRootChild.name)) {
                const title = writer.createElement('title');
                writer.insert(title, modelRoot);
                writer.insertElement('title-content', title);
                changed = true;
                continue;
            }
            if (titleLikeElements.has(firstRootChild.name)) {
                // Change the first element in the document to the title if it can be changed (is title-like).
                changeElementToTitle(firstRootChild, writer, model);
            } else {
                // Otherwise, move the first occurrence of the title element to the beginning of the document.
                writer.move(writer.createRangeOn(firstTitleElement), modelRoot, 0);
            }
            fixAdditionalTitleElements(titleElements, writer, model);
            changed = true;
        }
        return changed;
    }
    /**
	 * Model post-fixer callback that adds an empty paragraph at the end of the document
	 * when it is needed for the placeholder purposes.
	 */ _fixBodyElement(writer) {
        let changed = false;
        for (const rootName of this.editor.model.document.getRootNames()){
            const modelRoot = this.editor.model.document.getRoot(rootName);
            if (modelRoot.childCount < 2) {
                const placeholder = writer.createElement('paragraph');
                writer.insert(placeholder, modelRoot, 1);
                this._bodyPlaceholder.set(rootName, placeholder);
                changed = true;
            }
        }
        return changed;
    }
    /**
	 * Model post-fixer callback that removes a paragraph from the end of the document
	 * if it was created for the placeholder purposes and is not needed anymore.
	 */ _fixExtraParagraph(writer) {
        let changed = false;
        for (const rootName of this.editor.model.document.getRootNames()){
            const root = this.editor.model.document.getRoot(rootName);
            const placeholder = this._bodyPlaceholder.get(rootName);
            if (shouldRemoveLastParagraph(placeholder, root)) {
                this._bodyPlaceholder.delete(rootName);
                writer.remove(placeholder);
                changed = true;
            }
        }
        return changed;
    }
    /**
	 * Attaches the `Title` and `Body` placeholders to the title and/or content.
	 */ _attachPlaceholders() {
        const editor = this.editor;
        const t = editor.t;
        const view = editor.editing.view;
        const sourceElement = editor.sourceElement;
        const titlePlaceholder = editor.config.get('title.placeholder') || t('Type your title');
        const bodyPlaceholder = editor.config.get('placeholder') || sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute('placeholder') || t('Type or paste your content here.');
        // Attach placeholder to the view title element.
        editor.editing.downcastDispatcher.on('insert:title-content', (evt, data, conversionApi)=>{
            const element = conversionApi.mapper.toViewElement(data.item);
            element.placeholder = titlePlaceholder;
            enableViewPlaceholder({
                view,
                element,
                keepOnFocus: true
            });
        });
        // Attach placeholder to first element after a title element and remove it if it's not needed anymore.
        // First element after title can change, so we need to observe all changes keep placeholder in sync.
        const bodyViewElements = new Map();
        // This post-fixer runs after the model post-fixer, so we can assume that the second child in view root will always exist.
        view.document.registerPostFixer((writer)=>{
            let hasChanged = false;
            for (const viewRoot of view.document.roots){
                // `viewRoot` can be empty despite the model post-fixers if the model root was detached.
                if (viewRoot.isEmpty) {
                    continue;
                }
                // If `viewRoot` is not empty, then we can expect at least two elements in it.
                const body = viewRoot.getChild(1);
                const oldBody = bodyViewElements.get(viewRoot.rootName);
                // If body element has changed we need to disable placeholder on the previous element and enable on the new one.
                if (body !== oldBody) {
                    if (oldBody) {
                        hideViewPlaceholder(writer, oldBody);
                        writer.removeAttribute('data-placeholder', oldBody);
                    }
                    writer.setAttribute('data-placeholder', bodyPlaceholder, body);
                    bodyViewElements.set(viewRoot.rootName, body);
                    hasChanged = true;
                }
                // Then we need to display placeholder if it is needed.
                // See: https://github.com/ckeditor/ckeditor5/issues/8689.
                if (needsViewPlaceholder(body, true) && viewRoot.childCount === 2 && body.name === 'p') {
                    hasChanged = showViewPlaceholder(writer, body) ? true : hasChanged;
                } else {
                    // Or hide if it is not needed.
                    hasChanged = hideViewPlaceholder(writer, body) ? true : hasChanged;
                }
            }
            return hasChanged;
        });
    }
    /**
	 * Creates navigation between the title and body sections using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys.
	 */ _attachTabPressHandling() {
        const editor = this.editor;
        const model = editor.model;
        // Pressing <kbd>Tab</kbd> inside the title should move the caret to the body.
        editor.keystrokes.set('TAB', (data, cancel)=>{
            model.change((writer)=>{
                const selection = model.document.selection;
                const selectedElements = Array.from(selection.getSelectedBlocks());
                if (selectedElements.length === 1 && selectedElements[0].is('element', 'title-content')) {
                    const root = selection.getFirstPosition().root;
                    const firstBodyElement = root.getChild(1);
                    writer.setSelection(firstBodyElement, 0);
                    cancel();
                }
            });
        });
        // Pressing <kbd>Shift</kbd>+<kbd>Tab</kbd> at the beginning of the body should move the caret to the title.
        editor.keystrokes.set('SHIFT + TAB', (data, cancel)=>{
            model.change((writer)=>{
                const selection = model.document.selection;
                if (!selection.isCollapsed) {
                    return;
                }
                const selectedElement = first(selection.getSelectedBlocks());
                const selectionPosition = selection.getFirstPosition();
                const root = editor.model.document.getRoot(selectionPosition.root.rootName);
                const title = root.getChild(0);
                const body = root.getChild(1);
                if (selectedElement === body && selectionPosition.isAtStart) {
                    writer.setSelection(title.getChild(0), 0);
                    cancel();
                }
            });
        });
    }
}
/**
 * A view-to-model converter for the h1 that appears at the beginning of the document (a title element).
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param evt An object containing information about the fired event.
 * @param data An object containing conversion input, a placeholder for conversion output and possibly other values.
 * @param conversionApi Conversion interface to be used by the callback.
 */ function dataViewModelH1Insertion(evt, data, conversionApi) {
    const modelCursor = data.modelCursor;
    const viewItem = data.viewItem;
    if (!modelCursor.isAtStart || !modelCursor.parent.is('element', '$root')) {
        return;
    }
    if (!conversionApi.consumable.consume(viewItem, {
        name: true
    })) {
        return;
    }
    const modelWriter = conversionApi.writer;
    const title = modelWriter.createElement('title');
    const titleContent = modelWriter.createElement('title-content');
    modelWriter.append(titleContent, title);
    modelWriter.insert(title, modelCursor);
    conversionApi.convertChildren(viewItem, titleContent);
    conversionApi.updateConversionResult(title, data);
}
/**
 * Maps position from the beginning of the model `title` element to the beginning of the view `h1` element.
 *
 * ```html
 * <title>^<title-content>Foo</title-content></title> -> <h1>^Foo</h1>
 * ```
 */ function mapModelPositionToView(editingView) {
    return (evt, data)=>{
        const positionParent = data.modelPosition.parent;
        if (!positionParent.is('element', 'title')) {
            return;
        }
        const modelTitleElement = positionParent.parent;
        const viewElement = data.mapper.toViewElement(modelTitleElement);
        data.viewPosition = editingView.createPositionAt(viewElement, 0);
        evt.stop();
    };
}
/**
 * @returns Returns true when given element is a title. Returns false otherwise.
 */ function isTitle(element) {
    return element.is('element', 'title');
}
/**
 * Changes the given element to the title element.
 */ function changeElementToTitle(element, writer, model) {
    const title = writer.createElement('title');
    writer.insert(title, element, 'before');
    writer.insert(element, title, 0);
    writer.rename(element, 'title-content');
    model.schema.removeDisallowedAttributes([
        element
    ], writer);
}
/**
 * Loops over the list of title elements and fixes additional ones.
 *
 * @returns Returns true when there was any change. Returns false otherwise.
 */ function fixAdditionalTitleElements(titleElements, writer, model) {
    let hasChanged = false;
    for (const title of titleElements){
        if (title.index !== 0) {
            fixTitleElement(title, writer, model);
            hasChanged = true;
        }
    }
    return hasChanged;
}
/**
 * Changes given title element to a paragraph or removes it when it is empty.
 */ function fixTitleElement(title, writer, model) {
    const child = title.getChild(0);
    // Empty title should be removed.
    // It is created as a result of pasting to the title element.
    if (child.isEmpty) {
        writer.remove(title);
        return;
    }
    writer.move(writer.createRangeOn(child), title, 'before');
    writer.rename(child, 'paragraph');
    writer.remove(title);
    model.schema.removeDisallowedAttributes([
        child
    ], writer);
}
/**
 * Returns true when the last paragraph in the document was created only for the placeholder
 * purpose and it's not needed anymore. Returns false otherwise.
 */ function shouldRemoveLastParagraph(placeholder, root) {
    if (!placeholder || !placeholder.is('element', 'paragraph') || placeholder.childCount) {
        return false;
    }
    if (root.childCount <= 2 || root.getChild(root.childCount - 1) !== placeholder) {
        return false;
    }
    return true;
}

export { Heading, HeadingButtonsUI, HeadingCommand, HeadingEditing, HeadingUI, Title, getLocalizedOptions as _getLocalizedHeadingOptions };
//# sourceMappingURL=index.js.map

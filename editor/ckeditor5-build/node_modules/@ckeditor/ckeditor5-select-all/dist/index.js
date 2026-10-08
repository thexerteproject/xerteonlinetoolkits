/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { getCode, parseKeystroke } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconSelectAll } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * The select all command.
 *
 * It is used by the {@link module:select-all/selectallediting~SelectAllEditing select all editing feature} to handle
 * the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke.
 *
 * Executing this command changes the {@glink framework/architecture/editing-engine#model model}
 * selection so it contains the entire content of the editable root of the editor the selection is
 * {@link module:engine/model/selection~ModelSelection#anchor anchored} in.
 *
 * If the selection was anchored in a {@glink framework/tutorials/widgets/implementing-a-block-widget nested editable}
 * (e.g. a caption of an image), the new selection will contain its entire content. Successive executions of this command
 * will expand the selection to encompass more and more content up to the entire editable root of the editor.
 */ class SelectAllCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const model = this.editor.model;
        const selection = model.document.selection;
        let scopeElement = model.schema.getLimitElement(selection);
        // If an entire scope is selected, or the selection's ancestor is not a scope yet,
        // browse through ancestors to find the enclosing parent scope.
        if (selection.containsEntireContent(scopeElement) || !isSelectAllScope(model.schema, scopeElement)) {
            do {
                scopeElement = scopeElement.parent;
                // Do nothing, if the entire `root` is already selected.
                if (!scopeElement) {
                    return;
                }
            }while (!isSelectAllScope(model.schema, scopeElement))
        }
        model.change((writer)=>{
            writer.setSelection(scopeElement, 'in');
        });
    }
}
/**
 * Checks whether the element is a valid select-all scope. Returns true, if the element is a
 * {@link module:engine/model/schema~ModelSchema#isLimit limit}, and can contain any text or paragraph.
 *
 * @param schema Schema to check against.
 * @param element Model element.
 */ function isSelectAllScope(schema, element) {
    return schema.isLimit(element) && (schema.checkChild(element, '$text') || schema.checkChild(element, 'paragraph'));
}

const SELECT_ALL_KEYSTROKE = /* #__PURE__ */ parseKeystroke('Ctrl+A');
/**
 * The select all editing feature.
 *
 * It registers the `'selectAll'` {@link module:select-all/selectallcommand~SelectAllCommand command}
 * and the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke listener which executes it.
 */ class SelectAllEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SelectAllEditing';
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
        const view = editor.editing.view;
        const viewDocument = view.document;
        editor.commands.add('selectAll', new SelectAllCommand(editor));
        this.listenTo(viewDocument, 'keydown', (eventInfo, domEventData)=>{
            if (getCode(domEventData) === SELECT_ALL_KEYSTROKE) {
                editor.execute('selectAll');
                domEventData.preventDefault();
            }
        });
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Select all'),
                    keystroke: 'CTRL+A'
                }
            ]
        });
    }
}

/**
 * The select all UI feature.
 *
 * It registers the `'selectAll'` UI button in the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}. When clicked, the button
 * executes the {@link module:select-all/selectallcommand~SelectAllCommand select all command}.
 */ class SelectAllUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SelectAllUI';
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
        editor.ui.componentFactory.add('selectAll', ()=>{
            const buttonView = this._createButton(ButtonView);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:selectAll', ()=>{
            return this._createButton(MenuBarMenuListItemButtonView);
        });
    }
    /**
	 * Creates a button for select all command to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('selectAll');
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            label: t('Select all'),
            icon: IconSelectAll,
            keystroke: 'Ctrl+A'
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.execute('selectAll');
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The select all feature.
 *
 * This is a "glue" plugin which loads the {@link module:select-all/selectallediting~SelectAllEditing select all editing feature}
 * and the {@link module:select-all/selectallui~SelectAllUI select all UI feature}.
 *
 * Please refer to the documentation of individual features to learn more.
 */ class SelectAll extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            SelectAllEditing,
            SelectAllUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SelectAll';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { SelectAll, SelectAllCommand, SelectAllEditing, SelectAllUI };
//# sourceMappingURL=index.js.map

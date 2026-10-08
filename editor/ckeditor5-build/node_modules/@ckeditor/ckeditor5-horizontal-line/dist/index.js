/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { findOptimalInsertionRange, toWidget, Widget } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { IconHorizontalLine } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * The horizontal line command.
 *
 * The command is registered by {@link module:horizontal-line/horizontallineediting~HorizontalLineEditing} as `'horizontalLine'`.
 *
 * To insert a horizontal line at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'horizontalLine' );
 * ```
 */ class HorizontalLineCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        this.isEnabled = isHorizontalLineAllowedInParent(selection, schema, model);
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 */ execute() {
        const model = this.editor.model;
        model.change((writer)=>{
            const horizontalElement = writer.createElement('horizontalLine');
            model.insertObject(horizontalElement, null, null, {
                setSelection: 'after'
            });
        });
    }
}
/**
 * Checks if a horizontal line is allowed by the schema in the optimal insertion parent.
 *
 * @param model Model instance.
 */ function isHorizontalLineAllowedInParent(selection, schema, model) {
    const parent = getInsertHorizontalLineParent(selection, model);
    return schema.checkChild(parent, 'horizontalLine');
}
/**
 * Returns a node that will be used to insert a horizontal line with `model.insertContent` to check if the horizontal line can be
 * placed there.
 *
 * @param model Model instance.
 */ function getInsertHorizontalLineParent(selection, model) {
    const insertionRange = findOptimalInsertionRange(selection, model);
    const parent = insertionRange.start.parent;
    if (parent.isEmpty && !parent.is('element', '$root')) {
        return parent.parent;
    }
    return parent;
}

/**
 * The horizontal line editing feature.
 */ class HorizontalLineEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HorizontalLineEditing';
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
        const schema = editor.model.schema;
        const t = editor.t;
        const conversion = editor.conversion;
        schema.register('horizontalLine', {
            inheritAllFrom: '$blockObject'
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'horizontalLine',
            view: (modelElement, { writer })=>{
                return writer.createEmptyElement('hr');
            }
        });
        conversion.for('editingDowncast').elementToStructure({
            model: 'horizontalLine',
            view: (modelElement, { writer })=>{
                const label = t('Horizontal line');
                const viewWrapper = writer.createContainerElement('div', null, writer.createEmptyElement('hr'));
                writer.addClass('ck-horizontal-line', viewWrapper);
                writer.setCustomProperty('hr', true, viewWrapper);
                return toHorizontalLineWidget(viewWrapper, writer, label);
            }
        });
        conversion.for('upcast').elementToElement({
            view: 'hr',
            model: 'horizontalLine'
        });
        editor.commands.add('horizontalLine', new HorizontalLineCommand(editor));
    }
}
/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a horizontal line widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property} allowing to
 *   recognize the horizontal line widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 */ function toHorizontalLineWidget(viewElement, writer, label) {
    writer.setCustomProperty('horizontalLine', true, viewElement);
    return toWidget(viewElement, writer, {
        label
    });
}

/**
 * The horizontal line UI plugin.
 */ class HorizontalLineUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HorizontalLineUI';
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
        // Add the `horizontalLine` button to feature components.
        editor.ui.componentFactory.add('horizontalLine', ()=>{
            const buttonView = this._createButton(ButtonView);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:horizontalLine', ()=>{
            return this._createButton(MenuBarMenuListItemButtonView);
        });
    }
    /**
	 * Creates a button for horizontal line command to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('horizontalLine');
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            label: t('Horizontal line'),
            icon: IconHorizontalLine
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.execute('horizontalLine');
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The horizontal line feature.
 *
 * It provides the possibility to insert a horizontal line into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/horizontal-line Horizontal line feature} documentation.
 */ class HorizontalLine extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            HorizontalLineEditing,
            HorizontalLineUI,
            Widget
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HorizontalLine';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { HorizontalLine, HorizontalLineCommand, HorizontalLineEditing, HorizontalLineUI };
//# sourceMappingURL=index.js.map

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { IconShowBlocks } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * The show blocks command.
 *
 * Displays the HTML element names for content blocks.
 */ class ShowBlocksCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
        this.value = false;
    }
    /**
	 * Toggles the visibility of content blocks.
	 */ execute() {
        const CLASS_NAME = 'ck-show-blocks';
        const view = this.editor.editing.view;
        view.change((writer)=>{
            // Multiroot support.
            for (const root of view.document.roots){
                if (!root.hasClass(CLASS_NAME)) {
                    writer.addClass(CLASS_NAME, root);
                    this.value = true;
                } else {
                    writer.removeClass(CLASS_NAME, root);
                    this.value = false;
                }
            }
        });
    }
}

/**
 * The show blocks editing plugin.
 */ class ShowBlocksEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ShowBlocksEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const { editor } = this;
        editor.commands.add('showBlocks', new ShowBlocksCommand(editor));
    }
}

/**
 * The UI plugin of the show blocks feature.
 *
 * It registers the `'showBlocks'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that toggles the visibility of the HTML element names of content blocks.
 */ class ShowBlocksUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ShowBlocksUI';
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
        editor.ui.componentFactory.add('showBlocks', ()=>{
            const buttonView = this._createButton(ButtonView);
            buttonView.set({
                tooltip: true,
                icon: IconShowBlocks
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:showBlocks', ()=>{
            return this._createButton(MenuBarMenuListItemButtonView);
        });
    }
    /**
	 * Creates a button for show blocks command to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('showBlocks');
        const view = new ButtonClass(locale);
        const t = locale.t;
        view.set({
            label: t('Show blocks'),
            isToggleable: true,
            role: 'menuitemcheckbox'
        });
        view.bind('isEnabled').to(command);
        view.bind('isOn').to(command, 'value', command, 'isEnabled', (value, isEnabled)=>value && isEnabled);
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.execute('showBlocks');
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The show blocks feature.
 *
 * For a detailed overview, check the {@glink features/show-blocks Show blocks} feature guide.
 */ class ShowBlocks extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ShowBlocks';
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
            ShowBlocksEditing,
            ShowBlocksUI
        ];
    }
}

export { ShowBlocks, ShowBlocksCommand, ShowBlocksEditing, ShowBlocksUI };
//# sourceMappingURL=index.js.map

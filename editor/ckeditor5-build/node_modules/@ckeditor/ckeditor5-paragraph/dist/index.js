/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { first } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconParagraph } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * The paragraph command.
 */ class ParagraphCommand extends Command {
    constructor(editor){
        super(editor);
        // Since this command may pass selection in execution block, it should be checked directly.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const document = model.document;
        const block = first(document.selection.getSelectedBlocks());
        this.value = !!block && block.is('element', 'paragraph');
        this.isEnabled = !!block && checkCanBecomeParagraph(block, model.schema);
    }
    /**
	 * Executes the command. All the blocks (see {@link module:engine/model/schema~ModelSchema}) in the selection
	 * will be turned to paragraphs.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.selection The selection that the command should be applied to. By default,
	 * if not provided, the command is applied to the {@link module:engine/model/document~ModelDocument#selection}.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const selection = options.selection || document.selection;
        // Don't execute command if selection is in non-editable place.
        if (!model.canEditAt(selection)) {
            return;
        }
        model.change((writer)=>{
            const blocks = selection.getSelectedBlocks();
            for (const block of blocks){
                if (!block.is('element', 'paragraph') && checkCanBecomeParagraph(block, model.schema)) {
                    writer.rename(block, 'paragraph');
                }
            }
        });
    }
}
/**
 * Checks whether the given block can be replaced by a paragraph.
 *
 * @param block A block to be tested.
 * @param schema The schema of the document.
 */ function checkCanBecomeParagraph(block, schema) {
    return schema.checkChild(block.parent, 'paragraph') && !schema.isObject(block);
}

/**
 * The insert paragraph command. It inserts a new paragraph at a specific
 * {@link module:engine/model/position~ModelPosition document position}.
 *
 * ```ts
 * // Insert a new paragraph before an element in the document.
 * editor.execute( 'insertParagraph', {
 *   position: editor.model.createPositionBefore( element )
 * } );
 * ```
 *
 * If a paragraph is disallowed in the context of the specific position, the command
 * will attempt to split position ancestors to find a place where it is possible
 * to insert a paragraph.
 *
 * **Note**: This command moves the selection to the inserted paragraph.
 */ class InsertParagraphCommand extends Command {
    constructor(editor){
        super(editor);
        // Since this command passes position in execution block instead of selection, it should be checked directly.
        this._isEnabledBasedOnSelection = false;
    }
    /**
	 * Executes the command.
	 *
	 * @param options Options for the executed command.
	 * @param options.position The model position at which the new paragraph will be inserted.
	 * @param options.attributes Attributes keys and values to set on a inserted paragraph.
	 * @fires execute
	 */ execute(options) {
        const model = this.editor.model;
        const attributes = options.attributes;
        let position = options.position;
        // Don't execute command if position is in non-editable place.
        if (!model.canEditAt(position)) {
            return null;
        }
        return model.change((writer)=>{
            position = this._findPositionToInsertParagraph(position, writer);
            if (!position) {
                return null;
            }
            const paragraph = writer.createElement('paragraph');
            if (attributes) {
                model.schema.setAllowedAttributes(paragraph, attributes, writer);
            }
            model.insertContent(paragraph, position);
            writer.setSelection(paragraph, 'in');
            return writer.createPositionAt(paragraph, 0);
        });
    }
    /**
	 * Returns the best position to insert a new paragraph.
	 */ _findPositionToInsertParagraph(position, writer) {
        const model = this.editor.model;
        if (model.schema.checkChild(position, 'paragraph')) {
            return position;
        }
        const allowedParent = model.schema.findAllowedParent(position, 'paragraph');
        // It could be there's no ancestor limit that would allow paragraph.
        // In theory, "paragraph" could be disallowed even in the "$root".
        if (!allowedParent) {
            return null;
        }
        const positionParent = position.parent;
        const isTextAllowed = model.schema.checkChild(positionParent, '$text');
        // At empty $block or at the end of $block.
        // <paragraph>[]</paragraph> ---> <paragraph></paragraph><paragraph>[]</paragraph>
        // <paragraph>foo[]</paragraph> ---> <paragraph>foo</paragraph><paragraph>[]</paragraph>
        if (positionParent.isEmpty || isTextAllowed && position.isAtEnd) {
            return model.createPositionAfter(positionParent);
        }
        // At the start of $block with text.
        // <paragraph>[]foo</paragraph> ---> <paragraph>[]</paragraph><paragraph>foo</paragraph>
        if (!positionParent.isEmpty && isTextAllowed && position.isAtStart) {
            return model.createPositionBefore(positionParent);
        }
        return writer.split(position, allowedParent).position;
    }
}

/**
 * The paragraph feature for the editor.
 *
 * It introduces the `<paragraph>` element in the model which renders as a `<p>` element in the DOM and data.
 *
 * It also brings two editors commands:
 *
 * * The {@link module:paragraph/paragraphcommand~ParagraphCommand `'paragraph'`} command that converts all
 * blocks in the model selection into paragraphs.
 * * The {@link module:paragraph/insertparagraphcommand~InsertParagraphCommand `'insertParagraph'`} command
 * that inserts a new paragraph at a specified location in the model.
 */ class Paragraph extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Paragraph';
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
        const model = editor.model;
        editor.commands.add('paragraph', new ParagraphCommand(editor));
        editor.commands.add('insertParagraph', new InsertParagraphCommand(editor));
        // Schema.
        model.schema.register('paragraph', {
            inheritAllFrom: '$block'
        });
        editor.conversion.elementToElement({
            model: 'paragraph',
            view: 'p'
        });
        // Conversion for paragraph-like elements which has not been converted by any plugin.
        editor.conversion.for('upcast').elementToElement({
            model: (viewElement, { writer })=>{
                if (!Paragraph.paragraphLikeElements.has(viewElement.name)) {
                    return null;
                }
                // Do not auto-paragraph empty elements.
                if (viewElement.isEmpty) {
                    return null;
                }
                return writer.createElement('paragraph');
            },
            view: /.+/,
            converterPriority: 'low'
        });
    }
    /**
	 * A list of element names which should be treated by the autoparagraphing algorithms as
	 * paragraph-like. This means that e.g. the following content:
	 *
	 * ```html
	 * <h1>Foo</h1>
	 * <table>
	 *   <tr>
	 *     <td>X</td>
	 *     <td>
	 *       <ul>
	 *         <li>Y</li>
	 *         <li>Z</li>
	 *       </ul>
	 *     </td>
	 *   </tr>
	 * </table>
	 * ```
	 *
	 * contains five paragraph-like elements: `<h1>`, two `<td>`s and two `<li>`s.
	 * Hence, if none of the features is going to convert those elements the above content will be automatically handled
	 * by the paragraph feature and converted to:
	 *
	 * ```html
	 * <p>Foo</p>
	 * <p>X</p>
	 * <p>Y</p>
	 * <p>Z</p>
	 * ```
	 *
	 * Note: The `<td>` containing two `<li>` elements was ignored as the innermost paragraph-like elements
	 * have a priority upon conversion.
	 */ static paragraphLikeElements = new Set([
        'blockquote',
        'dd',
        'div',
        'dt',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'li',
        'p',
        'td',
        'th'
    ]);
}

/**
 * This plugin defines the `'paragraph'` button. It can be used together with
 * {@link module:heading/headingbuttonsui~HeadingButtonsUI} to replace the standard heading dropdown.
 *
 * This plugin is not loaded automatically by the {@link module:paragraph/paragraph~Paragraph} plugin. It must
 * be added manually.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 *     toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class ParagraphButtonUI extends Plugin {
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
        const t = editor.t;
        editor.ui.componentFactory.add('paragraph', (locale)=>{
            const view = new ButtonView(locale);
            const command = editor.commands.get('paragraph');
            view.label = t('Paragraph');
            view.icon = IconParagraph;
            view.tooltip = true;
            view.isToggleable = true;
            view.bind('isEnabled').to(command);
            view.bind('isOn').to(command, 'value');
            view.on('execute', ()=>{
                editor.execute('paragraph');
            });
            return view;
        });
    }
}

export { InsertParagraphCommand, Paragraph, ParagraphButtonUI, ParagraphCommand };
//# sourceMappingURL=index.js.map

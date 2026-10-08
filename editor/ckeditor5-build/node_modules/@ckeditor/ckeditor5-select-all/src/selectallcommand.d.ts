/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module select-all/selectallcommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
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
 */
export declare class SelectAllCommand extends Command {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    execute(): void;
}

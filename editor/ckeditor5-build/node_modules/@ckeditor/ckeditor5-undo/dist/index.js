/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { transformOperationSets, NoOperation } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconUndo, IconRedo } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * Base class for the undo feature commands: {@link module:undo/undocommand~UndoCommand} and {@link module:undo/redocommand~RedoCommand}.
 */ class UndoRedoBaseCommand extends Command {
    /**
	 * Stack of items stored by the command. These are pairs of:
	 *
	 * * {@link module:engine/model/batch~Batch batch} saved by the command,
	 * * {@link module:engine/model/selection~ModelSelection selection} state at the moment of saving the batch.
	 */ _stack = [];
    /**
	 * Stores all batches that were created by this command.
	 *
	 * @internal
	 */ _createdBatches = new WeakSet();
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // Refresh state, so the command is inactive right after initialization.
        this.refresh();
        // This command should not depend on selection change.
        this._isEnabledBasedOnSelection = false;
        // Set the transparent batch for the `editor.data.set()` call if the
        // batch type is not set already.
        this.listenTo(editor.data, 'set', (evt, data)=>{
            // Create a shallow copy of the options to not change the original args.
            // And make sure that an object is assigned to data[ 1 ].
            data[1] = {
                ...data[1]
            };
            const options = data[1];
            // If batch type is not set, default to non-undoable batch.
            if (!options.batchType) {
                options.batchType = {
                    isUndoable: false
                };
            }
        }, {
            priority: 'high'
        });
        // Clear the stack for the `transparent` batches.
        this.listenTo(editor.data, 'set', (evt, data)=>{
            // We can assume that the object exists and it has a `batchType` property.
            // It was ensured with a higher priority listener before.
            const options = data[1];
            if (!options.batchType.isUndoable) {
                this.clearStack();
            }
        });
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._stack.length > 0;
    }
    /**
	 * Returns all batches created by this command.
	 */ get createdBatches() {
        return this._createdBatches;
    }
    /**
	 * Stores a batch in the command, together with the selection state of the {@link module:engine/model/document~ModelDocument document}
	 * created by the editor which this command is registered to.
	 *
	 * @param batch The batch to add.
	 */ addBatch(batch) {
        const docSelection = this.editor.model.document.selection;
        const selection = {
            ranges: docSelection.hasOwnRange ? Array.from(docSelection.getRanges()) : [],
            isBackward: docSelection.isBackward
        };
        this._stack.push({
            batch,
            selection
        });
        this.refresh();
    }
    /**
	 * Removes all items from the stack.
	 */ clearStack() {
        this._stack = [];
        this.refresh();
    }
    /**
	 * Restores the {@link module:engine/model/document~ModelDocument#selection document selection} state after a batch was undone.
	 *
	 * @param ranges Ranges to be restored.
	 * @param isBackward A flag describing whether the restored range was selected forward or backward.
	 * @param operations Operations which has been applied since selection has been stored.
	 */ _restoreSelection(ranges, isBackward, operations) {
        const model = this.editor.model;
        const document = model.document;
        // This will keep the transformed selection ranges.
        const selectionRanges = [];
        // Transform all ranges from the restored selection.
        const transformedRangeGroups = ranges.map((range)=>range.getTransformedByOperations(operations));
        const allRanges = transformedRangeGroups.flat();
        for (const rangeGroup of transformedRangeGroups){
            // While transforming there could appear ranges that are contained by other ranges, we shall ignore them.
            const transformed = rangeGroup.filter((range)=>range.root != document.graveyard).filter((range)=>!isRangeContainedByAnyOtherRange(range, allRanges));
            // All the transformed ranges ended up in graveyard.
            if (!transformed.length) {
                continue;
            }
            // After the range got transformed, we have an array of ranges. Some of those
            // ranges may be "touching" -- they can be next to each other and could be merged.
            normalizeRanges(transformed);
            // For each `range` from `ranges`, we take only one transformed range.
            // This is because we want to prevent situation where single-range selection
            // got transformed to multi-range selection.
            selectionRanges.push(transformed[0]);
        }
        // @if CK_DEBUG_ENGINE // console.log( `Restored selection by undo: ${ selectionRanges.join( ', ' ) }` );
        // `selectionRanges` may be empty if all ranges ended up in graveyard. If that is the case, do not restore selection.
        if (selectionRanges.length) {
            model.change((writer)=>{
                writer.setSelection(selectionRanges, {
                    backward: isBackward
                });
            });
        }
    }
    /**
	 * Undoes a batch by reversing that batch, transforming reversed batch and finally applying it.
	 * This is a helper method for {@link #execute}.
	 *
	 * @param batchToUndo The batch to be undone.
	 * @param undoingBatch The batch that will contain undoing changes.
	 */ _undo(batchToUndo, undoingBatch) {
        const model = this.editor.model;
        const document = model.document;
        // All changes done by the command execution will be saved as one batch.
        this._createdBatches.add(undoingBatch);
        const operationsToUndo = batchToUndo.operations.slice().filter((operation)=>operation.isDocumentOperation);
        operationsToUndo.reverse();
        // We will process each operation from `batchToUndo`, in reverse order. If there were operations A, B and C in undone batch,
        // we need to revert them in reverse order, so first C' (reversed C), then B', then A'.
        for (const operationToUndo of operationsToUndo){
            const nextBaseVersion = operationToUndo.baseVersion + 1;
            const historyOperations = Array.from(document.history.getOperations(nextBaseVersion));
            const transformedSets = transformOperationSets([
                operationToUndo.getReversed()
            ], historyOperations, {
                useRelations: true,
                document: this.editor.model.document,
                padWithNoOps: false,
                forceWeakRemove: true
            });
            const reversedOperations = transformedSets.operationsA;
            // After reversed operation has been transformed by all history operations, apply it.
            for (let operation of reversedOperations){
                // Do not apply any operation on non-editable space.
                const affectedSelectable = operation.affectedSelectable;
                if (affectedSelectable && !model.canEditAt(affectedSelectable)) {
                    operation = new NoOperation(operation.baseVersion);
                }
                // Before applying, add the operation to the `undoingBatch`.
                undoingBatch.addOperation(operation);
                model.applyOperation(operation);
                document.history.setOperationAsUndone(operationToUndo, operation);
            }
        }
    }
}
/**
 * Normalizes list of ranges by joining intersecting or "touching" ranges.
 *
 * @param ranges Ranges to be normalized.
 */ function normalizeRanges(ranges) {
    ranges.sort((a, b)=>a.start.isBefore(b.start) ? -1 : 1);
    for(let i = 1; i < ranges.length; i++){
        const previousRange = ranges[i - 1];
        const joinedRange = previousRange.getJoined(ranges[i], true);
        if (joinedRange) {
            // Replace the ranges on the list with the new joined range.
            i--;
            ranges.splice(i, 2, joinedRange);
        }
    }
}
function isRangeContainedByAnyOtherRange(range, ranges) {
    return ranges.some((otherRange)=>otherRange !== range && otherRange.containsRange(range, true));
}

/**
 * The undo command stores {@link module:engine/model/batch~Batch batches} applied to the
 * {@link module:engine/model/document~ModelDocument document} and is able to undo a batch by reversing it and transforming by
 * batches from {@link module:engine/model/document~ModelDocument#history history} that happened after the reversed batch.
 *
 * The undo command also takes care of restoring the {@link module:engine/model/document~ModelDocument#selection document selection}.
 */ class UndoCommand extends UndoRedoBaseCommand {
    /**
	 * Executes the command. This method reverts a {@link module:engine/model/batch~Batch batch} added to the command's stack, transforms
	 * and applies the reverted version on the {@link module:engine/model/document~ModelDocument document} and removes the batch from
	 * the stack. Then, it restores the {@link module:engine/model/document~ModelDocument#selection document selection}.
	 *
	 * @fires execute
	 * @fires revert
	 * @param batch A batch that should be undone. If not set, the last added batch will be undone.
	 */ execute(batch = null) {
        // If batch is not given, set `batchIndex` to the last index in command stack.
        const batchIndex = batch ? this._stack.findIndex((a)=>a.batch == batch) : this._stack.length - 1;
        const item = this._stack.splice(batchIndex, 1)[0];
        const undoingBatch = this.editor.model.createBatch({
            isUndo: true
        });
        // All changes have to be done in one `enqueueChange` callback so other listeners will not
        // step between consecutive operations, or won't do changes to the document before selection is properly restored.
        this.editor.model.enqueueChange(undoingBatch, ()=>{
            this._undo(item.batch, undoingBatch);
            const operations = this.editor.model.document.history.getOperations(item.batch.baseVersion);
            this._restoreSelection(item.selection.ranges, item.selection.isBackward, operations);
        });
        // Firing `revert` event after the change block to make sure that it includes all changes from post-fixers
        // and make sure that the selection is "stabilized" (the selection range is saved after undo is executed and then
        // restored on redo, so it is important that the selection range is saved after post-fixers are done).
        this.fire('revert', item.batch, undoingBatch);
        this.refresh();
    }
}

/**
 * The redo command stores {@link module:engine/model/batch~Batch batches} that were used to undo a batch by
 * {@link module:undo/undocommand~UndoCommand}. It is able to redo a previously undone batch by reversing the undoing
 * batches created by `UndoCommand`. The reversed batch is transformed by all the batches from
 * {@link module:engine/model/document~ModelDocument#history history} that happened after the reversed undo batch.
 *
 * The redo command also takes care of restoring the {@link module:engine/model/document~ModelDocument#selection document selection}.
 */ class RedoCommand extends UndoRedoBaseCommand {
    /**
	 * Executes the command. This method reverts the last {@link module:engine/model/batch~Batch batch} added to
	 * the command's stack, applies the reverted and transformed version on the
	 * {@link module:engine/model/document~ModelDocument document} and removes the batch from the stack.
	 * Then, it restores the {@link module:engine/model/document~ModelDocument#selection document selection}.
	 *
	 * @fires execute
	 */ execute() {
        const item = this._stack.pop();
        const redoingBatch = this.editor.model.createBatch({
            isUndo: true
        });
        // All changes have to be done in one `enqueueChange` callback so other listeners will not step between consecutive
        // operations, or won't do changes to the document before selection is properly restored.
        this.editor.model.enqueueChange(redoingBatch, ()=>{
            const lastOperation = item.batch.operations[item.batch.operations.length - 1];
            const nextBaseVersion = lastOperation.baseVersion + 1;
            const operations = this.editor.model.document.history.getOperations(nextBaseVersion);
            this._restoreSelection(item.selection.ranges, item.selection.isBackward, operations);
            this._undo(item.batch, redoingBatch);
        });
        // Firing `revert` event after the change block to make sure that it includes all changes from post-fixers
        // and make sure that the selection is "stabilized" (the selection range is saved after undo is executed and then
        // restored on redo, so it is important that the selection range is saved after post-fixers are done).
        this.fire('revert', item.batch, redoingBatch);
        this.refresh();
    }
}

/**
 * The undo engine feature.
 *
 * It introduces the `'undo'` and `'redo'` commands to the editor.
 */ class UndoEditing extends Plugin {
    /**
	 * The command that manages the undo {@link module:engine/model/batch~Batch batches} stack (history).
	 * Created and registered during the {@link #init feature initialization}.
	 */ _undoCommand;
    /**
	 * The command that manages the redo {@link module:engine/model/batch~Batch batches} stack (history).
	 * Created and registered during the {@link #init feature initialization}.
	 */ _redoCommand;
    /**
	 * Keeps track of which batches were registered in undo.
	 */ _batchRegistry = new WeakSet();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'UndoEditing';
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
        // Create commands.
        this._undoCommand = new UndoCommand(editor);
        this._redoCommand = new RedoCommand(editor);
        // Register command to the editor.
        editor.commands.add('undo', this._undoCommand);
        editor.commands.add('redo', this._redoCommand);
        this.listenTo(editor.model, 'applyOperation', (evt, args)=>{
            const operation = args[0];
            // Do not register batch if the operation is not a document operation.
            // This prevents from creating empty undo steps, where all operations where non-document operations.
            // Non-document operations creates and alters content in detached tree fragments (for example, document fragments).
            // Most of time this is preparing data before it is inserted into actual tree (for example during copy & paste).
            // Such operations should not be reversed.
            if (!operation.isDocumentOperation) {
                return;
            }
            const batch = operation.batch;
            const isRedoBatch = this._redoCommand.createdBatches.has(batch);
            const isUndoBatch = this._undoCommand.createdBatches.has(batch);
            const wasProcessed = this._batchRegistry.has(batch);
            // Skip the batch if it was already processed.
            if (wasProcessed) {
                return;
            }
            // Add the batch to the registry so it will not be processed again.
            this._batchRegistry.add(batch);
            if (!batch.isUndoable) {
                return;
            }
            if (isRedoBatch) {
                // If this batch comes from `redoCommand`, add it to the `undoCommand` stack.
                this._undoCommand.addBatch(batch);
            } else if (!isUndoBatch) {
                // If the batch comes neither  from `redoCommand` nor from `undoCommand` then it is a new, regular batch.
                // Add the batch to the `undoCommand` stack and clear the `redoCommand` stack.
                this._undoCommand.addBatch(batch);
                this._redoCommand.clearStack();
            }
        }, {
            priority: 'highest'
        });
        this.listenTo(this._undoCommand, 'revert', (evt, undoneBatch, undoingBatch)=>{
            this._redoCommand.addBatch(undoingBatch);
        });
        editor.keystrokes.set('CTRL+Z', 'undo');
        editor.keystrokes.set('CTRL+Y', 'redo');
        editor.keystrokes.set('CTRL+SHIFT+Z', 'redo');
        // Add the information about the keystrokes to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Undo'),
                    keystroke: 'CTRL+Z'
                },
                {
                    label: t('Redo'),
                    keystroke: [
                        [
                            'CTRL+Y'
                        ],
                        [
                            'CTRL+SHIFT+Z'
                        ]
                    ]
                }
            ]
        });
    }
}

/**
 * The undo UI feature. It introduces the `'undo'` and `'redo'` buttons to the editor.
 */ class UndoUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'UndoUI';
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
        const locale = editor.locale;
        const t = editor.t;
        const localizedUndoIcon = locale.uiLanguageDirection == 'ltr' ? IconUndo : IconRedo;
        const localizedRedoIcon = locale.uiLanguageDirection == 'ltr' ? IconRedo : IconUndo;
        this._addButtonsToFactory('undo', t('Undo'), 'CTRL+Z', localizedUndoIcon);
        this._addButtonsToFactory('redo', t('Redo'), 'CTRL+Y', localizedRedoIcon);
    }
    /**
	 * Creates a button for the specified command.
	 *
	 * @param name Command name.
	 * @param label Button label.
	 * @param keystroke Command keystroke.
	 * @param Icon Source of the icon.
	 */ _addButtonsToFactory(name, label, keystroke, Icon) {
        const editor = this.editor;
        editor.ui.componentFactory.add(name, ()=>{
            const buttonView = this._createButton(ButtonView, name, label, keystroke, Icon);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:' + name, ()=>{
            return this._createButton(MenuBarMenuListItemButtonView, name, label, keystroke, Icon);
        });
    }
    /**
	 * TODO
	 */ _createButton(ButtonClass, name, label, keystroke, Icon) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get(name);
        const view = new ButtonClass(locale);
        view.set({
            label,
            icon: Icon,
            keystroke
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        this.listenTo(view, 'execute', ()=>{
            editor.execute(name);
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The undo feature.
 *
 * This is a "glue" plugin which loads the {@link module:undo/undoediting~UndoEditing undo editing feature}
 * and the {@link module:undo/undoui~UndoUI undo UI feature}.
 *
 * Below is an explanation of the undo mechanism working together with {@link module:engine/model/history~History History}:
 *
 * Whenever an {@link module:engine/model/operation/operation~Operation operation} is applied to the
 * {@link module:engine/model/document~ModelDocument document}, it is saved to `History` as is.
 * The {@link module:engine/model/batch~Batch batch} that owns that operation is also saved, in
 * {@link module:undo/undocommand~UndoCommand}, together with the selection that was present in the document before the
 * operation was applied. A batch is saved instead of the operation because changes are undone batch-by-batch, not operation-by-operation
 * and a batch is seen as one undo step.
 *
 * After changes happen to the document, the `History` and `UndoCommand` stack can be represented as follows:
 *
 * ```
 *    History                            Undo stack
 * ==============             ==================================
 * [operation A1]                      [  batch A  ]
 * [operation B1]                      [  batch B  ]
 * [operation B2]                      [  batch C  ]
 * [operation C1]
 * [operation C2]
 * [operation B3]
 * [operation C3]
 * ```
 *
 * Where operations starting with the same letter are from same batch.
 *
 * Undoing a batch means that a set of operations which will reverse the effects of that batch needs to be generated.
 * For example, if a batch added several letters, undoing the batch should remove them. It is important to apply undoing
 * operations in the reversed order, so if a batch has operation `X`, `Y`, `Z`, reversed operations `Zr`, `Yr` and `Xr`
 * need to be applied. Otherwise reversed operation `Xr` would operate on a wrong document state, because operation `X`
 * does not know that operations `Y` and `Z` happened.
 *
 * After operations from an undone batch got {@link module:engine/model/operation/operation~Operation#getReversed reversed},
 * one needs to make sure if they are ready to be applied. In the scenario above, operation `C3` is the last operation and `C3r`
 * bases on up-to-date document state, so it can be applied to the document.
 *
 * ```
 *      History                             Undo stack
 * =================             ==================================
 * [ operation A1  ]                      [  batch A  ]
 * [ operation B1  ]                      [  batch B  ]
 * [ operation B2  ]             [   processing undoing batch C   ]
 * [ operation C1  ]
 * [ operation C2  ]
 * [ operation B3  ]
 * [ operation C3  ]
 * [ operation C3r ]
 * ```
 *
 * Next is operation `C2`, reversed to `C2r`. `C2r` bases on `C2`, so it bases on the wrong document state. It needs to be
 * transformed by operations from history that happened after it, so it "knows" about them. Let us assume that `C2' = C2r * B3 * C3 * C3r`,
 * where `*` means "transformed by". Rest of operations from that batch are processed in the same fashion.
 *
 * ```
 *      History                             Undo stack                                      Redo stack
 * =================             ==================================             ==================================
 * [ operation A1  ]                      [  batch A  ]                                    [ batch Cr ]
 * [ operation B1  ]                      [  batch B  ]
 * [ operation B2  ]
 * [ operation C1  ]
 * [ operation C2  ]
 * [ operation B3  ]
 * [ operation C3  ]
 * [ operation C3r ]
 * [ operation C2' ]
 * [ operation C1' ]
 * ```
 *
 * Selective undo works on the same basis, however, instead of undoing the last batch in the undo stack, any batch can be undone.
 * The same algorithm applies: operations from a batch (i.e. `A1`) are reversed and then transformed by operations stored in history.
 *
 * Redo also is very similar to undo. It has its own stack that is filled with undoing (reversed batches). Operations from
 * the batch that is re-done are reversed-back, transformed in proper order and applied to the document.
 *
 * ```
 *      History                             Undo stack                                      Redo stack
 * =================             ==================================             ==================================
 * [ operation A1  ]                      [  batch A  ]
 * [ operation B1  ]                      [  batch B  ]
 * [ operation B2  ]                      [ batch Crr ]
 * [ operation C1  ]
 * [ operation C2  ]
 * [ operation B3  ]
 * [ operation C3  ]
 * [ operation C3r ]
 * [ operation C2' ]
 * [ operation C1' ]
 * [ operation C1'r]
 * [ operation C2'r]
 * [ operation C3rr]
 * ```
 */ class Undo extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            UndoEditing,
            UndoUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Undo';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { RedoCommand, Undo, UndoCommand, UndoEditing, UndoRedoBaseCommand, UndoUI };
//# sourceMappingURL=index.js.map

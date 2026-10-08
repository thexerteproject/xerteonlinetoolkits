/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/utils/deletecontent
 */
import { ModelDocumentSelection } from '../documentselection.js';
import { type Model } from '../model.js';
import { type ModelSelection } from '../selection.js';
/**
 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
 *
 * **Note:** Use {@link module:engine/model/model~Model#deleteContent} instead of this function.
 * This function is only exposed to be reusable in algorithms
 * which change the {@link module:engine/model/model~Model#deleteContent}
 * method's behavior.
 *
 * @param model The model in context of which the insertion should be performed.
 * @param selection Selection of which the content should be deleted.
 * @param options.leaveUnmerged Whether to merge elements after removing the content of the selection.
 *
 * For example `<heading>x[x</heading><paragraph>y]y</paragraph>` will become:
 *
 * * `<heading>x^y</heading>` with the option disabled (`leaveUnmerged == false`)
 * * `<heading>x^</heading><paragraph>y</paragraph>` with enabled (`leaveUnmerged == true`).
 *
 * Note: {@link module:engine/model/schema~ModelSchema#isObject object} and {@link module:engine/model/schema~ModelSchema#isLimit limit}
 * elements will not be merged.
 *
 * @param options.doNotResetEntireContent Whether to skip replacing the entire content with a
 * paragraph when the entire content was selected.
 *
 * For example `<heading>[x</heading><paragraph>y]</paragraph>` will become:
 *
 * * `<paragraph>^</paragraph>` with the option disabled (`doNotResetEntireContent == false`)
 * * `<heading>^</heading>` with enabled (`doNotResetEntireContent == true`).
 *
 * @param options.doNotAutoparagraph Whether to create a paragraph if after content deletion selection is moved
 * to a place where text cannot be inserted.
 *
 * For example `<paragraph>x</paragraph>[<imageBlock src="foo.jpg"></imageBlock>]` will become:
 *
 * * `<paragraph>x</paragraph><paragraph>[]</paragraph>` with the option disabled (`doNotAutoparagraph == false`)
 * * `<paragraph>x</paragraph>[]` with the option enabled (`doNotAutoparagraph == true`).
 *
 * If you use this option you need to make sure to handle invalid selections yourself or leave
 * them to the selection post-fixer (may not always work).
 *
 * **Note:** If there is no valid position for the selection, the paragraph will always be created:
 *
 * `[<imageBlock src="foo.jpg"></imageBlock>]` -> `<paragraph>[]</paragraph>`.
 *
 * @param options.doNotFixSelection Whether given selection-to-remove should be fixed if it ends at the beginning of an element.
 *
 * By default, `deleteContent()` will fix selection before performing a deletion, so that the selection does not end at the beginning of
 * an element. For example, selection `<heading>[Heading</heading><paragraph>]Some text.</paragraph>` will be treated as it was
 * `<heading>[Heading]</heading><paragraph>Some text.</paragraph>`. As a result, the elements will not get merged.
 *
 * If selection is as in example, visually, the next element (paragraph) is not selected and it may be confusing for the user that
 * the elements got merged. Selection is set up like this by browsers when a user triple-clicks on some text.
 *
 * However, in some cases, it is expected to remove content exactly as selected in the selection, without any fixing. In these cases,
 * this flag can be set to `true`, which will prevent fixing the selection.
 *
 * @internal
 */
export declare function deleteContent(model: Model, selection: ModelSelection | ModelDocumentSelection, options?: {
    leaveUnmerged?: boolean;
    doNotResetEntireContent?: boolean;
    doNotAutoparagraph?: boolean;
    doNotFixSelection?: boolean;
}): void;

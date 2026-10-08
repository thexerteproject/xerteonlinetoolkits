/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
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
 */
export declare class Paragraph extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "Paragraph";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
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
     */
    static paragraphLikeElements: Set<string>;
}

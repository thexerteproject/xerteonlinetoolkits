/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { FontCommand } from '../fontcommand.js';
import { FONT_FAMILY } from '../utils.js';
/**
 * The font family command. It is used by {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply the font family.
 *
 * ```ts
 * editor.execute( 'fontFamily', { value: 'Arial' } );
 * ```
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 */
export class FontFamilyCommand extends FontCommand {
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor, FONT_FAMILY);
    }
}

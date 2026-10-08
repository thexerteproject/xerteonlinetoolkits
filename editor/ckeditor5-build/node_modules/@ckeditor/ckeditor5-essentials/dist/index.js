/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter/dist/index.js';
import { SelectAll } from '@ckeditor/ckeditor5-select-all/dist/index.js';
import { Typing } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { Undo } from '@ckeditor/ckeditor5-undo/dist/index.js';
import { AccessibilityHelp } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * A plugin including all essential editing features. It represents a set of features that enables similar functionalities
 * to a `<textarea>` element.
 *
 * It includes:
 *
 * * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp},
 * * {@link module:clipboard/clipboard~Clipboard},
 * * {@link module:enter/enter~Enter},
 * * {@link module:select-all/selectall~SelectAll},
 * * {@link module:enter/shiftenter~ShiftEnter},
 * * {@link module:typing/typing~Typing},
 * * {@link module:undo/undo~Undo}.
 *
 * This plugin set does not define any block-level containers (such as {@link module:paragraph/paragraph~Paragraph}).
 * If your editor is supposed to handle block content, make sure to include it.
 */ class Essentials extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            AccessibilityHelp,
            Clipboard,
            Enter,
            SelectAll,
            ShiftEnter,
            Typing,
            Undo
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Essentials';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Essentials };
//# sourceMappingURL=index.js.map

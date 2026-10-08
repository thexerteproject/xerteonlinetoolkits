/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing
 */
export { Typing } from './typing.js';
export { Input } from './input.js';
export { Delete } from './delete.js';
export { TextWatcher } from './textwatcher.js';
export { TwoStepCaretMovement } from './twostepcaretmovement.js';
export { TextTransformation } from './texttransformation.js';
export { inlineHighlight } from './utils/inlinehighlight.js';
export { findAttributeRange, findAttributeRangeBound } from './utils/findattributerange.js';
export { getLastTextLine } from './utils/getlasttextline.js';
export { TypingChangeBuffer } from './utils/changebuffer.js';
export { InsertTextCommand } from './inserttextcommand.js';
export { DeleteCommand } from './deletecommand.js';
export { DeleteObserver as _DeleteObserver } from './deleteobserver.js';
import './augmentation.js';

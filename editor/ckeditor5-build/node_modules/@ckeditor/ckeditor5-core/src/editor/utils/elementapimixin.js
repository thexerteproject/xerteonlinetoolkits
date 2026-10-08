/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/editor/utils/elementapimixin
 */
import { CKEditorError, setDataInElement } from '@ckeditor/ckeditor5-utils';
/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
 */
export function ElementApiMixin(base) {
    class Mixin extends base {
        sourceElement;
        updateSourceElement(data) {
            if (!this.sourceElement) {
                /**
                 * Cannot update the source element of a detached editor.
                 *
                 * The {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement `updateSourceElement()`}
                 * method cannot be called if you did not pass an element to `Editor.create()`.
                 *
                 * @error editor-missing-sourceelement
                 */
                throw new CKEditorError('editor-missing-sourceelement', this);
            }
            const shouldUpdateSourceElement = this.config.get('updateSourceElementOnDestroy');
            const isSourceElementTextArea = this.sourceElement instanceof HTMLTextAreaElement;
            // The data returned by the editor might be unsafe, so we want to prevent rendering
            // unsafe content inside the source element different than <textarea>, which is considered
            // secure. This behavior could be changed by setting the `updateSourceElementOnDestroy`
            // configuration option to `true`.
            if (!shouldUpdateSourceElement && !isSourceElementTextArea) {
                setDataInElement(this.sourceElement, '');
                return;
            }
            const dataToSet = typeof data === 'string' ? data : this.data.get();
            setDataInElement(this.sourceElement, dataToSet);
        }
    }
    return Mixin;
}

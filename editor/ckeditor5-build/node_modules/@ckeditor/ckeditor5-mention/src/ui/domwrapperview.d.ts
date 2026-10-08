/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module mention/ui/domwrapperview
 */
import { View } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
/**
 * This class wraps DOM element as a CKEditor5 UI View.
 *
 * It allows to render any DOM element and use it in mentions list.
 */
export declare class MentionDomWrapperView extends View {
    /**
     * The DOM element for which wrapper was created.
     */
    domElement: HTMLElement;
    /**
     * Controls whether the dom wrapper view is "on". This is in line with {@link module:ui/button/button~Button#isOn} property.
     *
     * @observable
     * @default true
     */
    isOn: boolean;
    /**
     * Creates an instance of {@link module:mention/ui/domwrapperview~MentionDomWrapperView} class.
     *
     * Also see {@link #render}.
     */
    constructor(locale: Locale, domElement: HTMLElement);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the DOM element.
     */
    focus(): void;
}

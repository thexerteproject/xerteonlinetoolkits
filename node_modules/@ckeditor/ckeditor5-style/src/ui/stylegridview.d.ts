/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/ui/stylegridview
 */
import { View, type ViewCollection, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { StyleGridButtonView } from './stylegridbuttonview.js';
import type { NormalizedStyleDefinition } from '../styleutils.js';
import '../../theme/stylegrid.css';
/**
 * A class representing a grid of styles ({@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}).
 * Allows users to select a style.
 *
 * @internal
 */
export declare class StyleGridView extends View<HTMLDivElement> implements FocusableView {
    /**
     * Tracks information about the DOM focus in the view.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of style {@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}.
     */
    readonly children: ViewCollection<StyleGridButtonView>;
    /**
     * Array of active style names. They must correspond to the names of styles from
     * definitions passed to the {@link #constructor}.
     *
     * @observable
     */
    readonly activeStyles: Array<string>;
    /**
     * Array of enabled style names. They must correspond to the names of styles from
     * definitions passed to the {@link #constructor}.
     *
     * @observable
     */
    readonly enabledStyles: Array<string>;
    /**
     * Creates an instance of the {@link module:style/ui/stylegridview~StyleGridView} class.
     *
     * @param locale The localization services instance.
     * @param styleDefinitions Definitions of the styles.
     */
    constructor(locale: Locale, styleDefinitions: Array<NormalizedStyleDefinition>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the first style button in the grid.
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
/**
 * Fired when a {@link module:style/ui/stylegridbuttonview~StyleGridButtonView style} was selected (clicked) by the user.
 *
 * @eventName ~StyleGridView#execute
 */
export type StyleGridViewExecuteEvent = {
    name: 'execute';
    args: [];
};

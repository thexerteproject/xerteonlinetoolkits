/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/ui/stylepanelview
 */
import { FocusCycler, View, ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { StyleGroupView } from './stylegroupview.js';
import { type StyleGridView } from './stylegridview.js';
import type { NormalizedStyleDefinitions } from '../styleutils.js';
import '../../theme/stylepanel.css';
/**
 * A class representing a panel with available content styles. It renders styles in button grids, grouped
 * in categories.
 *
 * @internal
 */
export declare class StylePanelView extends View<HTMLDivElement> {
    /**
     * Tracks information about DOM focus in the panel.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of panel children.
     */
    readonly children: ViewCollection<StyleGroupView>;
    /**
     * A view representing block styles group.
     */
    readonly blockStylesGroupView: StyleGroupView;
    /**
     * A view representing inline styles group
     */
    readonly inlineStylesGroupView: StyleGroupView;
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
     * A collection of views that can be focused in the panel.
     */
    protected readonly _focusables: ViewCollection<StyleGridView>;
    /**
     * Helps cycling over {@link #_focusables} in the panel.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
     *
     * @param locale The localization services instance.
     * @param styleDefinitions Normalized definitions of the styles.
     */
    constructor(locale: Locale, styleDefinitions: NormalizedStyleDefinitions);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the first focusable element in the panel.
     */
    focus(): void;
    /**
     * Focuses the last focusable element in the panel.
     */
    focusLast(): void;
}
/**
 * Fired when a style was selected (clicked) by the user.
 *
 * @eventName ~StylePanelView#execute
 */
export type StylePanelViewExecuteEvent = {
    name: 'execute';
    args: [];
};

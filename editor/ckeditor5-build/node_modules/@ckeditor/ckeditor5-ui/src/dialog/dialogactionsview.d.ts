/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dialog/dialogactionsview
 */
import { KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import type { Button } from '../button/button.js';
import { ButtonView } from '../button/buttonview.js';
import { View } from '../view.js';
import { ViewCollection } from '../viewcollection.js';
import { FocusCycler, type FocusableView } from '../focuscycler.js';
import '../../theme/components/dialog/dialogactions.css';
/**
 * A dialog actions view class. It contains button views which are used to execute dialog actions.
 */
export declare class DialogActionsView extends View {
    /**
     * A collection of button views.
     */
    readonly children: ViewCollection<FocusableView>;
    /**
     * A keystroke handler instance.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A focus cycler instance.
     */
    readonly focusCycler: FocusCycler;
    /**
     * A focus tracker instance.
     */
    private readonly _focusTracker;
    /**
     * A collection of focusable views.
     */
    private readonly _focusables;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Creates the button views based on the given definitions.
     * Then adds them to the {@link #children} collection and to the focus cycler.
     */
    setButtons(definitions: Array<DialogActionButtonDefinition>): void;
    /**
     * @inheritDoc
     */
    focus(direction?: 1 | -1): void;
    /**
     * Adds all elements from the {@link #children} collection to the {@link #_focusables} collection
     * and to the {@link #_focusTracker} instance.
     */
    private _updateFocusCyclableItems;
}
/**
 * A dialog action button definition. It is a slightly modified version
 * of the {@link module:ui/button/button~Button} definition.
 */
export type DialogActionButtonDefinition = Pick<Button, 'label'> & Partial<Pick<Button, 'withText' | 'class' | 'icon'>> & {
    onExecute: Function;
    onCreate?: (button: ButtonView) => void;
};

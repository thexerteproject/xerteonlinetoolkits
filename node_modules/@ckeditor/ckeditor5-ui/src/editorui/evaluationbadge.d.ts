/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/evaluationbadge
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
import { View } from '../view.js';
import { Badge, type BadgeConfig } from '../badge/badge.js';
/**
 * A helper that enables the "evaluation badge" feature in the editor at the bottom of the editable element
 * (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export declare class EvaluationBadge extends Badge {
    private licenseTypeMessage;
    constructor(editor: Editor);
    /**
     * Enables "evaluation badge" label.
     */
    protected _isEnabled(): boolean;
    /**
     * Creates the content of the "evaluation badge".
     */
    protected _createBadgeContent(): View<HTMLElement>;
    /**
     * Returns the normalized configuration for the "evaluation badge".
     * It takes 'ui.poweredBy' configuration into account to determine the badge position and side.
     */
    protected _getNormalizedConfig(): BadgeConfig;
}

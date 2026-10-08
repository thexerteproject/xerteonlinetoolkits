/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { View } from '../view.js';
import { Badge } from '../badge/badge.js';
import type { Editor, PoweredByConfig } from '@ckeditor/ckeditor5-core';
/**
 * A helper that enables the "powered by" feature in the editor and renders a link to the project's
 * webpage next to the bottom of the editable element (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export declare class PoweredBy extends Badge {
    constructor(editor: Editor);
    /**
     * Enables "powered by" label.
     */
    protected _isEnabled(): boolean;
    /**
     * Creates a "powered by" badge content.
     */
    protected _createBadgeContent(): View<HTMLElement>;
    /**
     * Returns the normalized configuration for the "powered by" badge.
     * It takes the user configuration into account and falls back to the default one.
     */
    protected _getNormalizedConfig(): Required<PoweredByConfig>;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentcommandbehavior/indentusingoffset
 */
import type { IndentBehavior } from './indentbehavior.js';
/**
 * The block indentation behavior that uses offsets to set indentation.
 *
 * @internal
 */
export declare class IndentUsingOffset implements IndentBehavior {
    /**
     * The direction of indentation.
     */
    isForward: boolean;
    /**
     * The offset of the next indentation step.
     */
    offset: number;
    /**
     * Indentation unit.
     */
    unit: string;
    /**
     * Creates an instance of the indentation behavior.
     *
     * @param config.direction The direction of indentation.
     * @param config.offset The offset of the next indentation step.
     * @param config.unit Indentation unit.
     */
    constructor(config: {
        direction: 'forward' | 'backward';
        offset: number;
        unit: string;
    });
    /**
     * @inheritDoc
     */
    checkEnabled(indentAttributeValue: string): boolean;
    /**
     * @inheritDoc
     */
    getNextIndent(indentAttributeValue: string): string | undefined;
}

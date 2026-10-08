/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentcommandbehavior/indentusingclasses
 */
import type { IndentBehavior } from './indentbehavior.js';
/**
 * The block indentation behavior that uses classes to set indentation.
 *
 * @internal
 */
export declare class IndentUsingClasses implements IndentBehavior {
    /**
     * The direction of indentation.
     */
    isForward: boolean;
    /**
     * A list of classes used for indentation.
     */
    classes: Array<string>;
    /**
     * Creates an instance of the indentation behavior.
     *
     * @param config.direction The direction of indentation.
     * @param config.classes A list of classes used for indentation.
     */
    constructor(config: {
        direction: 'forward' | 'backward';
        classes: Array<string>;
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

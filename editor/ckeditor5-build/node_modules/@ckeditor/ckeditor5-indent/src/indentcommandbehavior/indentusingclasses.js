/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * The block indentation behavior that uses classes to set indentation.
 *
 * @internal
 */
export class IndentUsingClasses {
    /**
     * The direction of indentation.
     */
    isForward;
    /**
     * A list of classes used for indentation.
     */
    classes;
    /**
     * Creates an instance of the indentation behavior.
     *
     * @param config.direction The direction of indentation.
     * @param config.classes A list of classes used for indentation.
     */
    constructor(config) {
        this.isForward = config.direction === 'forward';
        this.classes = config.classes;
    }
    /**
     * @inheritDoc
     */
    checkEnabled(indentAttributeValue) {
        const currentIndex = this.classes.indexOf(indentAttributeValue);
        if (this.isForward) {
            return currentIndex < this.classes.length - 1;
        }
        else {
            return currentIndex >= 0;
        }
    }
    /**
     * @inheritDoc
     */
    getNextIndent(indentAttributeValue) {
        const currentIndex = this.classes.indexOf(indentAttributeValue);
        const indexStep = this.isForward ? 1 : -1;
        const nextIndex = currentIndex + indexStep;
        const nextIndexClamped = Math.min(nextIndex, this.classes.length - 1);
        return this.classes[nextIndexClamped];
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
type CreateSpinnerOptions = {
    /**
     * Whether the spinner should be disabled.
     */
    isDisabled?: boolean;
    /**
     * An emoji that will replace the spinner when it finishes.
     *
     * @default '📍'
     */
    emoji?: string;
    /**
     * The indent level.
     */
    indentLevel?: number;
    /**
     * If specified, the spinner contains a counter. It starts from `0`.
     * To increase its value, call the `#increase()` method on the returned instance of the spinner.
     */
    total?: number;
    /**
     * If a spinner is a counter, this option allows customizing the displayed line.
     *
     * @default '[title] Status: [current]/[total].'
     */
    status?: string | CKEditor5SpinnerStatus;
};
type CKEditor5Spinner = {
    start: () => void;
    increase: () => void;
    finish: (options?: {
        emoji?: string;
    }) => void;
};
type CKEditor5SpinnerStatus = (title: string, current: number, total: number) => string;
/**
 * A factory function that creates an instance of a CLI spinner. It supports both a spinner CLI and a spinner with a counter.
 *
 * The spinner improves UX when processing a time-consuming task. A developer does not have to consider whether the process hanged on.
 *
 * @param title Description of the current processed task.
 * @param [options={}]
 */
export default function createSpinner(title: string, options?: CreateSpinnerOptions): CKEditor5Spinner;
export {};

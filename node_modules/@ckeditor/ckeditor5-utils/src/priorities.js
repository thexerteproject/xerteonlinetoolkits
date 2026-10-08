/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Provides group of constants to use instead of hardcoding numeric priority values.
 */
export const priorities = {
    get(priority = 'normal') {
        if (typeof priority != 'number') {
            return this[priority] || this.normal;
        }
        else {
            return priority;
        }
    },
    highest: 100000,
    high: 1000,
    normal: 0,
    low: -1000,
    lowest: -100000
};

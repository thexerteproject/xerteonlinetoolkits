/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Traverses both structures to find out whether there is a reference that is shared between both structures.
 *
 * @internal
 */
export declare function areConnectedThroughProperties(target1: unknown, target2: unknown, excludedNodes?: Set<unknown>): boolean;

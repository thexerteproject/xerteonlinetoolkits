/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/utils/conflictingdecorators
 */
/**
 * Checks if two decorators conflict with each other.
 *
 * Decorators conflict when they share the same HTML attribute names (excluding mergeable attributes)
 * or style properties.
 *
 * @internal
 * @param a The first decorator.
 * @param b The second decorator.
 */
export declare function areDecoratorsConflicting(a: DecoratorLike, b: DecoratorLike): boolean;
/**
 * Resolves conflicting manual decorators by automatically disabling decorators that share
 * the same HTML attributes with newly enabled decorators.
 *
 * @internal
 * @param options Configuration object.
 * @param options.decoratorStates Initial decorator states.
 * @param options.allDecorators Collection of all manual decorators.
 * @returns Updated decorator states with conflicts resolved.
 */
export declare function resolveConflictingDecorators({ decoratorStates, allDecorators }: {
    decoratorStates: Record<string, boolean>;
    allDecorators: Array<DecoratorLike & {
        value?: boolean;
    }>;
}): Record<string, boolean>;
/**
 * Decorator-like object representing attributes and styles.
 */
type DecoratorLike = {
    id: string;
    attributes?: Record<string, string>;
    styles?: Record<string, string>;
};
export {};

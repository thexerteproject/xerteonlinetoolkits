/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
export class ModelTypeCheckable {
    /* istanbul ignore next -- @preserve */
    is() {
        // There are a lot of overloads above.
        // Overriding method in derived classes remove them and only `is( type: string ): boolean` is visible which we don't want.
        // One option would be to copy them all to all classes, but that's ugly.
        // It's best when TypeScript compiler doesn't see those overloads, except the one in the top base class.
        // To overload a method, but not let the compiler see it, do after class definition:
        // `MyClass.prototype.is = function( type: string ) {...}`
        throw new Error('is() method is abstract');
    }
}

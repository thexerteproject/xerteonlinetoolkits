/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
type TypeScriptLoaderOptions = {
    configFile?: string;
    debugFlags?: Array<string>;
    includeDebugLoader?: boolean;
};
type TypeScriptLoader = {
    test: RegExp;
    use: Array<LoaderToUse>;
};
type LoaderToUse = {
    loader: string;
    options: {
        target: string;
        tsconfig: string;
    };
};
export default function getTypeScriptLoader(options?: TypeScriptLoaderOptions): TypeScriptLoader;
export {};

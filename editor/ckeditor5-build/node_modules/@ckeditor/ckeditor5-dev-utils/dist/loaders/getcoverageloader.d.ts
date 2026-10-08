/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
type CoverageLoaderConfig = {
    test: RegExp;
    use: Array<{
        loader: string;
        options: {
            plugins: Array<string>;
        };
    }>;
    include: Array<RegExp>;
    exclude: Array<RegExp>;
};
export default function getCoverageLoader({ files }: {
    files: Array<Array<string>>;
}): CoverageLoaderConfig;
export {};

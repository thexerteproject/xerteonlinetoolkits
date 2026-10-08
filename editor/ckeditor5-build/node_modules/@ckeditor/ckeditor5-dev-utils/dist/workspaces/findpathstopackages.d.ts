/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
type Options = {
    includePackageJson?: boolean;
    includeCwd?: boolean;
    packagesDirectoryFilter?: ((packageJsonPath: string) => boolean) | null;
};
/**
 * This function locates package.json files for all packages located in `packagesDirectory` in the repository structure.
 */
export default function findPathsToPackages(cwd: string, packagesDirectory: string | null, options?: Options): Promise<Array<string>>;
export {};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    keywords?: Array<string>;
    type?: 'commonjs' | 'module';
    main?: string;
    types?: string;
    dependencies?: {
        [packageName: string]: string;
    };
    devDependencies?: {
        [packageName: string]: string;
    };
    peerDependencies?: {
        [packageName: string]: string;
    };
    optionalDependencies?: {
        [packageName: string]: string;
    };
    author?: string | {
        name: string;
        email?: string;
        url?: string;
    };
    license?: string;
    homepage?: string;
    bugs?: string | {
        url: string;
        email?: string;
    };
    repository?: string | {
        type: string;
        url: string;
        directory?: string;
    };
    files?: Array<string>;
    scripts?: {
        [key: string]: string;
    };
    private?: boolean;
    engines?: {
        [engineName: string]: string;
    };
    bin?: {
        [commandName: string]: string;
    };
    [key: string]: any;
}
export default function getPackageJson(cwd: string, options: {
    async: true;
}): Promise<PackageJson>;
export default function getPackageJson(cwd: string, options?: {
    async?: false;
}): PackageJson;

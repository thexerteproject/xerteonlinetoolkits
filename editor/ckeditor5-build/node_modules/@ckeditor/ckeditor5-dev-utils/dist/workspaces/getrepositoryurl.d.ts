/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
export default function getRepositoryUrl(cwd: string, options: {
    async: true;
}): Promise<string>;
export default function getRepositoryUrl(cwd: string, options?: {
    async?: false;
}): string;

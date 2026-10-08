/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
export default function commit({ cwd, message, files, dryRun }: {
    cwd: string;
    message: string;
    files: Array<string>;
    dryRun?: boolean;
}): Promise<void>;

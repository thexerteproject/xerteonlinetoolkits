/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import { type Verbosity } from '../logger/index.js';
type ShExecOptions = {
    /**
     * Level of the verbosity. If set as 'info' both outputs (stdout and stderr) will be logged.
     * If set as 'error', only stderr output will be logged.
     */
    verbosity?: Verbosity;
    cwd?: string;
    /**
     * If set, the command execution is asynchronous. The execution is synchronous by default.
     */
    async?: boolean;
};
export default function shExec(command: string, options: {
    async: true;
} & ShExecOptions): Promise<string>;
export default function shExec(command: string, options?: ({
    async?: false;
} & ShExecOptions)): string;
export {};

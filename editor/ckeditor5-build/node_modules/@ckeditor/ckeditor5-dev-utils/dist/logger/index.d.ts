/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
export type Verbosity = 'info' | 'warning' | 'error' | 'silent';
export type Logger = {
    /**
     * Displays a message when the verbosity level is equal to 'info'.
     *
     * @param {string} message Message to log.
     */
    info: (message: string) => void;
    /**
     * Displays a warning message when the verbosity level is equal to 'info' or 'warning'.
     *
     * @param {string} message Message to log.
     */
    warning: (message: string) => void;
    /**
     * Displays an error message.
     *
     * @param {string} message Message to log.
     * @param {Error} [error] An error instance to log in the console.
     */
    error: (message: string, error?: Error) => void;
    /**
     * @internal
     */
    _log: (messageVerbosity: Verbosity, message: string, error?: Error) => void;
};
/**
 * Logger module which allows configuring the verbosity level.
 *
 * There are three levels of verbosity:
 * 1. `info` - all messages will be logged,
 * 2. `warning` - warning and errors will be logged,
 * 3. `error` - only errors will be logged.
 *
 * Usage:
 *
 *      import { logger } from '@ckeditor/ckeditor5-dev-utils';
 *
 *      const infoLog = logger( 'info' );
 *      infoLog.info( 'Message.' ); // This message will be always displayed.
 *      infoLog.warning( 'Message.' ); // This message will be always displayed.
 *      infoLog.error( 'Message.' ); // This message will be always displayed.
 *
 *      const warningLog = logger( 'warning' );
 *      warningLog.info( 'Message.' ); // This message won't be displayed.
 *      warningLog.warning( 'Message.' ); // This message will be always displayed.
 *      warningLog.error( 'Message.' ); // This message will be always displayed.
 *
 *      const errorLog = logger( 'error' );
 *      errorLog.info( 'Message.' ); // This message won't be displayed.
 *      errorLog.warning( 'Message.' ); // This message won't be displayed.
 *      errorLog.error( 'Message.' ); // This message will be always displayed.
 *
 * Additionally, the `logger#error()` method prints the error instance if provided as the second argument.
 */
export default function logger(moduleVerbosity?: Verbosity): Logger;

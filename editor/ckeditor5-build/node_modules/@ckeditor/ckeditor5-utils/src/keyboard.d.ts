/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A set of utilities related to keyboard support.
 *
 * @module utils/keyboard
 */
import type { LanguageDirection } from './language.js';
/**
 * An object with `keyName => keyCode` pairs for a set of known keys.
 *
 * Contains:
 *
 * * `a-z`,
 * * `0-9`,
 * * `f1-f12`,
 * * `` ` ``, `-`, `=`, `[`, `]`, `;`, `'`, `,`, `.`, `/`, `\`,
 * * `arrow(left|up|right|bottom)`,
 * * `backspace`, `delete`, `end`, `enter`, `esc`, `home`, `tab`,
 * * `ctrl`, `cmd`, `shift`, `alt`.
 */
export declare const keyCodes: {
    readonly [keyCode: string]: number;
};
/**
 * Converts a key name or {@link module:utils/keyboard~KeystrokeInfo keystroke info} into a key code.
 *
 * Note: Key names are matched with {@link module:utils/keyboard#keyCodes} in a case-insensitive way.
 *
 * @param key A key name (see {@link module:utils/keyboard#keyCodes}) or a keystroke data object.
 * @returns Key or keystroke code.
 */
export declare function getCode(key: string | Readonly<KeystrokeInfo>): number;
/**
 * Parses the keystroke and returns a keystroke code that will match the code returned by
 * {@link module:utils/keyboard~getCode} for the corresponding {@link module:utils/keyboard~KeystrokeInfo keystroke info}.
 *
 * The keystroke can be passed in two formats:
 *
 * * as a single string – e.g. `ctrl + A`,
 * * as an array of {@link module:utils/keyboard~keyCodes known key names} and key codes – e.g.:
 *   * `[ 'ctrl', 32 ]` (ctrl + space),
 *   * `[ 'ctrl', 'a' ]` (ctrl + A).
 *
 * Note: Key names are matched with {@link module:utils/keyboard#keyCodes} in a case-insensitive way.
 *
 * Note: Only keystrokes with a single non-modifier key are supported (e.g. `ctrl+A` is OK, but `ctrl+A+B` is not).
 *
 * Note: On macOS, keystroke handling is translating the `Ctrl` key to the `Cmd` key and handling only that keystroke.
 * For example, a registered keystroke `Ctrl+A` will be translated to `Cmd+A` on macOS. To disable the translation of some keystroke,
 * use the forced modifier: `Ctrl!+A` (note the exclamation mark).
 *
 * @param keystroke The keystroke definition.
 * @returns Keystroke code.
 */
export declare function parseKeystroke(keystroke: string | ReadonlyArray<number | string>): number;
/**
 * Translates any keystroke string text like `"Ctrl+A"` to an
 * environment–specific keystroke, i.e. `"⌘A"` on macOS.
 *
 * @param keystroke The keystroke text.
 * @param [forcedEnv] The environment to force the key translation to. If not provided, the current environment is used.
 * @returns The keystroke text specific for the environment.
 */
export declare function getEnvKeystrokeText(keystroke: string, forcedEnv?: 'PC' | 'Mac'): string;
/**
 * Returns `true` if the provided key code represents one of the arrow keys.
 *
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 */
export declare function isArrowKeyCode(keyCode: number): boolean;
/**
 * String representing a direction of an arrow key kode.
 */
export type ArrowKeyCodeDirection = 'left' | 'up' | 'right' | 'down';
/**
 * Returns the direction in which the {@link module:engine/model/documentselection~ModelDocumentSelection selection}
 * will move when the provided arrow key code is pressed considering the language direction of the editor content.
 *
 * For instance, in right–to–left (RTL) content languages, pressing the left arrow means moving the selection right (forward)
 * in the model structure. Similarly, pressing the right arrow moves the selection left (backward).
 *
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 * @returns Localized arrow direction or `undefined` for non-arrow key codes.
 */
export declare function getLocalizedArrowKeyCodeDirection(keyCode: number, contentLanguageDirection: LanguageDirection): ArrowKeyCodeDirection | undefined;
/**
 * Determines if the provided key code moves the {@link module:engine/model/documentselection~ModelDocumentSelection selection}
 * forward or backward considering the language direction of the editor content.
 *
 * For instance, in right–to–left (RTL) languages, pressing the left arrow means moving forward
 * in the model structure. Similarly, pressing the right arrow moves the selection backward.
 *
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 */
export declare function isForwardArrowKeyCode(keyCode: number, contentLanguageDirection: LanguageDirection): boolean;
/**
 * Information about the keystroke.
 */
export interface KeystrokeInfo {
    /**
     * The [key code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode).
     */
    keyCode: number;
    /**
     * Whether the <kbd>Alt</kbd> modifier was pressed.
     */
    altKey: boolean;
    /**
     * Whether the <kbd>Cmd</kbd> modifier was pressed.
     */
    metaKey: boolean;
    /**
     * Whether the <kbd>Ctrl</kbd> modifier was pressed.
     */
    ctrlKey: boolean;
    /**
     * Whether the <kbd>Shift</kbd> modifier was pressed.
     */
    shiftKey: boolean;
}

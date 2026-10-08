/**
 * @param {Readonly<Element>} node
 *   hast element to inspect.
 * @param {Properties | undefined} [explicitProperties]
 *   Properties to use, normally taken from `node`, but can be changed.
 * @returns {Options}
 *   Options.
 */
export function findSelectedOptions(node: Readonly<Element>, explicitProperties?: Properties | undefined): Options;
/**
 * Option, where the item at `0` is the label, the item at `1` the value.
 */
export type Option = [string, Value];
/**
 * List of options.
 */
export type Options = Array<Option>;
/**
 * `value` field of option.
 */
export type Value = string | undefined;
import type { Element } from 'hast';
import type { Properties } from 'hast';
//# sourceMappingURL=find-selected-options.d.ts.map
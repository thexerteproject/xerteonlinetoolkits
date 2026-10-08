/**
 * @import {State} from 'hast-util-to-mdast'
 * @import {Text as HastText} from 'hast'
 * @import {Text as MdastText} from 'mdast'
 */
/**
 * @param {State} state
 *   State.
 * @param {Readonly<HastText>} node
 *   hast element to transform.
 * @returns {MdastText}
 *   mdast node.
 */
export function text(state: State, node: Readonly<HastText>): MdastText;
import type { State } from 'hast-util-to-mdast';
import type { Text as HastText } from 'hast';
import type { Text as MdastText } from 'mdast';
//# sourceMappingURL=text.d.ts.map
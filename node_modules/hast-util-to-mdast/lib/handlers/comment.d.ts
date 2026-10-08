/**
 * @import {State} from 'hast-util-to-mdast'
 * @import {Comment} from 'hast'
 * @import {Html} from 'mdast'
 */
/**
 * @param {State} state
 *   State.
 * @param {Readonly<Comment>} node
 *   hast element to transform.
 * @returns {Html}
 *   mdast node.
 */
export function comment(state: State, node: Readonly<Comment>): Html;
import type { State } from 'hast-util-to-mdast';
import type { Comment } from 'hast';
import type { Html } from 'mdast';
//# sourceMappingURL=comment.d.ts.map
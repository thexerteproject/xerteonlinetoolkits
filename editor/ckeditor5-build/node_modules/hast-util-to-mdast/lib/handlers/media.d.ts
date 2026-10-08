/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Array<MdastRootContent> | Link}
 *   mdast node.
 */
export function media(state: State, node: Readonly<Element>): Array<MdastRootContent> | Link;
import type { State } from 'hast-util-to-mdast';
import type { Element } from 'hast';
import type { RootContent as MdastRootContent } from 'mdast';
import type { Link } from 'mdast';
//# sourceMappingURL=media.d.ts.map
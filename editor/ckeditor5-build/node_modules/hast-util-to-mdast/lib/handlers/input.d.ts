/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Array<Link | Text> | Image | Text | undefined}
 *   mdast node.
 */
export function input(state: State, node: Readonly<Element>): Array<Link | Text> | Image | Text | undefined;
import type { State } from 'hast-util-to-mdast';
import type { Element } from 'hast';
import type { Link } from 'mdast';
import type { Text } from 'mdast';
import type { Image } from 'mdast';
//# sourceMappingURL=input.d.ts.map
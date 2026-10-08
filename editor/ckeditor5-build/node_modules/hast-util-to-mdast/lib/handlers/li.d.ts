/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {ListItem}
 *   mdast node.
 */
export function li(state: State, node: Readonly<Element>): ListItem;
/**
 * Result of extracting a leading checkbox.
 */
export type ExtractResult = {
    /**
     *   The checkbox that was removed, if any.
     */
    checkbox: Element | undefined;
    /**
     *   If there was a leading checkbox, a deep clone of the node w/o the leading
     *   checkbox; otherwise a reference to the given, untouched, node.
     */
    rest: Element;
};
import type { State } from 'hast-util-to-mdast';
import type { Element } from 'hast';
import type { ListItem } from 'mdast';
//# sourceMappingURL=li.d.ts.map
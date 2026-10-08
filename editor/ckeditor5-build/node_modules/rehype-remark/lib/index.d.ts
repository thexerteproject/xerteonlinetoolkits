/**
 * Turn HTML into markdown.
 *
 * ###### Notes
 *
 * *   if a processor is given, runs the (remark) plugins used on it with an
 *     mdast tree, then discards the result (*bridge mode*)
 * *   otherwise, returns an mdast tree, the plugins used after `rehypeRemark`
 *     are remark plugins (*mutate mode*)
 *
 * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.
 *
 * @overload
 * @param {Processor} processor
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Options | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @overload
 * @param {Options | Processor | null | undefined} [destination]
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge | TransformMutate}
 *
 * @param {Options | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Options | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
export default function rehypeRemark(processor: Processor, options?: Options | null | undefined): TransformBridge;
/**
 * Turn HTML into markdown.
 *
 * ###### Notes
 *
 * *   if a processor is given, runs the (remark) plugins used on it with an
 *     mdast tree, then discards the result (*bridge mode*)
 * *   otherwise, returns an mdast tree, the plugins used after `rehypeRemark`
 *     are remark plugins (*mutate mode*)
 *
 * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.
 *
 * @overload
 * @param {Processor} processor
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Options | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @overload
 * @param {Options | Processor | null | undefined} [destination]
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge | TransformMutate}
 *
 * @param {Options | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Options | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
export default function rehypeRemark(options?: Options | null | undefined): TransformMutate;
/**
 * Turn HTML into markdown.
 *
 * ###### Notes
 *
 * *   if a processor is given, runs the (remark) plugins used on it with an
 *     mdast tree, then discards the result (*bridge mode*)
 * *   otherwise, returns an mdast tree, the plugins used after `rehypeRemark`
 *     are remark plugins (*mutate mode*)
 *
 * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.
 *
 * @overload
 * @param {Processor} processor
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Options | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @overload
 * @param {Options | Processor | null | undefined} [destination]
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge | TransformMutate}
 *
 * @param {Options | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Options | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
export default function rehypeRemark(destination?: Options | Processor | null | undefined, options?: Options | null | undefined): TransformBridge | TransformMutate;
/**
 * Bridge-mode.
 *
 * Runs the destination with the new mdast tree.
 * Discards result.
 */
export type TransformBridge = (tree: HastRoot, file: VFile) => Promise<undefined>;
/**
 * Mutate-mode.
 *
 * Further transformers run on the mdast tree.
 */
export type TransformMutate = (tree: HastRoot, file: VFile) => MdastRoot;
import type { Processor } from 'unified';
import type { Options } from 'hast-util-to-mdast';
import type { Root as HastRoot } from 'hast';
import type { VFile } from 'vfile';
import type { Root as MdastRoot } from 'mdast';
//# sourceMappingURL=index.d.ts.map
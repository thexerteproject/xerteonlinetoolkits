/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { HtmlSupportDataSchemaBlockElementDefinition, HtmlSupportDataSchemaInlineElementDefinition } from './dataschema.js';
/**
 * @module html-support/schemadefinitions
 */
/**
 * Skipped elements due to HTML deprecation:
 * * noframes (not sure if we should provide support for this element. CKE4 is not supporting frameset and frame,
 *   but it will unpack <frameset><noframes>foobar</noframes></frameset> to <noframes>foobar</noframes>, so there
 *   may be some content loss. Although using noframes as a standalone element seems invalid)
 * * keygen (this one is also empty)
 * * applet (support is limited mostly to old IE)
 * * basefont (this one is also empty)
 * * isindex (basically no support for modern browsers at all)
 *
 * Skipped elements due to lack empty element support:
 * * hr
 * * area
 * * br
 * * command
 * * map
 * * wbr
 * * colgroup -> col
 *
 * Skipped elements due to complexity:
 * * datalist with option elements used as a data source for input[list] element
 *
 * Skipped elements as they are handled as an object content:
 * * track
 * * source
 * * option
 * * param
 * * optgroup
 *
 * Skipped full page HTML elements:
 * * body
 * * html
 * * title
 * * head
 * * meta
 * * link
 * * etc...
 *
 * Skipped hidden elements:
 * noscript
 *
 * When adding elements to this list, update the feature guide listing, too.
 *
 * @internal
 */
export declare const defaultConfig: {
    block: HtmlSupportDataSchemaBlockElementDefinition[];
    inline: HtmlSupportDataSchemaInlineElementDefinition[];
};

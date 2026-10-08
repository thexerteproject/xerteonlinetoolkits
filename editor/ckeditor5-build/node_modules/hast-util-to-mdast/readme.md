# hast-util-to-mdast

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to transform to [mdast][].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`toMdast(tree[, options])`](#tomdasttree-options)
  * [`defaultHandlers`](#defaulthandlers)
  * [`defaultNodeHandlers`](#defaultnodehandlers)
  * [`Handle`](#handle)
  * [`NodeHandle`](#nodehandle)
  * [`Options`](#options)
  * [`State`](#state)
* [Examples](#examples)
  * [Example: ignoring things](#example-ignoring-things)
  * [Example: keeping some HTML](#example-keeping-some-html)
* [Algorithm](#algorithm)
* [Syntax](#syntax)
* [Syntax tree](#syntax-tree)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a utility that takes a [hast][] (HTML) syntax tree as input and
turns it into an [mdast][] (markdown) syntax tree.

## When should I use this?

This project is useful when you want to turn HTML to markdown.

The mdast utility [`mdast-util-to-hast`][mdast-util-to-hast] does the inverse of
this utility.
It turns markdown into HTML.

The rehype plugin [`rehype-remark`][rehype-remark] wraps this utility to also
turn HTML to markdown at a higher-level (easier) abstraction.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install hast-util-to-mdast
```

In Deno with [`esm.sh`][esmsh]:

```js
import {toMdast} from 'https://esm.sh/hast-util-to-mdast@10'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {toMdast} from 'https://esm.sh/hast-util-to-mdast@10?bundle'
</script>
```

## Use

Say we have the following `example.html`:

```html
<h2>Hello <strong>world!</strong></h2>
```

…and next to it a module `example.js`:

```js
import fs from 'node:fs/promises'
import {fromHtml} from 'hast-util-from-html'
import {toMdast} from 'hast-util-to-mdast'
import {toMarkdown} from 'mdast-util-to-markdown'

const html = String(await fs.readFile('example.html'))
const hast = fromHtml(html, {fragment: true})
const mdast = toMdast(hast)
const markdown = toMarkdown(mdast)

console.log(markdown)
```

…now running `node example.js` yields:

```markdown
## Hello **world!**
```

## API

This package exports the identifiers [`defaultHandlers`][api-default-handlers],
[`defaultNodeHandlers`][api-default-node-handlers], and
[`toMdast`][api-to-mdast].
There is no default export.

### `toMdast(tree[, options])`

Transform hast to mdast.

###### Parameters

* `tree` ([`HastNode`][hast-node])
  — hast tree to transform
* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

mdast tree ([`MdastNode`][mdast-node]).

### `defaultHandlers`

Default handlers for elements (`Record<string, Handle>`).

Each key is an element name, each value is a [`Handle`][api-handle].

### `defaultNodeHandlers`

Default handlers for nodes (`Record<string, NodeHandle>`).

Each key is a node type, each value is a [`NodeHandle`][api-node-handle].

### `Handle`

Handle a particular element (TypeScript type).

###### Parameters

* `state` ([`State`][api-state])
  — info passed around about the current state
* `element` ([`Element`][element])
  — element to transform
* `parent` ([`HastParent`][hast-parent])
  — parent of `element`

###### Returns

mdast node or nodes (`Array<MdastNode> | MdastNode | undefined`).

### `NodeHandle`

Handle a particular node (TypeScript type).

###### Parameters

* `state` ([`State`][api-state])
  — info passed around about the current state
* `node` (`any`)
  — node to transform
* `parent` ([`HastParent`][hast-parent])
  — parent of `node`

###### Returns

mdast node or nodes (`Array<MdastNode> | MdastNode | undefined`).

### `Options`

Configuration (TypeScript type).

##### Fields

###### `newlines`

Keep line endings when collapsing whitespace (`boolean`, default: `false`).

The default collapses to a single space.

###### `checked`

Value to use for a checked checkbox or radio input (`string`, default: `[x]`).

###### `unchecked`

Value to use for an unchecked checkbox or radio input (`string`, default:
`[ ]`).

###### `quotes`

List of quotes to use (`Array<string>`, default: `['"']`).

Each value can be one or two characters.
When two, the first character determines the opening quote and the second the
closing quote at that level.
When one, both the opening and closing quote are that character.

The order in which the preferred quotes appear determines which quotes to use at
which level of nesting.
So, to prefer `‘’` at the first level of nesting, and `“”` at the second, pass
`['‘’', '“”']`.
If `<q>`s are nested deeper than the given amount of quotes, the markers wrap
around: a third level of nesting when using `['«»', '‹›']` should have double
guillemets, a fourth single, a fifth double again, etc.

###### `document`

Whether the given tree represents a complete document (`boolean`, default:
`undefined`).

Applies when the `tree` is a `root` node.
When the tree represents a complete document, then things are wrapped in
paragraphs when needed, and otherwise they’re left as-is.
The default checks for whether there’s mixed content: some *[phrasing][]* nodes
*and* some non-phrasing nodes.

###### `handlers`

Object mapping tag names to functions handling the corresponding elements
(`Record<string, Handle>`).

Merged into the defaults.
See [`Handle`][api-handle].

###### `nodeHandlers`

Object mapping node types to functions handling the corresponding nodes
(`Record<string, NodeHandle>`).

Merged into the defaults.
See [`NodeHandle`][api-node-handle].

### `State`

Info passed around about the current state (TypeScript type).

###### Fields

* `patch` (`(from: HastNode, to: MdastNode) => undefined`)
  — copy a node’s positional info
* `one` (`(node: HastNode, parent: HastParent | undefined) => Array<MdastNode> | MdastNode | undefined`)
  — transform a hast node to mdast
* `all` (`(parent: HastParent) => Array<MdastContent>`)
  — transform the children of a hast parent to mdast
* `toFlow` (`(nodes: Array<MdastContent>) => Array<MdastFlowContent>`)
  — transform a list of mdast nodes to flow
* `toSpecificContent` (`<ParentType>(nodes: Array<MdastContent>, build: (() => ParentType)) => Array<ParentType>`)
  — turn arbitrary content into a list of a particular node type
* `resolve` (`(url: string | null | undefined) => string`)
  — resolve a URL relative to a base
* `options` ([`Options`][api-options])
  — user configuration
* `elementById` (`Map<string, Element>`)
  — elements by their `id`
* `handlers` (`Record<string, Handle>`)
  — applied element handlers (see [`Handle`][api-handle])
* `nodeHandlers` (`Record<string, NodeHandle>`)
  — applied node handlers (see [`NodeHandle`][api-node-handle])
* `baseFound` (`boolean`)
  — whether a `<base>` element was seen
* `frozenBaseUrl` (`string | undefined`)
  — `href` of `<base>`, if any
* `inTable` (`boolean`)
  — whether we’re in a table
* `qNesting` (`number`)
  — how deep we’re in `<q>`s

## Examples

### Example: ignoring things

It’s possible to exclude something from within HTML when turning it into
markdown, by wrapping it in an element with a `data-mdast` attribute set to
`'ignore'`.
For example:

```html
<p><strong>Strong</strong> and <em data-mdast="ignore">emphasis</em>.</p>
```

Yields:

```markdown
**Strong** and .
```

It’s also possible to pass a handler to ignore nodes.
For example, to ignore `em` elements, pass `handlers: {'em': function () {}}`:

```html
<p><strong>Strong</strong> and <em>emphasis</em>.</p>
```

Yields:

```markdown
**Strong** and .
```

### Example: keeping some HTML

The goal of this project is to map HTML to plain and readable markdown.
That means that certain elements are ignored (such as `<svg>`) or “downgraded”
(such as `<video>` to links).
You can change this by passing handlers.

Say we have the following file `example.html`:

```html
<p>
  Some text with
  <svg viewBox="0 0 1 1" width="1" height="1"><rect fill="black" x="0" y="0" width="1" height="1" /></svg>
  a graphic… Wait is that a dead pixel?
</p>
```

This can be achieved with `example.js` like so:

```js
/**
 * @import {Html} from 'mdast'
 */

import fs from 'node:fs/promises'
import {fromHtml} from 'hast-util-from-html'
import {toHtml} from 'hast-util-to-html'
import {toMdast} from 'hast-util-to-mdast'
import {toMarkdown} from 'mdast-util-to-markdown'

const html = String(await fs.readFile('example.html'))
const hast = fromHtml(html, {fragment: true})
const mdast = toMdast(hast, {
  handlers: {
    svg(state, node) {
      /** @type {Html} */
      const result = {type: 'html', value: toHtml(node, {space: 'svg'})}
      state.patch(node, result)
      return result
    }
  }
})
const markdown = toMarkdown(mdast)

console.log(markdown)
```

Yields:

```markdown
Some text with <svg viewBox="0 0 1 1" width="1" height="1"><rect fill="black" x="0" y="0" width="1" height="1"></rect></svg> a graphic… Wait is that a dead pixel?
```

<!-- Old ID of this section. -->

<a name="implied-paragraphs"></a>

## Algorithm

The algorithm used in this project is very powerful.
It supports all HTML elements, including ancient elements (`xmp`) and obscure
ones (`base`).
It’s particularly good at forms, media, and around implicit and explicit
paragraphs (see [HTML Standard, A. van Kesteren; et al. WHATWG § 3.2.5.4
Paragraphs][html-paragraphs]), such as:

```html
<article>
  An implicit paragraph.
  <h1>An explicit paragraph.</h1>
</article>
```

Yields:

```markdown
An implicit paragraph.

# An explicit paragraph.
```

## Syntax

HTML is handled according to [WHATWG HTML][html] (the living standard), which is
also followed by browsers such as Chrome and Firefox.

This project creates markdown according to [GFM][], which is a standard that’s
based on [CommonMark][] but adds the strikethrough (`~like so~`) and tables
(`| Table header | …`) amongst some alternative syntaxes.

## Syntax tree

The input syntax tree format is [hast][].
Any HTML that can be represented in hast is accepted as input.
The output syntax tree format is [mdast][].

When `<table>` elements or `<del>`, `<s>`, and `<strike>` exist in the HTML,
then the GFM nodes `table` and `delete` are used.
This utility does not generate definitions or references, or syntax extensions
such as footnotes, frontmatter, or math.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Handle`][api-handle],
[`NodeHandle`][api-node-handle],
[`Options`][api-options],
and [`State`][api-state].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `hast-util-to-mdast@^10`,
compatible with Node.js 16.

## Security

Use of `hast-util-to-mdast` is safe by default.

## Related

* [`hast-util-to-nlcst`](https://github.com/syntax-tree/hast-util-to-nlcst)
  — transform hast to nlcst
* [`hast-util-to-xast`](https://github.com/syntax-tree/hast-util-to-xast)
  — transform hast to xast

## Contribute

See [`contributing.md` in `syntax-tree/.github`][health-contributing] for ways
to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][author]

<!-- Definitions -->

[api-default-handlers]: #defaulthandlers

[api-default-node-handlers]: #defaultnodehandlers

[api-handle]: #handle

[api-node-handle]: #nodehandle

[api-options]: #options

[api-state]: #state

[api-to-mdast]: #tomdasttree-options

[author]: https://wooorm.com

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[build]: https://github.com/syntax-tree/hast-util-to-mdast/actions

[build-badge]: https://github.com/syntax-tree/hast-util-to-mdast/workflows/main/badge.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[collective]: https://opencollective.com/unified

[commonmark]: https://commonmark.org

[coverage]: https://codecov.io/github/syntax-tree/hast-util-to-mdast

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-to-mdast.svg

[downloads]: https://www.npmjs.com/package/hast-util-to-mdast

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-to-mdast.svg

[element]: https://github.com/syntax-tree/hast#element

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[file-license]: license

[gfm]: https://github.github.com/gfm/

[hast]: https://github.com/syntax-tree/hast

[hast-node]: https://github.com/syntax-tree/hast#nodes

[hast-parent]: https://github.com/syntax-tree/hast#parent

[health-coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[health-support]: https://github.com/syntax-tree/.github/blob/main/support.md

[html]: https://html.spec.whatwg.org/multipage/

[html-paragraphs]: https://html.spec.whatwg.org/multipage/dom.html#paragraphs

[mdast]: https://github.com/syntax-tree/mdast

[mdast-node]: https://github.com/syntax-tree/mdast#nodes

[mdast-util-to-hast]: https://github.com/syntax-tree/mdast-util-to-hast

[npm]: https://docs.npmjs.com/cli/install

[phrasing]: https://github.com/syntax-tree/mdast#phrasingcontent

[rehype-remark]: https://github.com/rehypejs/rehype-remark

[size]: https://bundlejs.com/?q=hast-util-to-mdast

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=hast-util-to-mdast

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[typescript]: https://www.typescriptlang.org

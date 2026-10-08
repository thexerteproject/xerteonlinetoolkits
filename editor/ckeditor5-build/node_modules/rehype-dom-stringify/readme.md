# rehype-dom-stringify

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to add support for serializing HTML in browsers.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`unified().use(rehypeDomStringify[, options])`](#unifieduserehypedomstringify-options)
  * [`Options`](#options)
* [Syntax](#syntax)
* [Syntax tree](#syntax-tree)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This is like [`rehype-stringify`][rehype-stringify] but for browsers.
This plugin uses DOM APIs to do its work, which makes it smaller in browsers, at
the cost of not supporting formatting options.

## When should I use this?

Use this package when you want to use `rehype-stringify` solely in browsers.
See [the monorepo readme][rehype-dom] for info on when to use `rehype-dom`.

This plugin is built on [`hast-util-to-dom`][hast-util-to-dom], which is a low
level tool to turn hast syntax trees into DOM nodes.
rehype focusses on making it easier to transform content by abstracting such
internals away.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install rehype-dom-stringify
```

In Deno with [`esm.sh`][esmsh]:

```js
import rehypeDomStringify from 'https://esm.sh/rehype-dom-stringify@4'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import rehypeDomStringify from 'https://esm.sh/rehype-dom-stringify@4?bundle'
</script>
```

## Use

Say our page `example.html` contains:

```html
<!doctype html>
<title>Example</title>
<body>
<script type="module">
  import remarkParse from 'https://esm.sh/remark-parse@11?bundle'
  import remarkRehype from 'https://esm.sh/remark-rehype@11?bundle'
  import rehypeDomStringify from 'https://esm.sh/rehype-dom-stringify@4?bundle'
  import {unified} from 'https://esm.sh/unified@11?bundle'

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDomStringify)
    .process('# Hello, world!')

  console.log(String(file))
</script>
```

…opening it in a browser prints the following to the browser console:

```html
<h1>Hello, world!</h1>
```

## API

This package exports no identifiers.
The default export is [`rehypeDomStringify`][api-rehype-dom-stringify].

### `unified().use(rehypeDomStringify[, options])`

Add support for serializing as HTML with DOM APIs.

###### Parameters

* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

### `Options`

Configuration (TypeScript type).

> 👉 **Note**: the default of the `fragment` option is `true` in this package,
> which is different from the value in `rehype-parse`, as this makes more sense
> in browsers.

###### Fields

* `fragment` (`boolean`, default: `true`)
  — specify whether to serialize a fragment
* `namespace` (`string`, optional)
  — namespace to start with

## Syntax

HTML is parsed and serialized according to what a browser supports (which
*should* be WHATWG HTML).

## Syntax tree

The syntax tree used in rehype is [hast][].

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

It also registers `Settings` with `unified`.
If you’re passing options with `.data('settings', …)`, make sure to import this
package somewhere in your types, as that registers the fields.

```js
/**
 * @import {} from 'rehype-dom-stringify'
 */

import {unified} from 'unified'

// @ts-expect-error: `thisDoesNotExist` is not a valid option.
unified().data('settings', {thisDoesNotExist: false})
```

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line,
`rehype-dom-stringify@^4`, compatible with Node.js 16.

## Security

Use of `rehype-dom-stringify` can open you up to a [cross-site scripting
(XSS)][xss] attack if dangerous content is used and the result is used with
the actual DOM.
Use [`rehype-sanitize`][rehype-sanitize] to solve that.

## Contribute

See [`contributing.md`][contributing] in [`rehypejs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[ISC][license] © [Keith McKnight][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype-dom/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype-dom/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/rehypejs/rehype-dom.svg

[coverage]: https://codecov.io/github/rehypejs/rehype-dom

[downloads-badge]: https://img.shields.io/npm/dm/rehype-dom-stringify.svg

[downloads]: https://www.npmjs.com/package/rehype-dom-stringify

[size-badge]: https://img.shields.io/bundlejs/size/rehype-dom-stringify

[size]: https://bundlejs.com/?q=rehype-dom-stringify

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[author]: https://keith.mcknig.ht

[license]: https://github.com/rehypejs/rehype-dom/blob/main/license

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/main/contributing.md

[support]: https://github.com/rehypejs/.github/blob/main/support.md

[coc]: https://github.com/rehypejs/.github/blob/main/code-of-conduct.md

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[hast]: https://github.com/syntax-tree/hast

[hast-util-to-dom]: https://github.com/syntax-tree/hast-util-to-dom

[rehype]: https://github.com/rehypejs/rehype

[rehype-dom]: https://github.com/rehypejs/rehype-dom

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[rehype-stringify]: https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify

[typescript]: https://www.typescriptlang.org

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[api-options]: #options

[api-rehype-dom-stringify]: #unifieduserehypedomstringify-options

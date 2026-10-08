# trim-trailing-lines

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Remove final line endings from a string.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`trimTrailingLines(value)`](#trimtrailinglinesvalue)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This is a tiny package that removes final line endings (CR, LF, CR+LF) from a
string.

## When should I use this?

This package is rather niche, I found myself repeating this code when working
with a lot of markdown.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install trim-trailing-lines
```

In Deno with [`esm.sh`][esmsh]:

```js
import {trimTrailingLines} from 'https://esm.sh/trim-trailing-lines@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {trimTrailingLines} from 'https://esm.sh/trim-trailing-lines@2?bundle'
</script>
```

## Use

```js
import {trimTrailingLines} from 'trim-trailing-lines'

trimTrailingLines('foo\nbar') // => 'foo\nbar'
trimTrailingLines('foo\nbar\n') // => 'foo\nbar'
trimTrailingLines('foo\nbar\n\n') // => 'foo\nbar'
```

## API

This package exports the identifier `trimTrailingLines`.
There is no default export.

### `trimTrailingLines(value)`

Remove final line endings from `value`.

##### Parameters

###### `valeu`

Value with trailing line endings, coerced to string (`unknown`).

##### Returns

Value without trailing line endings (`string`).

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## Security

This package is safe.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/trim-trailing-lines/workflows/main/badge.svg

[build]: https://github.com/wooorm/trim-trailing-lines/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/trim-trailing-lines.svg

[coverage]: https://codecov.io/github/wooorm/trim-trailing-lines

[downloads-badge]: https://img.shields.io/npm/dm/trim-trailing-lines.svg

[downloads]: https://www.npmjs.com/package/trim-trailing-lines

[size-badge]: https://img.shields.io/bundlephobia/minzip/trim-trailing-lines.svg

[size]: https://bundlephobia.com/result?p=trim-trailing-lines

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

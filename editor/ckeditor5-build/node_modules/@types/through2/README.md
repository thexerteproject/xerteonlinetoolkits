# Installation
> `npm install --save @types/through2`

# Summary
This package contains type definitions for through2 (https://github.com/rvagg/through2).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/through2.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/through2/index.d.ts)
````ts
/// <reference types="node" />

import stream = require("stream");

declare function through2(transform?: through2.TransformFunction, flush?: through2.FlushCallback): stream.Transform;
declare function through2(
    opts?: stream.DuplexOptions,
    transform?: through2.TransformFunction,
    flush?: through2.FlushCallback,
): stream.Transform;

declare namespace through2 {
    interface Through2Constructor extends stream.Transform {
        new(opts?: stream.DuplexOptions): stream.Transform;
        (opts?: stream.DuplexOptions): stream.Transform;
    }

    type TransformCallback = (err?: any, data?: any) => void;
    type TransformFunction = (
        this: stream.Transform,
        chunk: any,
        enc: BufferEncoding,
        callback: TransformCallback,
    ) => void;
    type FlushCallback = (this: stream.Transform, flushCallback: () => void) => void;

    /**
     * Convenvience method for creating object streams
     */
    function obj(transform?: TransformFunction, flush?: FlushCallback): stream.Transform;

    /**
     * Creates a constructor for a custom Transform. This is useful when you
     * want to use the same transform logic in multiple instances.
     */
    function ctor(transform?: TransformFunction, flush?: FlushCallback): Through2Constructor;
    function ctor(
        opts?: stream.DuplexOptions,
        transform?: TransformFunction,
        flush?: FlushCallback,
    ): Through2Constructor;
}

export = through2;

````

### Additional Details
 * Last updated: Tue, 07 Nov 2023 20:08:00 GMT
 * Dependencies: [@types/node](https://npmjs.com/package/@types/node)

# Credits
These definitions were written by [Bart van der Schoor](https://github.com/Bartvds), [Georgios Valotasios](https://github.com/valotas), [TeamworkGuy2](https://github.com/TeamworkGuy2), and [Alorel](https://github.com/Alorel).

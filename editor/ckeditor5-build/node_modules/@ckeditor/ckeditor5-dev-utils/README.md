CKEditor 5 development utilities library
========================================

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-dev-utils.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-utils)
[![CircleCI](https://circleci.com/gh/ckeditor/ckeditor5-dev.svg?style=shield)](https://app.circleci.com/pipelines/github/ckeditor/ckeditor5-dev?branch=master)

Utils for [CKEditor 5](https://ckeditor.com) development tools packages.

More information about development tools packages can be found at the following URL: <https://github.com/ckeditor/ckeditor5-dev>.

## Available modules

Note: Not all modules exported by this package are covered in this documentation.

### Logger

Logger functions with configurable verbosity.

There are three levels of verbosity:

1. `info` - all messages will be logged,
2. `warning` - warning and errors will be logged,
3. `error` - only errors will be logged.

Usage:

```js
const logger = require( '@ckeditor/ckeditor5-dev-utils' ).logger;

// All messages will be displayed.
const infoLog = logger( 'info' );
infoLog.info( 'Message.' );
infoLog.warning( 'Message.' );
infoLog.error( 'Message.' );

// This First message won't be displayed..
const warningLog = logger( 'warning' );
warningLog.info( 'Message.' );
warningLog.warning( 'Message.' );
warningLog.error( 'Message.' );

// Only the last message will be displayed.
const errorLog = logger( 'error' );
errorLog.info( 'Message.' );
errorLog.warning( 'Message.' );
errorLog.error( 'Message.' );
```

## Changelog

See the [`CHANGELOG.md`](https://github.com/ckeditor/ckeditor5-dev/blob/master/packages/ckeditor5-dev-utils/CHANGELOG.md) file.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file.

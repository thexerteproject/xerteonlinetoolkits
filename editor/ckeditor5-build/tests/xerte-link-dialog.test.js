import assert from 'node:assert/strict';
import test from 'node:test';
import { composeHref, splitHref } from '../src/plugins/xerte-link-utils.js';

test( 'splits the supported link protocols case-insensitively', () => {
	assert.deepEqual( splitHref( 'https://example.com/a' ), { protocol: 'https://', address: 'example.com/a' } );
	assert.deepEqual( splitHref( 'HTTP://example.com' ), { protocol: 'http://', address: 'example.com' } );
	assert.deepEqual( splitHref( 'mailto:person@example.com' ), { protocol: 'mailto:', address: 'person@example.com' } );
} );

test( 'keeps relative and unsupported URLs intact', () => {
	assert.deepEqual( splitHref( 'media/file.pdf' ), { protocol: '', address: 'media/file.pdf' } );
	assert.deepEqual( splitHref( 'ftp://example.com/file' ), { protocol: '', address: 'ftp://example.com/file' } );
} );

test( 'does not duplicate a protocol pasted into the address field', () => {
	assert.equal( composeHref( 'https://', 'https://example.com' ), 'https://example.com' );
	assert.equal( composeHref( 'https://', 'mailto:person@example.com' ), 'mailto:person@example.com' );
	assert.equal( composeHref( 'https://', 'example.com' ), 'https://example.com' );
} );

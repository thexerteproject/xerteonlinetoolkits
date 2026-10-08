import assert from 'node:assert/strict';
import test from 'node:test';
import { parseXertePageId } from '../src/plugins/xerte-page-link-utils.js';

test( 'parses legacy Xerte page links without evaluating them', () => {
	assert.equal( parseXertePageId( "x_navigateToPage(false,{type:'linkID',ID:'PG123'}); return false;" ), 'PG123' );
	assert.equal( parseXertePageId( 'x_navigateToPage( false, { type: "linkID", ID: "PG456" } );' ), 'PG456' );
	assert.equal( parseXertePageId( 'x_navigateToPage(true,{ID:"PG123"})' ), null );
	assert.equal( parseXertePageId( 'alert("x_navigateToPage")' ), null );
	assert.equal( parseXertePageId( null ), null );
} );

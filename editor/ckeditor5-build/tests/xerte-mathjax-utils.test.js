import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMathJaxInput, parseMathJaxValue, serializeMathJaxValue } from '../src/plugins/xerte-mathjax-utils.js';

const cases = [
	[ '\\(x^2 + y^2\\)', { source: 'x^2 + y^2', syntax: 'tex', display: 'inline' } ],
	[ '\\[x^2 + y^2\\]', { source: 'x^2 + y^2', syntax: 'tex', display: 'block' } ],
	[ '`sqrt(4)`', { source: 'sqrt(4)', syntax: 'asciimath', display: 'inline' } ],
	[ '<math><mi>x</mi></math>', { source: '<mi>x</mi>', syntax: 'mathml', display: 'inline' } ],
	[ '<math display="block"><mi>x</mi></math>', { source: '<mi>x</mi>', syntax: 'mathml', display: 'block' } ]
];

for ( const [ legacyValue, expected ] of cases ) {
	test( `round trips ${ expected.syntax } ${ expected.display } equations`, () => {
		assert.deepEqual( parseMathJaxValue( legacyValue ), expected );
		assert.equal( serializeMathJaxValue( expected ), legacyValue );
	} );
}

test( 'unrecognised legacy values retain their source and use CKEditor 4 defaults', () => {
	assert.deepEqual( parseMathJaxValue( 'x + y' ), {
		source: 'x + y', syntax: 'tex', display: 'block'
	} );
} );

test( 'removes delimiters pasted into the source field instead of wrapping them twice', () => {
	assert.deepEqual( normalizeMathJaxInput( '\\(4+4/2=4\\)', 'tex', 'block' ), {
		source: '4+4/2=4', syntax: 'tex', display: 'inline'
	} );
	assert.deepEqual( normalizeMathJaxInput( '<math display="block"><mi>x</mi></math>', 'tex', 'inline' ), {
		source: '<mi>x</mi>', syntax: 'mathml', display: 'block'
	} );
	assert.deepEqual( normalizeMathJaxInput( '\\\\(4+4/2=4\\\\)', 'tex', 'block' ), {
		source: '4+4/2=4', syntax: 'tex', display: 'inline'
	} );
} );

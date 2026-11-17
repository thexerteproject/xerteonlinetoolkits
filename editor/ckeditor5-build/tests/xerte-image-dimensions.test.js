import assert from 'node:assert/strict';
import test from 'node:test';
import {
	displayDimension,
	normalizeDimension,
	proportionalDimension
} from '../src/plugins/xerte-image-dimensions.js';

test( 'normalizes pixel and percentage dimensions for CKEditor model attributes', () => {
	assert.equal( normalizeDimension( '400' ), '400px' );
	assert.equal( normalizeDimension( '400px' ), '400px' );
	assert.equal( normalizeDimension( '37.5%' ), '37.5%' );
} );

test( 'rejects empty, zero, negative and unsupported dimensions', () => {
	for ( const value of [ '', '0', '-20', '12em', 'auto', '50%%' ] ) {
		assert.equal( normalizeDimension( value ), null );
	}
} );

test( 'displays pixels without a suffix and retains percentages', () => {
	assert.equal( displayDimension( '640px' ), '640' );
	assert.equal( displayDimension( '80%' ), '80%' );
	assert.equal( displayDimension( 'auto' ), '' );
} );

test( 'preserves ratio for pixels and mirrors percentage sizing', () => {
	assert.equal( proportionalDimension( '400px', 800, 600 ), '300' );
	assert.equal( proportionalDimension( '50%', 800, 600 ), '50%' );
	assert.equal( proportionalDimension( '400', 0, 0 ), '' );
} );


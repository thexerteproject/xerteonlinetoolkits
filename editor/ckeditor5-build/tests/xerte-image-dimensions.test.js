import assert from 'node:assert/strict';
import test from 'node:test';
import {
	displayDimension,
	normalizeDimension,
	proportionalDimension
} from '../src/plugins/xerte-image-dimensions.js';

test( 'normalizes pixel and percentage dimensions for CKEditor model attributes', () => {
	assert.equal( normalizeDimension( '50' ), '50%' );
	assert.equal( normalizeDimension( '400px' ), '400px' );
	assert.equal( normalizeDimension( '37.5%' ), '37.5%' );
	assert.equal( normalizeDimension( '0.5' ), '0.5%' );
} );

test( 'rejects empty, zero, negative and unsupported dimensions', () => {
	for ( const value of [ '', '0', '-20', '12em', 'auto', '50%%' ] ) {
		assert.equal( normalizeDimension( value ), null );
	}
} );

test( 'preserves saved pixel and percentage units when displaying and saving dimensions', () => {
	assert.equal( displayDimension( '640px' ), '640px' );
	assert.equal( displayDimension( 640 ), '640px' );
	assert.equal( displayDimension( '80%' ), '80%' );
	assert.equal( displayDimension( 'auto' ), '' );
	for ( const value of [ '640px', '37.5%', '0.5%' ] ) {
		assert.equal( normalizeDimension( displayDimension( value ) ), value );
	}
} );

test( 'preserves pixel ratios and leaves the other axis automatic for percentage sizing', () => {
	assert.equal( proportionalDimension( '400px', 800, 600 ), '300px' );
	assert.equal( proportionalDimension( '50%', 800, 600 ), '' );
	assert.equal( proportionalDimension( '50', 800, 600 ), '' );
	assert.equal( proportionalDimension( '400px', 0, 0 ), '' );
} );


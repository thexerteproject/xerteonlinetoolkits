import assert from 'node:assert/strict';
import test from 'node:test';
import {
	normalizeLightbox,
	readLightboxAttributes,
	writeLightboxAttributes
} from '../src/plugins/xerte-lightbox-utils.js';

test( 'reads a legacy target as an iframe lightbox', () => {
	assert.deepEqual( readLightboxAttributes( { target: '_lightbox' } ), {
		type: 'iframe', alt: '', width: null, height: null, extraStyles: []
	} );
} );

test( 'reads old dimension attributes', () => {
	const settings = readLightboxAttributes( {
		'data-featherlight': 'iframe',
		'data-featherlight-iframe-width': '640',
		'data-featherlight-iframe-height': '480'
	} );

	assert.deepEqual( settings.width, { value: '640', unit: 'px' } );
	assert.deepEqual( settings.height, { value: '480', unit: 'px' } );
} );

test( 'style dimensions take precedence and unrelated styles survive', () => {
	const settings = readLightboxAttributes( {
		'data-featherlight': 'iframe',
		'data-featherlight-iframe-width': '640',
		'data-featherlight-iframe-style': 'display:block; width:90%; height:85vh; border:none'
	} );

	assert.deepEqual( settings.width, { value: '90', unit: '%' } );
	assert.deepEqual( settings.height, { value: '85', unit: 'vh' } );
	assert.deepEqual( settings.extraStyles, [ 'display:block', 'border:none' ] );
	assert.equal(
		writeLightboxAttributes( settings )[ 'data-featherlight-iframe-style' ],
		'display:block;border:none;width:90%;height:85vh'
	);
} );

test( 'image settings discard iframe-only values', () => {
	assert.deepEqual( normalizeLightbox( {
		type: 'image', alt: 'A description',
		width: { value: '90', unit: '%' }, extraStyles: [ 'border:none' ]
	} ), {
		type: 'image', alt: 'A description', width: null, height: null, extraStyles: []
	} );

	assert.deepEqual( writeLightboxAttributes( { type: 'image', alt: 'A description' } ), {
		'data-featherlight': 'image',
		'data-image-alt': 'A description'
	} );
} );

test( 'iframe settings retain legacy image alt text', () => {
	const settings = readLightboxAttributes( {
		'data-featherlight': 'iframe',
		'data-image-alt': 'Retained by CKEditor 4'
	} );

	assert.equal( settings.alt, 'Retained by CKEditor 4' );
	assert.equal(
		writeLightboxAttributes( settings )[ 'data-image-alt' ],
		'Retained by CKEditor 4'
	);
} );

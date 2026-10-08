/**
 * Helpers for converting legacy Xerte lightbox attributes.
 * @license Apache-2.0
 */

const DIMENSION_PATTERN = /^(\d+(?:\.\d+)?)\s*(%|px|vw|vh)?$/i;

function readAttribute( source, name ) {
	if ( !source ) {
		return null;
	}

	if ( typeof source.getAttribute === 'function' ) {
		return source.getAttribute( name );
	}

	return source[ name ] ?? null;
}

function parseDimension( value, defaultUnit = 'px' ) {
	const match = String( value || '' ).trim().match( DIMENSION_PATTERN );
	if ( !match ) {
		return null;
	}

	return {
		value: match[ 1 ],
		unit: ( match[ 2 ] || defaultUnit ).toLowerCase()
	};
}

function parseStyle( styleText ) {
	const dimensions = {};
	const otherDeclarations = [];

	for ( const declaration of String( styleText || '' ).split( ';' ) ) {
		const trimmed = declaration.trim();
		if ( !trimmed ) {
			continue;
		}

		const colon = trimmed.indexOf( ':' );
		if ( colon < 0 ) {
			otherDeclarations.push( trimmed );
			continue;
		}

		const property = trimmed.slice( 0, colon ).trim().toLowerCase();
		const value = trimmed.slice( colon + 1 ).trim();
		if ( property === 'width' || property === 'height' ) {
			const dimension = parseDimension( value, '%' );
			if ( dimension ) {
				dimensions[ property ] = dimension;
				continue;
			}
		}

		otherDeclarations.push( trimmed );
	}

	return { dimensions, otherDeclarations };
}

export function readLightboxAttributes( source ) {
	const featherlight = readAttribute( source, 'data-featherlight' );
	const legacyTarget = readAttribute( source, 'target' ) === '_lightbox';

	if ( !featherlight && !legacyTarget ) {
		return null;
	}

	const type = String( featherlight || 'iframe' ).toLowerCase();
	const style = parseStyle( readAttribute( source, 'data-featherlight-iframe-style' ) );
	const width = style.dimensions.width || parseDimension(
		readAttribute( source, 'data-featherlight-iframe-width' )
	);
	const height = style.dimensions.height || parseDimension(
		readAttribute( source, 'data-featherlight-iframe-height' )
	);

	return normalizeLightbox( {
		type: type === 'image' ? 'image' : 'iframe',
		alt: readAttribute( source, 'data-image-alt' ) || '',
		width,
		height,
		extraStyles: style.otherDeclarations
	} );
}

export function normalizeLightbox( settings ) {
	if ( !settings ) {
		return null;
	}

	const type = settings.type === 'image' ? 'image' : 'iframe';
	return {
		type,
		// CKEditor 4 retained this value while switching between lightbox types.
		alt: String( settings.alt || '' ),
		width: type === 'iframe' ? normalizeDimension( settings.width ) : null,
		height: type === 'iframe' ? normalizeDimension( settings.height ) : null,
		extraStyles: type === 'iframe' && Array.isArray( settings.extraStyles ) ?
			settings.extraStyles.map( value => String( value ).trim() ).filter( Boolean ) : []
	};
}

function normalizeDimension( dimension ) {
	if ( !dimension || dimension.value === '' ) {
		return null;
	}

	return parseDimension( `${ dimension.value }${ dimension.unit || '%' }`, '%' );
}

export function writeLightboxAttributes( settings ) {
	const normalized = normalizeLightbox( settings );
	if ( !normalized ) {
		return {};
	}

	const attributes = { 'data-featherlight': normalized.type };
	if ( normalized.alt ) {
		attributes[ 'data-image-alt' ] = normalized.alt;
	}
	if ( normalized.type === 'image' ) {
		return attributes;
	}

	const styles = [ ...normalized.extraStyles ];
	for ( const property of [ 'width', 'height' ] ) {
		const dimension = normalized[ property ];
		if ( dimension ) {
			styles.push( `${ property }:${ dimension.value }${ dimension.unit }` );
		}
	}

	if ( styles.length ) {
		attributes[ 'data-featherlight-iframe-style' ] = styles.join( ';' );
	}

	return attributes;
}

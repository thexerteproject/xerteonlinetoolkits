/**
 * Pure image-dimension helpers shared by the properties UI and tests.
 * @license Apache-2.0
 */

export function displayDimension( value ) {
	// Saved unitless width/height attributes are intrinsic pixel dimensions.
	// Show their unit so saving a properties dialog cannot reinterpret them as %.
	return normalizeDimension( value, 'px' ) || '';
}

export function normalizeDimension( value, defaultUnit = '%' ) {
	const match = String( value || '' ).trim().match( /^(\d+(?:\.\d+)?)(px|%)?$/i );
	if ( !match || Number( match[ 1 ] ) <= 0 ) return null;
	return `${ match[ 1 ] }${ match[ 2 ]?.toLowerCase() || defaultUnit }`;
}

export function proportionalDimension( value, sourceNatural, targetNatural ) {
	const dimension = normalizeDimension( value );
	// Percentage width and height have different containing dimensions. Let
	// the other axis size automatically to preserve the image's proportions.
	if ( !dimension || dimension.endsWith( '%' ) ) return '';
	if ( !sourceNatural || !targetNatural ) return '';
	return `${ Math.round( parseFloat( dimension ) * targetNatural / sourceNatural ) }px`;
}


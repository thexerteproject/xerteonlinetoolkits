/**
 * Pure image-dimension helpers shared by the properties UI and tests.
 * @license Apache-2.0
 */

export function displayDimension( value ) {
	const match = String( value || '' ).trim().match( /^([1-9]\d*(?:\.\d+)?)(px|%)?$/i );
	if ( !match ) return '';
	return match[ 2 ]?.toLowerCase() === '%' ? `${ match[ 1 ] }%` : match[ 1 ];
}

export function normalizeDimension( value ) {
	const match = String( value || '' ).trim().match( /^([1-9]\d*(?:\.\d+)?)(px|%)?$/i );
	if ( !match ) return null;
	return `${ match[ 1 ] }${ match[ 2 ]?.toLowerCase() === '%' ? '%' : 'px' }`;
}

export function proportionalDimension( value, sourceNatural, targetNatural ) {
	const match = String( value || '' ).trim().match( /^([1-9]\d*(?:\.\d+)?)(px|%)?$/i );
	if ( !match ) return '';
	if ( match[ 2 ]?.toLowerCase() === '%' ) return `${ match[ 1 ] }%`;
	if ( !sourceNatural || !targetNatural ) return '';
	return String( Math.round( Number( match[ 1 ] ) * targetNatural / sourceNatural ) );
}


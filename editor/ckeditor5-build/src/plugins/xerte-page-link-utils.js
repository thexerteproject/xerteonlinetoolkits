/** Parse the legacy page ID without executing the link's inline handler. @license Apache-2.0 */
export function parseXertePageId( onclick ) {
	if ( typeof onclick !== 'string' ) {
		return null;
	}
	const match = onclick.match( /x_navigateToPage\(\s*false\s*,\s*\{[^}]*\bID\s*:\s*(['"])([^'"]+)\1/ );
	return match ? match[ 2 ] : null;
}

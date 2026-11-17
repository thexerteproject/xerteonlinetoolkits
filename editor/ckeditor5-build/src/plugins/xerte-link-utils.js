/** @license Apache-2.0 */
export const LINK_PROTOCOLS = [ 'https://', 'http://', 'mailto:' ];

export function splitHref( href ) {
	const value = String( href || '' ).trim();
	const protocol = LINK_PROTOCOLS.find( candidate => value.toLowerCase().startsWith( candidate ) );
	return protocol ? { protocol, address: value.slice( protocol.length ) } :
		{ protocol: '', address: value };
}

export function composeHref( protocol, address ) {
	const value = String( address || '' ).trim();
	if ( /^[a-z][a-z\d+.-]*:/i.test( value ) || /^(?:\/\/|\/|#|\?)/.test( value ) ) return value;
	return String( protocol || '' ) + value;
}

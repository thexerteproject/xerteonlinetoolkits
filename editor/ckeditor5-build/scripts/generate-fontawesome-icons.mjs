/**
 * Generate the CKEditor picker catalogue from the Font Awesome version directly.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const buildDirectory = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const commonDirectory = path.resolve( buildDirectory, '../../modules/common' );
const fontAwesomeDirectories = fs.readdirSync( commonDirectory, { withFileTypes: true } )
	.filter( entry => entry.isDirectory() && /^fontawesome-\d+\.\d+\.\d+$/.test( entry.name ) )
	.map( entry => ( { name: entry.name, version: entry.name.replace( 'fontawesome-', '' ) } ) )
	.sort( ( left, right ) => right.version.localeCompare( left.version, undefined, { numeric: true } ) );

if ( !fontAwesomeDirectories.length ) {
	throw new Error( 'No modules/common/fontawesome-x.y.z directory found.' );
}

const selected = fontAwesomeDirectories[ 0 ];
const metadataPath = path.join( commonDirectory, selected.name, 'metadata/icons.json' );
const metadata = JSON.parse( fs.readFileSync( metadataPath, 'utf8' ) );
const prefix = { solid: 'fas', regular: 'far', brands: 'fab' };
const icons = [];

for ( const [ name, icon ] of Object.entries( metadata ) ) {
	for ( const style of icon.free || [] ) {
		if ( !prefix[ style ] ) continue;
		icons.push( {
			classes: `${ prefix[ style ] } fa-${ name }`,
			name,
			label: icon.label || name,
			search: [ name, icon.label, ...( icon.search?.terms || [] ) ].filter( Boolean ).join( ' ' ).toLowerCase()
		} );
	}
}

icons.sort( ( left, right ) => left.name.localeCompare( right.name ) || left.classes.localeCompare( right.classes ) );
const outputPath = path.join( buildDirectory, 'src/fontawesome-icons.json' );
fs.writeFileSync( outputPath, JSON.stringify( { version: selected.version, icons } ) + '\n' );
console.log( `Generated ${ icons.length } Font Awesome ${ selected.version } picker entries.` );

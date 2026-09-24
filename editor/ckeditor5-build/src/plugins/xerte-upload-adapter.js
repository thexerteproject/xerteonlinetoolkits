/**
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';

export class XerteUploadAdapter extends Plugin {
	static get requires() {
		return [ 'FileRepository' ];
	}

	static get pluginName() {
		return 'XerteUploadAdapter';
	}

	init() {
		const uploadUrl = this.editor.config.get( 'xerteUploadUrl' );
		if ( !uploadUrl ) {
			return;
		}

		this.editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => ( {
			upload: () => this._upload( loader, uploadUrl ),
			abort: () => {}
		} );
	}

	_upload( loader, uploadUrl ) {
		return loader.file.then( file => new Promise( ( resolve, reject ) => {
			const data = new FormData();
			data.append( 'upload', file );
			const xhr = new XMLHttpRequest();
			xhr.open( 'POST', uploadUrl, true );
			xhr.onload = () => {
				try {
					const res = JSON.parse( xhr.responseText );
					if ( res.uploaded && res.url ) {
						resolve( { default: res.url } );
					} else {
						reject( res.error || 'Upload failed' );
					}
				} catch ( e ) {
					reject( e );
				}
			};
			xhr.onerror = () => reject( new Error( 'Network error' ) );
			xhr.send( data );
		} ) );
	}
}

// The legacy audio endpoint accepts a data URL rather than the image endpoint's
// multipart `upload` field. Keep both transports here and return a plain URL.
export function uploadAudio( file, endpoint ) {
	const extension = file.name.split( '.' ).pop().toLowerCase();
	if ( ![ 'mp3', 'ogg', 'wav', 'webm' ].includes( extension ) ) throw new Error( 'Choose an MP3, OGG, WAV or WebM audio file.' );
	return new Promise( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onerror = () => reject( new Error( 'Could not read the audio file.' ) );
		reader.onload = async () => {
			try {
				const data = new FormData();
				data.append( 'recorded_data', reader.result );
				data.append( 'filename', file.name.slice( 0, -( extension.length + 1 ) ).replace( /[^a-zA-Z0-9_-]/g, '_' ) || 'audio' );
				data.append( 'extension', extension );
				const response = await fetch( endpoint, { method: 'POST', body: data } );
				const result = await response.json();
				if ( !response.ok || result.status !== 'success' || !result.url ) throw new Error( result.message || 'Audio upload failed.' );
				resolve( result.url );
			} catch ( error ) { reject( error ); }
		};
		reader.readAsDataURL( file );
	} );
}

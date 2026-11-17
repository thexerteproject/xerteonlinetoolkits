/** English overrides for Xerte's CKEditor 5 extensions. @license Apache-2.0 */
( function( translations ) {
	const locale = translations.en = translations.en || { dictionary: {}, getPluralForm: n => n !== 1 };
	locale.dictionary = Object.assign( locale.dictionary || {}, {
		'Choose language': 'Set language',
		'Use default text colour': 'Use default text colour'
	} );
} )( globalThis.CKEDITOR_TRANSLATIONS = globalThis.CKEDITOR_TRANSLATIONS || {} );

Object.assign( globalThis.CKEDITOR_TRANSLATIONS.en.dictionary, {
	'Image Properties': 'Image Properties', 'URL': 'URL', 'Browse Server': 'Browse Server', 'Alternative Text': 'Alternative Text',
	'Lock ratio': 'Lock Ratio', 'Reset size': 'Reset Size', 'Align Left': 'Align Left', 'Align Center': 'Align Center', 'Align Right': 'Align Right',
	'Captioned image': 'Captioned image', 'OK': 'OK'
} );

Object.assign( globalThis.CKEDITOR_TRANSLATIONS.en.dictionary, {
	"Resize editor (drag or use arrow keys)": "Drag to resize. Keyboard: Tab to this handle, then use Up/Down."
} );

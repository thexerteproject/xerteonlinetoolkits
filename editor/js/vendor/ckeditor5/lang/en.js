/** English overrides for Xerte's CKEditor 5 extensions. @license Apache-2.0 */
( function( translations ) {
	const locale = translations.en = translations.en || { dictionary: {}, getPluralForm: n => n !== 1 };
	locale.dictionary = Object.assign( locale.dictionary || {}, {
		'Choose language': 'Set language'
	} );
} )( globalThis.CKEDITOR_TRANSLATIONS = globalThis.CKEDITOR_TRANSLATIONS || {} );

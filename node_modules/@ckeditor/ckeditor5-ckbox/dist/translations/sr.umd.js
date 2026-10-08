/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"Open file manager":"Oтвори управљач датотекама.","Cannot determine a category for the uploaded file.":"Није могуће одредити категорију за отпремлјену датотеку.","Cannot access default workspace.":"Nije moguće pristupiti podrazumevanom radnom prostoru.","You have no image editing permissions.":"Nemate dozvole za uređivanje slike.","Edit image":"Uredi sliku","Processing the edited image.":"Obrađivanje uređene slike.","Server failed to process the image.":"Server nije uspeo da obradi sliku.","Failed to determine category of edited image.":"Određivanje kategorije uređene slike nije uspelo."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'jv' ]: { dictionary, getPluralForm } } = {"jv":{"dictionary":{"Insert image or file":"Tambahaken berkas utawi gambar","Could not obtain resized image URL.":"Mboten saged mundhut URL gambar ingkang dipunebah ukuranipun","Selecting resized image failed":"Gagal milih gambar ingkang dipunebah ukuranipun","Could not insert image at the current position.":"Mboten saged mlebetaken gambar wonten papan menika","Inserting image failed":"Gagal mlebetaken gambar"},getPluralForm(n){return (n !== 0);}}};
e[ 'jv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'jv' ].dictionary = Object.assign( e[ 'jv' ].dictionary, dictionary );
e[ 'jv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

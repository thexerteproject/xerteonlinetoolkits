/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Insert image or file":"Sisesta pilt või fail","Could not obtain resized image URL.":"Muudetud suurusega pildi URL-i hankimine ebaõnnestus.","Selecting resized image failed":"Muudetud suurusega pildi valimine ebaõnnestus","Could not insert image at the current position.":"Pildi sisestamine praegusesse kohta ebaõnnestus.","Inserting image failed":"Pildi sisestamine ebaõnnestus"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

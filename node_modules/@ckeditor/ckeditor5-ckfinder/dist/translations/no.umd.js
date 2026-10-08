/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Insert image or file":"Sett inn bilde eller fil","Could not obtain resized image URL.":"Kunne ikke finne URL for bilde med endret størrelse.","Selecting resized image failed":"Kunne ikke velge bilde med endret størrelse","Could not insert image at the current position.":"Kunne ikke sette inn bilde på gjeldende posisjon.","Inserting image failed":"Innsetting av bilde mislyktes"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

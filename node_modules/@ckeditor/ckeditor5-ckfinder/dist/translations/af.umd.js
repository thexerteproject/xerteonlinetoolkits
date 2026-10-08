/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'af' ]: { dictionary, getPluralForm } } = {"af":{"dictionary":{"Insert image or file":"Voeg beeld of lêer in","Could not obtain resized image URL.":"Kon nie die beeld URL vir die aanpassing kry nie.","Selecting resized image failed":"Kon nie die beeld se grootte verander nie","Could not insert image at the current position.":"Beeld kan nie in die posisie toegevoeg word nie.","Inserting image failed":"Beeld kan nie toegevoeg word nie"},getPluralForm(n){return (n != 1);}}};
e[ 'af' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'af' ].dictionary = Object.assign( e[ 'af' ].dictionary, dictionary );
e[ 'af' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

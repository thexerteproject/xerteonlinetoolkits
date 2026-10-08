/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Insert image or file":"Indsæt billede eller fil","Could not obtain resized image URL.":"Kunne ikke hente URL på ændret billede.","Selecting resized image failed":"Valg af ændret billede fejlede","Could not insert image at the current position.":"Kunne ikke indsætte billede på aktuel position.","Inserting image failed":"Indsætning af billede fejlede"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

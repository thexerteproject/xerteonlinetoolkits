/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Insert image or file":"Infoga bild eller fil","Could not obtain resized image URL.":"Kunde inte nå URL:en för storleksförändrad bild.","Selecting resized image failed":"Misslyckades välja storleksförändrad bild","Could not insert image at the current position.":"Kunde inte infoga bild på aktuell plats.","Inserting image failed":"Misslyckades med att infoga bild"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

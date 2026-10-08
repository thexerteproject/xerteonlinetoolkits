/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Insert image or file":"Voeg afbeelding of bestand in","Could not obtain resized image URL.":"Het is niet gelukt de geschaalde afbeelding URL te verkrijgen.","Selecting resized image failed":"De geschaalde afbeelding selecteren is niet gelukt","Could not insert image at the current position.":"Kan afbeelding niet op de huidige positie invoegen.","Inserting image failed":"Afbeelding invoegen niet gelukt"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

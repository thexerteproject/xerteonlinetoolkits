/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Unlink":"Verwijder link","Link":"Link","Link URL":"Link URL","Link URL must not be empty.":"URL-link mag niet leeg zijn.","Link image":"Link afbeelding","Edit link":"Bewerk link","Open link in new tab":"Open link in nieuw tabblad","Open in a new tab":"Open een nieuw tabblad","Downloadable":"Downloadbaar","Create link":"Creëer link","Move out of a link":"Uit een link gaan","Link properties":"Linkeigenschappen","Displayed text":"Weergegeven tekst","No links available":"Geen links beschikbaar"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Unlink":"Fjern link","Link":"Link","Link URL":"Link URL","Link URL must not be empty.":"Link-URL må ikke være tom.","Link image":"Link-billede","Edit link":"Redigér link","Open link in new tab":"Åben link i ny fane","Open in a new tab":"Åben i ny fane","Downloadable":"Kan downloades","Create link":"Opret link","Move out of a link":"Flyt ud af et link","Link properties":"Linkegenskaber","Displayed text":"Vist tekst","No links available":"Ingen links tilgængelige"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Unlink":"Ta bort länk","Link":"Länk","Link URL":"Länkens URL","Link URL must not be empty.":"Länkens URL får inte vara tom.","Link image":"Länka bild","Edit link":"Redigera länk","Open link in new tab":"Öppna länk i ny flik","Open in a new tab":"Öppna i en ny flik","Downloadable":"Nedladdningsbar","Create link":"Skapa länk","Move out of a link":"Flytta bort från länken","Link properties":"Länkegenskaper","Displayed text":"Visad text","No links available":"Inga länkar tillgängliga"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

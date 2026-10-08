/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Unlink":"Link entfernen","Link":"Link","Link URL":"Linkadresse","Link URL must not be empty.":"Die Link-URL darf nicht leer sein.","Link image":"Bild verlinken","Edit link":"Link bearbeiten","Open link in new tab":"Link im neuen Tab öffnen","Open in a new tab":"In neuem Tab öffnen","Downloadable":"Herunterladbar","Create link":"Link erstellen","Move out of a link":"Linkauswahl aufheben","Link properties":"Linkeigenschaften","Displayed text":"Angezeigter Text","No links available":"Keine Links verfügbar"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

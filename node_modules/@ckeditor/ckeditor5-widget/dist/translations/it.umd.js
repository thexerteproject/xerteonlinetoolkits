/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Widget toolbar":"Barra degli strumenti del widget","Insert paragraph before block":"Inserisci paragrafo prima di blocco","Insert paragraph after block":"Inserisci paragrafo dopo blocco","Press Enter to type after or press Shift + Enter to type before the widget":"Premere Invio per inserire dopo il widget o premere Maiusc + Invio per inserire prima del widget","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Tasti che possono essere utilizzati quando viene selezionato un widget (ad esempio: immagine, tabella ecc.)","Insert a new paragraph directly after a widget":"Inserisce un nuovo paragrafo direttamente dopo un widget","Insert a new paragraph directly before a widget":"Inserisce un nuovo paragrafo direttamente prima di un widget","Move the caret to allow typing directly before a widget":"Sposta il cursore per consentire la digitazione direttamente prima di un widget","Move the caret to allow typing directly after a widget":"Sposta il cursore per consentire la digitazione direttamente dopo un widget","Move focus from an editable area back to the parent widget":"Sposta lo stato attivo da un'area modificabile al widget principale"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

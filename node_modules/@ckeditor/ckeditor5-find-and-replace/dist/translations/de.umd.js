/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Find and replace":"Suchen und ersetzen","Find in text…":"In Text suchen…","Find":"Suchen","Previous result":"Vorheriges Ergebnis","Next result":"Nächstes Ergebnis","Replace":"Ersetzen","Replace all":"Alle ersetzen","Match case":"Groß-/Kleinschreibung beachten","Whole words only":"Nur ganze Wörter","Replace with…":"Ersetzen durch…","Text to find must not be empty.":"Der Suchtext darf nicht leer sein.","Tip: Find some text first in order to replace it.":"Tipp: Zuerst nach Text suchen um diesen zu ersetzen.","Advanced options":"Erweiterte Optionen","Find in the document":"Dokument durchsuchen"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

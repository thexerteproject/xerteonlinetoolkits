/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bs' ]: { dictionary, getPluralForm } } = {"bs":{"dictionary":{"Find and replace":"Pronađi i zamijeni","Find in text…":"Pronađi u tekstu","Find":"Pronađi","Previous result":"Prethodni rezultat","Next result":"","Replace":"Zamijeni","Replace all":"Zamijeni sve","Match case":"Podudaranje","Whole words only":"Samo cijele riječi","Replace with…":"Zamijeni sa...","Text to find must not be empty.":"Unesite tekst za pretragu.","Tip: Find some text first in order to replace it.":"","Advanced options":"","Find in the document":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'bs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bs' ].dictionary = Object.assign( e[ 'bs' ].dictionary, dictionary );
e[ 'bs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

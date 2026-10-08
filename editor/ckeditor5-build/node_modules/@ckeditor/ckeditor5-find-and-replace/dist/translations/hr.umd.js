/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hr' ]: { dictionary, getPluralForm } } = {"hr":{"dictionary":{"Find and replace":"Pronađi i zamijeni","Find in text…":"Pronađi u tekstu...","Find":"Pronađi","Previous result":"Prethodni rezultat","Next result":"Sljedeći rezultat","Replace":"Zamijeni","Replace all":"Zamijeni sve","Match case":"Točna velika/mala slova","Whole words only":"Samo cijele riječi","Replace with…":"Zamijeni sa....","Text to find must not be empty.":"Morate upisati tekst za traženje.","Tip: Find some text first in order to replace it.":"Savjet: Pronađite neki tekst kako bi ga zamijenili.","Advanced options":"","Find in the document":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'hr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hr' ].dictionary = Object.assign( e[ 'hr' ].dictionary, dictionary );
e[ 'hr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

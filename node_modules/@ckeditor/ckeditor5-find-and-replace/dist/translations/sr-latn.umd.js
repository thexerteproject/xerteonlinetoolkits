/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr-latn' ]: { dictionary, getPluralForm } } = {"sr-latn":{"dictionary":{"Find and replace":"Nađji i zameni","Find in text…":"Pronađji u tekstu…","Find":"Pronađji","Previous result":"Prethodni rezultat","Next result":"Sledeći rezultat","Replace":"Zameni","Replace all":"Zameni sve","Match case":"Podudaranje slučaj","Whole words only":"Samo cele reči","Replace with…":"Zameni sa…","Text to find must not be empty.":"Tekst za pronalaženje ne sme biti prazan.","Tip: Find some text first in order to replace it.":"Savet: Prvo pronađjite neki tekst da biste ga zamenili.","Advanced options":"Napredne opcije","Find in the document":"Pronađite u dokumentu"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr-latn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr-latn' ].dictionary = Object.assign( e[ 'sr-latn' ].dictionary, dictionary );
e[ 'sr-latn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Find and replace":"Rasti ir pakeisti","Find in text…":"Surasti tekste...","Find":"Surasti","Previous result":"Buvęs rezultatas","Next result":"Kitas rezultatas","Replace":"Pakeisti","Replace all":"Pakeisti visus","Match case":"Sutapties atvejis","Whole words only":"Tik vientisus žodžius","Replace with…":"Sukeisti su...","Text to find must not be empty.":"Ieškomas tekstas negali būti tuščias.","Tip: Find some text first in order to replace it.":"Patarimas: Pirmiausiai suraskite teksto, jog jį sukeistumėte.","Advanced options":"Išplėstinės pasirinktys","Find in the document":"Ieškoti dokumente"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

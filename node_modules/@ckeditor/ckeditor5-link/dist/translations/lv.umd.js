/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Unlink":"Noņemt Saiti","Link":"Saite","Link URL":"Saites URL","Link URL must not be empty.":"Saites URL lauks nedrīkst būt tukšs.","Link image":"Ievietot saiti uz attēla","Edit link":"Labot Saiti","Open link in new tab":"Atvērt saiti jaunā cilnē","Open in a new tab":"Atvērt jaunā cilnē","Downloadable":"Lejupielādējams","Create link":"Izveidot saiti","Move out of a link":"Iziet no saites","Link properties":"Saites raksturojošie elementi","Displayed text":"Attēlotais teksts","No links available":"Nav pieejama neviena saite"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

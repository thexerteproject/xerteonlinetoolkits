/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Find and replace":"Намери и замени","Find in text…":"Намери в текста...","Find":"Намери","Previous result":"Предишен резултат","Next result":"Следващ резултат","Replace":"Замени","Replace all":"Замени всички","Match case":"Сравни съвпадащ шрифт","Whole words only":"Само цели думи","Replace with…":"Замени с...","Text to find must not be empty.":"Текстът за намиране не трябва да е празен.","Tip: Find some text first in order to replace it.":"Съвет: Първо намерете някакъв текст, за да го замените.","Advanced options":"Разширени опции","Find in the document":"Намиране на документ"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'be' ]: { dictionary, getPluralForm } } = {"be":{"dictionary":{"Find and replace":"Знайсці і замяніць","Find in text…":"Знайсці ў тэксце…","Find":"Знайсці","Previous result":"Папярэдні вынік","Next result":"Наступны вынік","Replace":"Замяніць","Replace all":"Замяніць усё","Match case":"З улікам рэгістру","Whole words only":"Толькі слова цалкам","Replace with…":"Замяніць на…","Text to find must not be empty.":"Тэкст для пошуку не павінен быць пустым.","Tip: Find some text first in order to replace it.":"Падказка: спачатку знайдзіце тэкст, каб замяніць яго.","Advanced options":"Дадатковыя параметры","Find in the document":"Знайсці ў дакуменце"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'be' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'be' ].dictionary = Object.assign( e[ 'be' ].dictionary, dictionary );
e[ 'be' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

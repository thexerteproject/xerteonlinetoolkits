/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Bookmark":"Zakładka","Edit bookmark":"Edytuj zakładkę","Remove bookmark":"Usuń zakładkę","Bookmark name":"Nazwa zakładki","Enter the bookmark name without spaces.":"Wprowadź nazwę zakładki bez spacji.","Bookmark must not be empty.":"Nazwa zakładki nie może być pusta.","Bookmark name cannot contain space characters.":"Nazwa zakładki nie może zawierać spacji.","Bookmark name already exists.":"Zakładka o takiej nazwie już istnieje.","bookmark widget":"widżet zakładek","Bookmark toolbar":"Pasek narzędzi zakładek","Bookmarks":"Zakładki","No bookmarks available.":"Brak dostępnych zakładek.","Scroll to bookmark":"Przewiń do zakładki"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

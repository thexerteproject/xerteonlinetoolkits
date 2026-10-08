/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'be' ]: { dictionary, getPluralForm } } = {"be":{"dictionary":{"Bookmark":"Закладка","Edit bookmark":"Змяніць закладку","Remove bookmark":"Выдаліць закладку","Bookmark name":"Імя закладкі","Enter the bookmark name without spaces.":"Увядзіце імя закладкі без прабелаў.","Bookmark must not be empty.":"Закладка не можа быць пустой.","Bookmark name cannot contain space characters.":"Імя закладкі не можа ўтрымліваць прабелы.","Bookmark name already exists.":"Імя закладкі ўжо існуе.","bookmark widget":"віджэт закладкаў","Bookmark toolbar":"","Bookmarks":"","No bookmarks available.":"","Scroll to bookmark":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'be' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'be' ].dictionary = Object.assign( e[ 'be' ].dictionary, dictionary );
e[ 'be' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

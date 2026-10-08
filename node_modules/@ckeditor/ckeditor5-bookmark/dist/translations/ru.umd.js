/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Bookmark":"Закладка","Edit bookmark":"Изменить закладку","Remove bookmark":"Удалить закладку","Bookmark name":"Имя закладки","Enter the bookmark name without spaces.":"Введите имя закладки без пробелов.","Bookmark must not be empty.":"Закладка не должна быть пустой.","Bookmark name cannot contain space characters.":"Имя закладки не может содержать пробелы.","Bookmark name already exists.":"Имя закладки уже существует.","bookmark widget":"виджет закладок","Bookmark toolbar":"Панель инструментов закладок","Bookmarks":"Закладки","No bookmarks available.":"Нет доступных закладок.","Scroll to bookmark":"Прокрутить до закладки"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

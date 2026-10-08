/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Bold":"Жирний","Italic":"Курсив","Underline":"Підкреслений","Code":"Код","Strikethrough":"Закреслений","Subscript":"Нижній індекс","Superscript":"Верхній індекс","Italic text":"Курсив","Move out of an inline code style":"Вийти зі стилю вбудованого коду","Bold text":"Жирний шрифт","Underline text":"Підкреслений","Strikethrough text":"Закреслений"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

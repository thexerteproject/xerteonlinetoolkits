/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Emoji":"Емодзі","Show all emoji...":"Показати всі емодзі...","Find an emoji (min. 2 characters)":"Знайти емодзі (мін. 2 символи)","No emojis were found matching \"%0\".":"Не знайдено емодзі, які відповідають \"%0\".","Keep on typing to see the emoji.":"Продовжуйте вводити, щоб побачити емодзі.","The query must contain at least two characters.":"Запит повинен містити не менше 2 символів.","Smileys & Expressions":"Смайли та вирази","Gestures & People":"Жести та люди","Animals & Nature":"Тварини та природа","Food & Drinks":"Їжа та напої","Travel & Places":"Подорожі та місця","Activities":"Активності","Objects":"Предмети","Symbols":"Символи","Flags":"Прапори","Select skin tone":"Вибрати тон шкіри","Default skin tone":"Тон шкіри за замовчуванням","Light skin tone":"Світлий тон шкіри","Medium Light skin tone":"Помірно-світлий тон шкіри","Medium skin tone":"Середній тон шкіри","Medium Dark skin tone":"Помірно-темний тон шкіри","Dark skin tone":"Темний тон шкіри","Emoji picker":"Вибір емодзі"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Emoji":"Емотикон","Show all emoji...":"Покажи всички емотикони...","Find an emoji (min. 2 characters)":"Намери емотикон (мин. 2 знака)","No emojis were found matching \"%0\".":"Не бяха намерени емотикони, съответстващи на „%0“.","Keep on typing to see the emoji.":"Продължи да пишеш, за да видиш емотикона.","The query must contain at least two characters.":"Заявката трябва да съдържа поне два знака.","Smileys & Expressions":"Усмивки и емоции","Gestures & People":"Мимики и хора","Animals & Nature":"Животни и природа","Food & Drinks":"Храна и напитки","Travel & Places":"Пътуване и места","Activities":"Дейности","Objects":"Предмети","Symbols":"Символи","Flags":"Знамена","Select skin tone":"Избери цвят на кожата","Default skin tone":"Цвят на кожата по подразбиране","Light skin tone":"Светъл цвят на кожата","Medium Light skin tone":"Средно светъл цвят на кожата","Medium skin tone":"Среден цвят на кожата","Medium Dark skin tone":"Средно тъмен цвят на кожата","Dark skin tone":"Тъмен цвят на кожата","Emoji picker":"Избор на емотикони"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

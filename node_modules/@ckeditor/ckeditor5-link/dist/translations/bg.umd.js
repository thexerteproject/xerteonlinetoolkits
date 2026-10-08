/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bg' ]: { dictionary, getPluralForm } } = {"bg":{"dictionary":{"Unlink":"Премахване на линка","Link":"Линк","Link URL":"Уеб адрес на линка","Link URL must not be empty.":"URL препратката не трябва да е празна.","Link image":"Свържи изображение","Edit link":"Редакция на линк","Open link in new tab":"Отваряне на линк в нов раздел","Open in a new tab":"Отваряне в нов раздел","Downloadable":"Изтегляне","Create link":"Създаване на линк","Move out of a link":"Излизане от линк","Link properties":"Свойства на връзката","Displayed text":"Показан текст","No links available":"Няма налични връзки"},getPluralForm(n){return (n != 1);}}};
e[ 'bg' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bg' ].dictionary = Object.assign( e[ 'bg' ].dictionary, dictionary );
e[ 'bg' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );

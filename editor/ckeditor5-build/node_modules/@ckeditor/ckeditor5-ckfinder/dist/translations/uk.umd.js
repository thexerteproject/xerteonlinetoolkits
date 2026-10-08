/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Insert image or file":"Вставте зображення або файл","Could not obtain resized image URL.":"Не вдалось отримати URL зміненого зображення.","Selecting resized image failed":"Не вдалося вибрати зображення зі зміненим розміром","Could not insert image at the current position.":"Не можливо вставити зображення в поточну позицію.","Inserting image failed":"Не вдалось вставити зображення"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
